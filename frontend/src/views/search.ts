import { LitElement, css, html } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ItemWithMeta, ProductWithStock } from "../types";
import { t } from "../i18n";
import { tokens, shared } from "../styles";
import { navigate } from "../router";
import { toast } from "../components/toast";
import { productGlyph } from "../lib/categories";
import "../components/empty-state";
import "../components/freshness-badge";

const RECENT_KEY = "spz-recent-search";
const RECENT_MAX = 6;
const DEBOUNCE_MS = 250;

@customElement("spz-view-search")
export class SpzViewSearch extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ type: Boolean }) narrow = true;

  @state() private query = "";
  @state() private products: ProductWithStock[] = [];
  @state() private items: ItemWithMeta[] = [];
  @state() private loading = false;
  @state() private recent: string[] = [];

  @query("#q") private input?: HTMLInputElement;

  private debounceTimer?: number;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .searchbar { display: flex; align-items: center; gap: 10px;
      border: 1px solid var(--spz-divider); border-radius: 12px;
      background: var(--spz-card); padding: 0 14px; }
    .searchbar ha-icon { color: var(--spz-text-2); --mdc-icon-size: 22px; flex: none; }
    .searchbar input { border: none; background: transparent; padding: 14px 0;
      min-height: 48px; border-radius: 0; }
    .searchbar input:focus { outline: none; border: none; }
    .group { display: flex; flex-direction: column; }
    .recent-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
    .recent-row .chip { min-height: 40px; }
    .res-item { display: flex; align-items: center; gap: 8px; }
    .res-item + .res-item, .group .res-item:not(:first-child) { }
    .res-row {
      flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
      padding: 10px 0; background: none; border: none; text-align: left;
      cursor: pointer; font-family: inherit; color: var(--spz-text); min-height: 48px;
    }
    .res-static {
      flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
      padding: 10px 0; min-height: 48px;
    }
    .divide .res-item { border-top: 1px solid var(--spz-divider); }
    .divide .res-item:first-child { border-top: none; }
    .glyph { width: 40px; height: 40px; flex: none; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; font-size: 22px; background: var(--spz-bg-2); }
    .res-main { flex: 1; min-width: 0; }
    .res-name { font-size: 15px; font-weight: 500; color: var(--spz-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .res-sub { font-size: 13px; color: var(--spz-text-2); margin-top: 2px; }
    .res-loc { font-size: 13px; color: var(--spz-primary); margin-top: 2px; font-weight: 500;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .icon-btn { flex: none; min-width: 48px; min-height: 48px; border-radius: 10px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      font-size: 18px; cursor: pointer; font-family: inherit; }
    .pill-btn { flex: none; min-height: 48px; padding: 0 14px; border-radius: 10px;
      border: 1px solid var(--spz-primary); background: transparent; color: var(--spz-primary);
      font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .empty-inline { font-size: 14px; color: var(--spz-text-2); padding: 8px 2px; }
  `];

  private unsub?: () => void;
  private lastSignal = -1;

  connectedCallback() {
    super.connectedCallback();
    this.recent = this.loadRecent();
    this.unsub = this.appState.subscribe(() => {
      if (this.appState.changeSignal !== this.lastSignal) {
        this.lastSignal = this.appState.changeSignal;
        const q = this.query.trim();
        if (q.length >= 2) void this.runSearch(q);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsub?.();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  firstUpdated() {
    this.input?.focus();
  }

  private loadRecent(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(list) ? list.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  }

  private addRecent(query: string) {
    const q = query.trim();
    if (q.length < 2) return;
    const list = [q, ...this.recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(
      0,
      RECENT_MAX
    );
    this.recent = list;
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable — recents are best-effort */
    }
  }

  private onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.query = value;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    const q = value.trim();
    if (q.length < 2) {
      this.products = [];
      this.items = [];
      this.loading = false;
      return;
    }
    this.loading = true;
    this.debounceTimer = window.setTimeout(() => void this.runSearch(q), DEBOUNCE_MS);
  }

  private onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      const q = this.query.trim();
      if (q.length >= 2) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        void this.runSearch(q);
        this.addRecent(q);
      }
    }
  }

  private async runSearch(query: string) {
    const res = await this.appState.api.search(query);
    if (query !== this.query.trim()) return;
    this.products = res.products;
    this.items = res.items;
    this.loading = false;
  }

  private runRecent(query: string) {
    this.query = query;
    if (this.input) this.input.value = query;
    this.loading = true;
    void this.runSearch(query);
    this.addRecent(query);
    this.input?.focus();
  }

  private async quickConsume(e: Event, item: ItemWithMeta) {
    e.stopPropagation();
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

  private addForProduct(product: ProductWithStock) {
    this.dispatchEvent(
      new CustomEvent("add-for-product", {
        detail: { product },
        bubbles: true,
        composed: true,
      })
    );
  }

  private createProduct(name: string) {
    this.dispatchEvent(
      new CustomEvent("new-product", {
        detail: { name },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const q = this.query.trim();
    return html`<div class="wrap">
      <div class="searchbar">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          id="q"
          type="search"
          autofocus
          .value=${this.query}
          placeholder=${t("search.placeholder")}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
        />
      </div>
      ${q.length < 2 ? this.renderIdle() : this.renderResults(q)}
    </div>`;
  }

  private renderIdle() {
    if (this.recent.length) {
      return html`<div class="group">
        <div class="section-label">${t("search.recent")}</div>
        <div class="recent-row">
          ${this.recent.map(
            (r) => html`<button class="chip" @click=${() => this.runRecent(r)}>${r}</button>`
          )}
        </div>
      </div>`;
    }
    return html`<spz-empty-state emoji="🔎" heading=${t("search.hint")}></spz-empty-state>`;
  }

  private renderResults(q: string) {
    const nothing =
      !this.loading && this.items.length === 0 && this.products.length === 0;

    return html`
      ${this.items.length
        ? html`<div class="group">
            <div class="section-label">${t("search.in_pantry")}</div>
            <div class="divide">
              ${this.items.map((i) => this.renderItemRow(i))}
            </div>
          </div>`
        : ""}

      ${this.products.length
        ? html`<div class="group">
            <div class="section-label">${t("search.catalog")}</div>
            <div class="divide">
              ${this.products.map((p) => this.renderProductRow(p))}
            </div>
          </div>`
        : ""}

      ${nothing ? html`<div class="empty-inline">${t("search.empty")}</div>` : ""}

      <div class="group">
        <div class="section-label">${t("search.actions")}</div>
        <div class="divide">
          <div class="res-item">
            <button class="res-row" @click=${() => this.createProduct(q)}>
              <span class="glyph" aria-hidden="true">➕</span>
              <div class="res-main">
                <div class="res-name">${t("search.create", { query: q })}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderItemRow(item: ItemWithMeta) {
    const glyph = productGlyph(item.product?.emoji, item.product?.category ?? "other");
    return html`<div class="res-item">
      <button class="res-row" @click=${() => navigate("shelf", item.shelf_id)}>
        <span class="glyph" aria-hidden="true">${glyph}</span>
        <div class="res-main">
          <div class="res-name">${item.product?.name ?? ""}</div>
          <div class="res-sub">${item.quantity} ${t("unit." + item.unit)}</div>
          ${item.shelf_path ? html`<div class="res-loc">${item.shelf_path}</div>` : ""}
        </div>
        <spz-freshness-badge
          .status=${item.status}
          .date=${item.best_before}
          .precision=${item.best_before_precision}
          .daysLeft=${item.days_left}
        ></spz-freshness-badge>
      </button>
      <button
        class="icon-btn"
        aria-label=${t("dashboard.quick_consume")}
        @click=${(e: Event) => this.quickConsume(e, item)}
      >
        ➖
      </button>
    </div>`;
  }

  private renderProductRow(product: ProductWithStock) {
    const glyph = productGlyph(product.emoji, product.category);
    return html`<div class="res-item">
      <div class="res-static">
        <span class="glyph" aria-hidden="true">${glyph}</span>
        <div class="res-main">
          <div class="res-name">${product.name}</div>
          <div class="res-sub">${t("cat." + product.category)}</div>
        </div>
      </div>
      <button class="pill-btn" @click=${() => this.addForProduct(product)}>
        ${t("search.add_batch")}
      </button>
    </div>`;
  }
}
