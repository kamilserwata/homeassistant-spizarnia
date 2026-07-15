import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ProductWithStock } from "../types";
import { t } from "../i18n";
import { tokens, shared } from "../styles";
import { navigate } from "../router";
import { productGlyph, categoryTint } from "../lib/categories";
import "../components/category-chips";
import "../components/empty-state";

type SortKey = "name" | "recent";

@customElement("spz-view-catalog")
export class SpzViewCatalog extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ type: Boolean }) narrow = true;

  @state() private products: ProductWithStock[] = [];
  @state() private query = "";
  @state() private category = "";
  @state() private sort: SortKey = "name";
  @state() private loading = true;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .head { display: flex; align-items: center; gap: 10px; }
    .head .title { font-size: 20px; font-weight: 600; color: var(--spz-text); flex: 1; }
    .new-btn {
      cursor: pointer; border: none; border-radius: 10px; padding: 12px 16px;
      background: var(--spz-primary); color: #fff; font-family: inherit;
      font-size: 14px; font-weight: 600; min-height: 48px; white-space: nowrap;
    }
    .toolbar { display: flex; flex-direction: column; gap: 10px; }
    .search-row { display: flex; align-items: center; gap: 10px; }
    .search-row input { flex: 1; }
    .sort-btn {
      cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      border-radius: 8px; padding: 12px 14px; font-size: 13px; font-weight: 500;
      font-family: inherit; min-height: 48px;
    }
    .list { display: flex; flex-direction: column; }
    .row {
      display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
      cursor: pointer; font-family: inherit; background: none; border: none;
      border-top: 1px solid var(--spz-divider); padding: 12px 4px; min-height: 48px;
      color: var(--spz-text);
    }
    .row:first-child { border-top: none; }
    .glyph {
      width: 44px; height: 44px; flex: none; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .glyph img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
    .info { flex: 1; min-width: 0; }
    .name { font-size: 15px; font-weight: 500; color: var(--spz-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sub { font-size: 13px; color: var(--spz-text-2); margin-top: 2px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tag { font-size: 15px; margin-left: 4px; }
    .chev { color: var(--spz-text-2); font-size: 20px; margin-left: 4px; }
  `];

  private unsub?: () => void;
  private lastSignal = -1;
  private debounceTimer?: number;

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
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  private async load() {
    this.loading = true;
    const res = await this.appState.api.listProducts({
      query: this.query || undefined,
      category: this.category || undefined,
    });
    this.products = res.products;
    this.loading = false;
  }

  private onSearchInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.query = value;
      void this.load();
    }, 250);
  }

  private onCategory(e: CustomEvent) {
    this.category = e.detail.category;
    void this.load();
  }

  private toggleSort() {
    this.sort = this.sort === "name" ? "recent" : "name";
  }

  private sorted(): ProductWithStock[] {
    const list = [...this.products];
    return list.sort((a, b) =>
      this.sort === "recent"
        ? b.created_at.localeCompare(a.created_at)
        : a.name.localeCompare(b.name)
    );
  }

  private stockLine(p: ProductWithStock): string {
    if (p.total_quantity > 0) {
      return t("catalog.stock", {
        qty: `${p.total_quantity} ${t("unit." + p.default_unit)}`,
        places: p.item_count,
      });
    }
    return t("catalog.no_stock");
  }

  render() {
    const products = this.sorted();
    return html`<div class="wrap">
      <div class="head">
        <div class="title">${t("nav.catalog")}</div>
        <button class="new-btn"
          @click=${() => this.dispatchEvent(new CustomEvent("new-product", { bubbles: true, composed: true }))}>
          ${t("catalog.new_product")}
        </button>
      </div>

      <div class="toolbar">
        <div class="search-row">
          <input type="search" .value=${this.query}
            placeholder=${t("catalog.search")}
            aria-label=${t("catalog.search")}
            @input=${this.onSearchInput} />
          <button class="sort-btn" @click=${this.toggleSort}>
            ${this.sort === "name" ? t("catalog.sort_name") : t("catalog.sort_recent")} ▾
          </button>
        </div>
        <spz-category-chips .selected=${this.category}
          @category-changed=${this.onCategory}></spz-category-chips>
      </div>

      ${this.loading
        ? html`<div class="card" style="height:220px"></div>`
        : products.length === 0
        ? html`<spz-empty-state emoji="📖" heading=${t("catalog.empty")}></spz-empty-state>`
        : html`<div class="list">
            ${products.map(
              (p) => html`<button class="row" @click=${() => navigate("product", p.id)}>
                <span class="glyph" style="background:${categoryTint(p.category)}">
                  ${p.image
                    ? html`<img src=${p.image} alt="" />`
                    : productGlyph(p.emoji, p.category)}
                </span>
                <div class="info">
                  <div class="name">
                    ${p.name}${p.barcodes.length > 0
                      ? html`<span class="tag" aria-hidden="true">🏷️</span>`
                      : ""}
                  </div>
                  <div class="sub">${t("cat." + p.category)} · ${this.stockLine(p)}</div>
                </div>
                <span class="chev" aria-hidden="true">›</span>
              </button>`
            )}
          </div>`}
    </div>`;
  }
}
