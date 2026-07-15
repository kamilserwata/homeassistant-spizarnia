import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ProductDefinition } from "../types";
import { t } from "../i18n";
import { tokens, shared } from "../styles";
import { CATEGORIES, CATEGORY_EMOJI } from "../lib/categories";
import "./category-chips";

const UNITS = ["szt", "słoik", "butelka", "puszka", "opak", "kg", "g", "l", "ml"];

// Create / edit a product definition. Emits `saved` with the product.
@customElement("spz-product-form")
export class SpzProductForm extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ attribute: false }) existing?: ProductDefinition;
  @property() presetName = "";
  @property({ attribute: false }) presetBarcode = "";

  @state() private name = "";
  @state() private category = "other";
  @state() private emoji = "";
  @state() private unit = "szt";
  @state() private shelfLife: number | null = null;
  @state() private minStock: number | null = null;
  @state() private notes = "";
  @state() private busy = false;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .title { font-size: 18px; font-weight: 500; }
    .emoji-suggest { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .emoji-suggest button {
      font-size: 22px; width: 44px; height: 44px; border-radius: 10px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); cursor: pointer;
    }
    .emoji-suggest button.active { border-color: var(--spz-primary); }
    select { appearance: auto; }
  `];

  connectedCallback() {
    super.connectedCallback();
    if (this.existing) {
      this.name = this.existing.name;
      this.category = this.existing.category;
      this.emoji = this.existing.emoji;
      this.unit = this.existing.default_unit;
      this.shelfLife = this.existing.default_shelf_life_days;
      this.minStock = this.existing.min_stock;
      this.notes = this.existing.notes;
    } else if (this.presetName) {
      this.name = this.presetName;
    }
  }

  private async save() {
    if (!this.name.trim() || this.busy) return;
    this.busy = true;
    try {
      const fields = {
        name: this.name.trim(),
        category: this.category,
        emoji: this.emoji || CATEGORY_EMOJI[this.category],
        default_unit: this.unit,
        default_shelf_life_days: this.shelfLife,
        min_stock: this.minStock,
        notes: this.notes,
        barcodes: this.presetBarcode ? [this.presetBarcode] : undefined,
      };
      let product: ProductDefinition;
      if (this.existing) {
        product = (await this.appState.api.updateProduct(this.existing.id, fields)).product;
      } else {
        product = (await this.appState.api.createProduct(fields)).product;
      }
      this.dispatchEvent(new CustomEvent("saved", { detail: { product } }));
    } finally {
      this.busy = false;
    }
  }

  render() {
    const suggestions = [CATEGORY_EMOJI[this.category], "🫙", "🥫", "🍯", "🌾", "🧂"];
    return html`<div class="wrap">
      <div class="title">${this.existing ? t("common.edit") : t("add_menu.new")}</div>

      <div>
        <div class="field-label">${t("product.name")}</div>
        <input .value=${this.name} @input=${(e: Event) => (this.name = (e.target as HTMLInputElement).value)} />
      </div>

      <div>
        <div class="field-label">${t("product.category")}</div>
        <spz-category-chips .selected=${this.category} .includeAll=${false}
          @category-changed=${(e: CustomEvent) => (this.category = e.detail.category || CATEGORIES[0])}></spz-category-chips>
      </div>

      <div>
        <div class="field-label">${t("product.emoji")}</div>
        <input .value=${this.emoji} placeholder=${CATEGORY_EMOJI[this.category]}
          @input=${(e: Event) => (this.emoji = (e.target as HTMLInputElement).value)} />
        <div class="emoji-suggest">
          ${suggestions.map(
            (em) => html`<button class=${this.emoji === em ? "active" : ""} @click=${() => (this.emoji = em)}>${em}</button>`
          )}
        </div>
      </div>

      <div>
        <div class="field-label">${t("product.default_unit")}</div>
        <select @change=${(e: Event) => (this.unit = (e.target as HTMLSelectElement).value)}>
          ${UNITS.map((u) => html`<option value=${u} ?selected=${u === this.unit}>${t("unit." + u)}</option>`)}
        </select>
      </div>

      <div>
        <div class="field-label">${t("product.shelf_life")}</div>
        <input type="number" min="0" .value=${this.shelfLife ?? ""}
          @input=${(e: Event) => { const v = (e.target as HTMLInputElement).value; this.shelfLife = v ? Number(v) : null; }} />
      </div>

      <div>
        <div class="field-label">${t("product.min_stock")}</div>
        <input type="number" min="0" step="0.1" .value=${this.minStock ?? ""}
          @input=${(e: Event) => { const v = (e.target as HTMLInputElement).value; this.minStock = v ? Number(v) : null; }} />
      </div>

      <div>
        <div class="field-label">${t("product.notes")}</div>
        <textarea rows="2" .value=${this.notes}
          @input=${(e: Event) => (this.notes = (e.target as HTMLTextAreaElement).value)}></textarea>
      </div>

      <button class="btn btn-primary btn-block" ?disabled=${this.busy} @click=${this.save}>${t("common.save")}</button>
    </div>`;
  }
}
