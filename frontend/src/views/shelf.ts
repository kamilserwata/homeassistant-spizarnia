import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ItemWithMeta } from "../types";
import { t, batches, getLanguage } from "../i18n";
import { tokens, shared } from "../styles";
import { toast } from "../components/toast";
import { fefoSort } from "../lib/fefo";
import { formatBestBefore } from "../lib/dates";
import { productGlyph } from "../lib/categories";
import "../components/product-tile";
import "../components/category-chips";
import "../components/qty-stepper";
import "../components/bottom-sheet";
import "../components/empty-state";
import "../components/freshness-badge";

type SortKey = "date" | "name" | "qty" | "added";

interface Group {
  key: string;
  productId: string;
  name: string;
  emoji: string;
  image: string | null;
  category: string;
  unit: string;
  totalQty: number;
  items: ItemWithMeta[];
  first: ItemWithMeta;
}

@customElement("spz-view-shelf")
export class SpzViewShelf extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property() shelfId = "";
  @property({ type: Boolean }) narrow = true;

  @state() private items: ItemWithMeta[] = [];
  @state() private category = "";
  @state() private grouped = true;
  @state() private sort: SortKey = "date";
  @state() private sheetItem?: ItemWithMeta;
  @state() private sheetGroup?: Group;
  @state() private consumeQty = 1;
  @state() private loading = true;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .toolbar { display: flex; flex-direction: column; gap: 10px; }
    .toolbar-top { display: flex; align-items: center; gap: 10px; }
    .sort-btn {
      cursor: pointer; display: flex; align-items: center; gap: 6px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 500; font-family: inherit;
    }
    .group-toggle { display: flex; align-items: center; gap: 8px; margin-left: auto;
      font-size: 13px; color: var(--spz-text-2); cursor: pointer; }
    .switch { width: 34px; height: 20px; border-radius: 999px; position: relative;
      background: var(--spz-divider); transition: background .2s; }
    .switch.on { background: var(--spz-primary); }
    .knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
      border-radius: 50%; background: #fff; transition: transform .2s; }
    .switch.on .knob { transform: translateX(14px); }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    @media (min-width: 700px) { .grid { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 1000px) { .grid { grid-template-columns: repeat(5, 1fr); } }
    .sheet-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
    .sheet-glyph { font-size: 44px; }
    .sheet-name { font-size: 20px; font-weight: 500; color: var(--spz-text); }
    .sheet-loc { font-size: 13px; color: var(--spz-text-2); }
    .facts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;
      padding: 14px 0; border-top: 1px solid var(--spz-divider);
      border-bottom: 1px solid var(--spz-divider); margin-bottom: 18px; }
    .fact-k { font-size: 12px; color: var(--spz-text-2); }
    .fact-v { font-size: 15px; color: var(--spz-text); font-weight: 500; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
    .actions .btn { flex: 1; min-width: 120px; }
    .batch-row { display: flex; align-items: center; gap: 12px; padding: 12px 0;
      border-top: 1px solid var(--spz-divider); }
  `];

  private unsub?: () => void;
  private lastSignal = -1;
  connectedCallback() {
    super.connectedCallback();
    this.unsub = this.appState.subscribe(() => {
      if (this.appState.changeSignal !== this.lastSignal) {
        this.lastSignal = this.appState.changeSignal;
        void this.load();
      }
    });
    void this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsub?.();
  }
  updated(changed: Map<string, unknown>) {
    if (changed.has("shelfId")) void this.load();
  }

  private async load() {
    this.loading = true;
    const res = await this.appState.api.listItems({ shelf_id: this.shelfId });
    this.items = res.items;
    this.loading = false;
  }

  private filtered(): ItemWithMeta[] {
    let list = this.items;
    if (this.category) list = list.filter((i) => i.product?.category === this.category);
    return list;
  }

  private buildGroups(): Group[] {
    const map = new Map<string, Group>();
    for (const item of this.filtered()) {
      const pid = item.product_id;
      let g = map.get(pid);
      if (!g) {
        g = {
          key: pid,
          productId: pid,
          name: item.product?.name ?? "",
          emoji: item.product?.emoji ?? "",
          image: item.product?.image ?? null,
          category: item.product?.category ?? "other",
          unit: item.unit,
          totalQty: 0,
          items: [],
          first: item,
        };
        map.set(pid, g);
      }
      g.totalQty += item.quantity;
      g.items.push(item);
    }
    // The representative batch = oldest (FEFO first) for badge + sort.
    for (const g of map.values()) {
      g.items = fefoSort(g.items);
      g.first = g.items[0];
    }
    const groups = [...map.values()];
    return this.sortGroups(groups);
  }

  private sortGroups(groups: Group[]): Group[] {
    const byStatus = (g: Group) =>
      ({ expired: 0, expiring_soon: 1, ok: 2, no_date: 3 })[g.first.status] ?? 9;
    return groups.sort((a, b) => {
      switch (this.sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "qty":
          return b.totalQty - a.totalQty;
        case "added":
          return b.first.added_at.localeCompare(a.first.added_at);
        default:
          return (
            byStatus(a) - byStatus(b) ||
            (a.first.best_before ?? "9").localeCompare(b.first.best_before ?? "9")
          );
      }
    });
  }

  private cycleSort() {
    const order: SortKey[] = ["date", "name", "qty", "added"];
    this.sort = order[(order.indexOf(this.sort) + 1) % order.length];
  }

  private sortLabel(): string {
    return t("shelf.sort_" + this.sort);
  }

  private async quickMinus(item: ItemWithMeta) {
    const name = item.product?.name ?? "";
    await this.appState.api.consume(item.id, 1);
    toast(t("toast.consumed", { product: name, qty: 1 }), async () => {
      await this.appState.api.addItem({
        product_id: item.product_id,
        shelf_id: item.shelf_id,
        quantity: 1,
        unit: item.unit,
        best_before: item.best_before,
        best_before_precision: item.best_before_precision,
      });
    });
  }

  private openGroup(g: Group) {
    if (g.items.length === 1) {
      this.sheetItem = g.items[0];
      this.sheetGroup = undefined;
    } else {
      this.sheetGroup = g;
      this.sheetItem = undefined;
    }
    this.consumeQty = 1;
  }

  private openBatch(item: ItemWithMeta) {
    this.sheetItem = item;
    this.sheetGroup = undefined;
    this.consumeQty = 1;
  }

  private closeSheet() {
    this.sheetItem = undefined;
    this.sheetGroup = undefined;
  }

  private async confirmConsume() {
    const item = this.sheetItem;
    if (!item) return;
    const name = item.product?.name ?? "";
    const qty = this.consumeQty;
    await this.appState.api.consume(item.id, qty);
    this.closeSheet();
    toast(t("toast.consumed", { product: name, qty }), async () => {
      await this.appState.api.addItem({
        product_id: item.product_id,
        shelf_id: item.shelf_id,
        quantity: qty,
        unit: item.unit,
        best_before: item.best_before,
        best_before_precision: item.best_before_precision,
      });
    });
  }

  private async toggleOpened() {
    if (!this.sheetItem) return;
    const res = await this.appState.api.setOpened(this.sheetItem.id, !this.sheetItem.opened);
    this.sheetItem = res.item;
  }

  private async deleteItem() {
    if (!this.sheetItem) return;
    const name = this.sheetItem.product?.name ?? "";
    await this.appState.api.deleteItem(this.sheetItem.id);
    this.closeSheet();
    toast(t("toast.deleted", { product: name }));
  }

  render() {
    const lang = getLanguage();
    const groups = this.buildGroups();

    return html`<div class="wrap">
      <div class="toolbar">
        <div class="toolbar-top">
          <button class="sort-btn" @click=${this.cycleSort}>${t("shelf.sort")}: ${this.sortLabel()} ▾</button>
          <label class="group-toggle" @click=${() => (this.grouped = !this.grouped)}>
            <span class="switch ${this.grouped ? "on" : ""}"><span class="knob"></span></span>
            ${t("shelf.group")}
          </label>
        </div>
        <spz-category-chips .selected=${this.category}
          @category-changed=${(e: CustomEvent) => (this.category = e.detail.category)}></spz-category-chips>
      </div>

      ${this.loading
        ? html`<div class="grid">${[1, 2, 3, 4].map(() => html`<div class="card" style="height:150px"></div>`)}</div>`
        : this.items.length === 0
        ? html`<spz-empty-state emoji="🫙" heading=${t("shelf.empty_title")} description=${t("shelf.empty_sub")}>
            <button class="btn btn-primary" @click=${() => this.dispatchEvent(new CustomEvent("scan-here", { detail: { shelfId: this.shelfId }, bubbles: true, composed: true }))}>📷 ${t("shelf.scan")}</button>
            <button class="btn" @click=${() => this.dispatchEvent(new CustomEvent("add-here", { detail: { shelfId: this.shelfId }, bubbles: true, composed: true }))}>${t("shelf.from_catalog")}</button>
          </spz-empty-state>`
        : this.grouped
        ? this.renderGrid(groups)
        : this.renderFlat()}

      ${this.renderSheet(lang)}
    </div>`;
  }

  private renderGrid(groups: Group[]) {
    return html`<div class="grid">
      ${groups.map(
        (g) => html`<spz-product-tile
          .name=${g.name}
          .emoji=${g.emoji}
          .image=${g.image}
          .category=${g.category}
          .qtyLabel=${`${g.totalQty} ${t("unit." + g.unit)}`}
          .status=${g.first.status}
          .date=${g.first.best_before}
          .precision=${g.first.best_before_precision}
          .daysLeft=${g.first.days_left}
          .opened=${g.first.opened}
          .group=${g.items.length > 1}
          .groupInfo=${t("shelf.group_info", { qty: `${g.totalQty} ${t("unit." + g.unit)}`, batches: batches(g.items.length) })}
          @tile-open=${() => this.openGroup(g)}
          @tile-minus=${() => this.quickMinus(g.first)}
        ></spz-product-tile>`
      )}
    </div>`;
  }

  private renderFlat() {
    const items = this.appState ? this.sortFlat(this.filtered()) : [];
    return html`<div class="grid">
      ${items.map(
        (i) => html`<spz-product-tile
          .name=${i.product?.name ?? ""}
          .emoji=${i.product?.emoji ?? ""}
          .image=${i.product?.image ?? null}
          .category=${i.product?.category ?? "other"}
          .qtyLabel=${`${i.quantity} ${t("unit." + i.unit)}`}
          .status=${i.status}
          .date=${i.best_before}
          .precision=${i.best_before_precision}
          .daysLeft=${i.days_left}
          .opened=${i.opened}
          @tile-open=${() => this.openBatch(i)}
          @tile-minus=${() => this.quickMinus(i)}
        ></spz-product-tile>`
      )}
    </div>`;
  }

  private sortFlat(items: ItemWithMeta[]): ItemWithMeta[] {
    const byStatus = (i: ItemWithMeta) =>
      ({ expired: 0, expiring_soon: 1, ok: 2, no_date: 3 })[i.status] ?? 9;
    return [...items].sort((a, b) => {
      switch (this.sort) {
        case "name":
          return (a.product?.name ?? "").localeCompare(b.product?.name ?? "");
        case "qty":
          return b.quantity - a.quantity;
        case "added":
          return b.added_at.localeCompare(a.added_at);
        default:
          return byStatus(a) - byStatus(b) ||
            (a.best_before ?? "9").localeCompare(b.best_before ?? "9");
      }
    });
  }

  private renderSheet(lang: string) {
    if (this.sheetGroup) {
      const g = this.sheetGroup;
      return html`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${this.closeSheet}>
        <div class="sheet-head">
          <span class="sheet-glyph" aria-hidden="true">${productGlyph(g.emoji, g.category)}</span>
          <div style="flex:1">
            <div class="sheet-name">${g.name}</div>
            <div class="sheet-loc">${g.totalQty} ${t("unit." + g.unit)} · ${batches(g.items.length)}</div>
          </div>
        </div>
        ${g.items.map(
          (i) => html`<button class="batch-row" style="width:100%;background:none;border:none;cursor:pointer;text-align:left" @click=${() => this.openBatch(i)}>
            <spz-freshness-badge .status=${i.status} .date=${i.best_before} .precision=${i.best_before_precision} .daysLeft=${i.days_left}></spz-freshness-badge>
            <div style="flex:1">
              <div class="fact-v">${i.quantity} ${t("unit." + i.unit)}</div>
              <div class="fact-k">${i.opened ? t("sheet.opened_tag") : ""}</div>
            </div>
            <span style="color:var(--spz-text-2)">›</span>
          </button>`
        )}
      </spz-bottom-sheet>`;
    }
    const item = this.sheetItem;
    if (!item) return html``;
    return html`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${this.closeSheet}>
      <div class="sheet-head">
        <span class="sheet-glyph" aria-hidden="true">${productGlyph(item.product?.emoji ?? "", item.product?.category ?? "other")}</span>
        <div style="flex:1">
          <div class="sheet-name">${item.product?.name ?? ""}</div>
          <div class="sheet-loc">${item.shelf_path ?? ""}</div>
        </div>
        <spz-freshness-badge .status=${item.status} .date=${item.best_before} .precision=${item.best_before_precision} .daysLeft=${item.days_left}></spz-freshness-badge>
      </div>
      <div class="facts">
        <div><div class="fact-k">${t("sheet.quantity")}</div><div class="fact-v">${item.quantity} ${t("unit." + item.unit)}</div></div>
        <div><div class="fact-k">${t("sheet.best_before")}</div><div class="fact-v">${formatBestBefore(item.best_before, item.best_before_precision, lang)}</div></div>
        ${item.production_date ? html`<div><div class="fact-k">${t("sheet.production")}</div><div class="fact-v">${formatBestBefore(item.production_date, "day", lang)}</div></div>` : ""}
        ${item.notes ? html`<div><div class="fact-k">${t("sheet.note")}</div><div class="fact-v">${item.notes}</div></div>` : ""}
      </div>
      <div class="field-label">${t("sheet.dispense_qty")}</div>
      <div style="margin-bottom:18px">
        <spz-qty-stepper .value=${this.consumeQty} min="1" .max=${item.quantity} step="1"
          @value-changed=${(e: CustomEvent) => (this.consumeQty = e.detail.value)}></spz-qty-stepper>
      </div>
      <button class="btn btn-primary btn-block" @click=${this.confirmConsume}>${t("sheet.dispense", { qty: this.consumeQty })}</button>
      <div class="actions">
        <button class="btn" @click=${this.toggleOpened}>${item.opened ? t("sheet.close_pkg") : t("sheet.open")}</button>
        <button class="btn" @click=${() => this.dispatchEvent(new CustomEvent("move-item", { detail: { item }, bubbles: true, composed: true }))}>${t("sheet.move")}</button>
        <button class="btn" style="color:var(--spz-error);border-color:var(--spz-error)" @click=${this.deleteItem}>${t("common.delete")}</button>
      </div>
    </spz-bottom-sheet>`;
  }
}
