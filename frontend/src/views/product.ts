import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ItemWithMeta, ProductWithStock } from "../types";
import { t, batches } from "../i18n";
import { tokens, shared } from "../styles";
import { navigate } from "../router";
import { productGlyph, categoryTint } from "../lib/categories";
import { toast } from "../components/toast";
import "../components/category-chips";
import "../components/bottom-sheet";
import "../components/empty-state";

const UNITS = ["szt", "słoik", "butelka", "puszka", "opak", "kg", "g", "l", "ml"];

interface EditForm {
  name: string;
  emoji: string;
  category: string;
  default_unit: string;
  default_shelf_life_days: string;
  min_stock: string;
  notes: string;
}

interface StockGroup {
  shelfId: string;
  path: string;
  qty: number;
  unit: string;
}

@customElement("spz-view-product")
export class SpzViewProduct extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property() productId = "";
  @property({ type: Boolean }) narrow = true;

  @state() private product?: ProductWithStock;
  @state() private items: ItemWithMeta[] = [];
  @state() private loading = true;
  @state() private editing = false;
  @state() private form?: EditForm;
  @state() private newBarcode = "";

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .hero { display: flex; align-items: center; gap: 16px; }
    .hero .glyph {
      width: 72px; height: 72px; flex: none; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; font-size: 40px;
    }
    .hero .glyph img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
    .hero .name { font-size: 22px; font-weight: 600; color: var(--spz-text); }
    .hero .sub { font-size: 14px; color: var(--spz-text-2); margin-top: 4px; }
    .card-head { display: flex; align-items: center; margin-bottom: 12px; }
    .card-head .section-title { margin-bottom: 0; flex: 1; }
    .link-btn {
      cursor: pointer; background: none; border: none; color: var(--spz-primary);
      font-family: inherit; font-size: 14px; font-weight: 600; padding: 8px;
      min-height: 44px;
    }
    .prop-row { display: flex; align-items: baseline; gap: 12px; padding: 10px 0;
      border-top: 1px solid var(--spz-divider); }
    .prop-row:first-child { border-top: none; }
    .prop-k { font-size: 13px; color: var(--spz-text-2); flex: 1; }
    .prop-v { font-size: 15px; color: var(--spz-text); font-weight: 500; text-align: right; }
    .barcodes { display: flex; flex-direction: column; gap: 10px; }
    .ean-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .ean { display: inline-flex; align-items: center; gap: 6px; font-size: 13px;
      color: var(--spz-text); background: var(--spz-bg-2); border-radius: 999px;
      padding: 6px 12px; font-variant-numeric: tabular-nums; }
    .ean .kind { font-size: 11px; font-weight: 700; color: var(--spz-text-2); }
    .barcode-add { display: flex; gap: 10px; }
    .barcode-add input { flex: 1; }
    .stock-row {
      display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
      cursor: pointer; font-family: inherit; background: none; border: none;
      border-top: 1px solid var(--spz-divider); padding: 12px 0; min-height: 48px;
      color: var(--spz-text);
    }
    .stock-row:first-child { border-top: none; }
    .stock-loc { flex: 1; min-width: 0; font-size: 15px; color: var(--spz-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stock-qty { font-size: 15px; font-weight: 500; color: var(--spz-text); }
    .chev { color: var(--spz-text-2); font-size: 20px; }
    .note { font-size: 13px; color: var(--spz-text-2); }
    .form-field { margin-bottom: 14px; }
    .sheet-title { font-size: 18px; font-weight: 600; color: var(--spz-text); margin-bottom: 16px; }
    .form-actions { display: flex; gap: 10px; margin-top: 8px; }
    .form-actions .btn { flex: 1; }
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
    if (changed.has("productId")) void this.load();
  }

  private async load() {
    this.loading = true;
    const [prodRes, itemRes] = await Promise.all([
      this.appState.api.listProducts({}),
      this.appState.api.listItems({ product_id: this.productId }),
    ]);
    this.product = prodRes.products.find((p) => p.id === this.productId);
    this.items = itemRes.items;
    this.loading = false;
  }

  private stockGroups(): StockGroup[] {
    const map = new Map<string, StockGroup>();
    for (const item of this.items) {
      let g = map.get(item.shelf_id);
      if (!g) {
        g = {
          shelfId: item.shelf_id,
          path: item.shelf_path ?? "",
          qty: 0,
          unit: item.unit,
        };
        map.set(item.shelf_id, g);
      }
      g.qty += item.quantity;
    }
    return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
  }

  private openEdit() {
    const p = this.product;
    if (!p) return;
    this.form = {
      name: p.name,
      emoji: p.emoji,
      category: p.category,
      default_unit: p.default_unit,
      default_shelf_life_days: p.default_shelf_life_days?.toString() ?? "",
      min_stock: p.min_stock?.toString() ?? "",
      notes: p.notes,
    };
    this.editing = true;
  }

  private closeEdit() {
    this.editing = false;
    this.form = undefined;
  }

  private setForm<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    if (!this.form) return;
    this.form = { ...this.form, [key]: value };
  }

  private async saveEdit() {
    if (!this.product || !this.form) return;
    const f = this.form;
    const shelfLife = f.default_shelf_life_days.trim();
    const minStock = f.min_stock.trim();
    await this.appState.api.updateProduct(this.product.id, {
      name: f.name.trim(),
      emoji: f.emoji.trim(),
      category: f.category,
      default_unit: f.default_unit,
      default_shelf_life_days: shelfLife === "" ? null : Number(shelfLife),
      min_stock: minStock === "" ? null : Number(minStock),
      notes: f.notes.trim(),
    });
    this.closeEdit();
    await this.load();
  }

  private async addBarcode() {
    const code = this.newBarcode.trim();
    if (!code || !this.product) return;
    if (this.product.barcodes.includes(code)) {
      this.newBarcode = "";
      return;
    }
    await this.appState.api.updateProduct(this.product.id, {
      barcodes: [...this.product.barcodes, code],
    });
    this.newBarcode = "";
    await this.load();
  }

  private async deleteProduct() {
    if (!this.product) return;
    const name = this.product.name;
    await this.appState.api.deleteProduct(this.product.id);
    toast(t("toast.deleted", { product: name }));
    navigate("catalog");
  }

  render() {
    if (this.loading && !this.product) {
      return html`<div class="wrap"><div class="card" style="height:96px"></div>
        <div class="card" style="height:180px"></div></div>`;
    }
    const p = this.product;
    if (!p) {
      return html`<div class="wrap">
        <spz-empty-state emoji="📖" heading=${t("catalog.empty")}></spz-empty-state>
      </div>`;
    }

    const groups = this.stockGroups();
    const hasStock = this.items.length > 0;

    return html`<div class="wrap">
      <div class="hero">
        <span class="glyph" style="background:${categoryTint(p.category)}">
          ${p.image ? html`<img src=${p.image} alt="" />` : productGlyph(p.emoji, p.category)}
        </span>
        <div style="flex:1;min-width:0">
          <div class="name">${p.name}</div>
          <div class="sub">${t("cat." + p.category)} · ${t("product.default_unit")}: ${t("unit." + p.default_unit)}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="section-title">${t("product.props")}</div>
          <button class="link-btn" @click=${this.openEdit}>${t("common.edit")}</button>
        </div>
        <div class="prop-row">
          <span class="prop-k">${t("product.category")}</span>
          <span class="prop-v">${t("cat." + p.category)}</span>
        </div>
        <div class="prop-row">
          <span class="prop-k">${t("product.default_unit")}</span>
          <span class="prop-v">${t("unit." + p.default_unit)}</span>
        </div>
        <div class="prop-row">
          <span class="prop-k">${t("product.shelf_life")}</span>
          <span class="prop-v">${p.default_shelf_life_days ?? "—"}</span>
        </div>
        <div class="prop-row">
          <span class="prop-k">${t("product.min_stock")}</span>
          <span class="prop-v">${p.min_stock ?? "—"}</span>
        </div>
        ${p.notes
          ? html`<div class="prop-row">
              <span class="prop-k">${t("product.notes")}</span>
              <span class="prop-v">${p.notes}</span>
            </div>`
          : ""}
      </div>

      <div class="card">
        <div class="section-title">${t("product.barcodes")}</div>
        <div class="barcodes">
          ${p.barcodes.length
            ? html`<div class="ean-list">
                ${p.barcodes.map(
                  (code) => html`<span class="ean"><span class="kind">EAN</span>${code}</span>`
                )}
              </div>`
            : ""}
          <div class="barcode-add">
            <input type="text" inputmode="numeric" .value=${this.newBarcode}
              aria-label=${t("product.barcodes")}
              @input=${(e: Event) => (this.newBarcode = (e.target as HTMLInputElement).value)}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") void this.addBarcode(); }} />
            <button class="btn" @click=${this.addBarcode}>${t("common.add")}</button>
          </div>
          <button class="btn btn-ghost btn-block"
            @click=${() => this.dispatchEvent(new CustomEvent("scan-barcode-for-product", { detail: { productId: p.id }, bubbles: true, composed: true }))}>
            ${t("product.add_barcode")}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">${t("product.stock")}</div>
        ${hasStock
          ? groups.map(
              (g) => html`<button class="stock-row" @click=${() => navigate("shelf", g.shelfId)}>
                <span class="stock-loc">${g.path}</span>
                <span class="stock-qty">${g.qty} ${t("unit." + g.unit)}</span>
                <span class="chev" aria-hidden="true">›</span>
              </button>`
            )
          : html`<div class="note">${t("catalog.no_stock")}</div>`}
      </div>

      <button class="btn btn-primary btn-block"
        @click=${() => this.dispatchEvent(new CustomEvent("add-for-product", { detail: { product: p }, bubbles: true, composed: true }))}>
        ${t("product.add_batch")}
      </button>

      ${hasStock
        ? html`<div class="note">${t("product.cannot_delete", { batches: batches(this.items.length) })}</div>
            <button class="btn btn-block" disabled style="opacity:.5;color:var(--spz-error);border-color:var(--spz-error)">
              ${t("common.delete")}
            </button>`
        : html`<button class="btn btn-block" style="color:var(--spz-error);border-color:var(--spz-error)"
            @click=${this.deleteProduct}>
            ${t("common.delete")}
          </button>`}

      ${this.renderEditSheet()}
    </div>`;
  }

  private renderEditSheet() {
    if (!this.editing || !this.form) return html``;
    const f = this.form;
    return html`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${this.closeEdit}>
      <div class="sheet-title">${t("product.props")}</div>

      <div class="form-field">
        <div class="field-label">${t("product.name")}</div>
        <input type="text" .value=${f.name}
          @input=${(e: Event) => this.setForm("name", (e.target as HTMLInputElement).value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${t("product.emoji")}</div>
        <input type="text" .value=${f.emoji}
          @input=${(e: Event) => this.setForm("emoji", (e.target as HTMLInputElement).value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${t("product.category")}</div>
        <spz-category-chips .selected=${f.category} .includeAll=${false}
          @category-changed=${(e: CustomEvent) => this.setForm("category", e.detail.category)}></spz-category-chips>
      </div>

      <div class="form-field">
        <div class="field-label">${t("product.default_unit")}</div>
        <select .value=${f.default_unit}
          @change=${(e: Event) => this.setForm("default_unit", (e.target as HTMLSelectElement).value)}>
          ${UNITS.map(
            (u) => html`<option value=${u} ?selected=${u === f.default_unit}>${t("unit." + u)}</option>`
          )}
        </select>
      </div>

      <div class="form-field">
        <div class="field-label">${t("product.shelf_life")}</div>
        <input type="number" min="0" inputmode="numeric" .value=${f.default_shelf_life_days}
          @input=${(e: Event) => this.setForm("default_shelf_life_days", (e.target as HTMLInputElement).value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${t("product.min_stock")}</div>
        <input type="number" min="0" inputmode="numeric" .value=${f.min_stock}
          @input=${(e: Event) => this.setForm("min_stock", (e.target as HTMLInputElement).value)} />
      </div>

      <div class="form-field">
        <div class="field-label">${t("product.notes")}</div>
        <textarea rows="2" .value=${f.notes}
          @input=${(e: Event) => this.setForm("notes", (e.target as HTMLTextAreaElement).value)}></textarea>
      </div>

      <div class="form-actions">
        <button class="btn" @click=${this.closeEdit}>${t("common.cancel")}</button>
        <button class="btn btn-primary" @click=${this.saveEdit}>${t("common.save")}</button>
      </div>
    </spz-bottom-sheet>`;
  }
}
