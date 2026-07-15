import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ProductWithStock } from "../types";
import { t } from "../i18n";
import { tokens, shared } from "../styles";
import { productGlyph } from "../lib/categories";
import "./category-chips";

// Searchable catalog list in a sheet; emits `product-picked` with the product.
@customElement("spz-product-picker")
export class SpzProductPicker extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @state() private products: ProductWithStock[] = [];
  @state() private query = "";
  @state() private category = "";
  private timer?: number;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .search { margin-bottom: 12px; }
    .row {
      display: flex; align-items: center; gap: 14px; width: 100%; cursor: pointer;
      background: var(--spz-card); border: 1px solid var(--spz-divider); border-radius: 12px;
      padding: 12px 14px; color: var(--spz-text); font-family: inherit; text-align: left;
      margin-bottom: 8px;
    }
    .row .glyph { font-size: 28px; }
    .row .name { font-size: 15px; font-weight: 500; }
    .row .cat { font-size: 13px; color: var(--spz-text-2); }
    .title { font-size: 18px; font-weight: 500; margin-bottom: 12px; }
    .list { max-height: 52vh; overflow-y: auto; }
  `];

  connectedCallback() {
    super.connectedCallback();
    void this.load();
  }

  private async load() {
    const res = await this.appState.api.listProducts({
      query: this.query || undefined,
      category: this.category || undefined,
      limit: 60,
    });
    this.products = res.products;
  }

  private onQuery(e: Event) {
    this.query = (e.target as HTMLInputElement).value;
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.load(), 250);
  }

  private pick(p: ProductWithStock) {
    this.dispatchEvent(new CustomEvent("product-picked", { detail: { product: p } }));
  }

  render() {
    return html`
      <div class="title">${t("add_menu.catalog")}</div>
      <input class="search" placeholder=${t("catalog.search")} .value=${this.query} @input=${this.onQuery} />
      <spz-category-chips .selected=${this.category}
        @category-changed=${(e: CustomEvent) => { this.category = e.detail.category; this.load(); }}></spz-category-chips>
      <div class="list" style="margin-top:12px">
        ${this.products.map(
          (p) => html`<button class="row" @click=${() => this.pick(p)}>
            <span class="glyph" aria-hidden="true">${productGlyph(p.emoji, p.category)}</span>
            <div style="flex:1;min-width:0">
              <div class="name">${p.name}</div>
              <div class="cat">${t("cat." + p.category)}</div>
            </div>
            <span style="color:var(--spz-text-2)">›</span>
          </button>`
        )}
      </div>
    `;
  }
}
