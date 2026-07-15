import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { Precision, ProductDefinition, Room, Shelf } from "../types";
import { t } from "../i18n";
import { tokens, shared } from "../styles";
import { productGlyph } from "../lib/categories";
import { addMonths } from "../lib/dates";
import type { DateValue } from "./date-quick-pick";
import "./qty-stepper";
import "./date-quick-pick";
import "./location-picker";
import "./bottom-sheet";

// Batch add form (DESIGN §7.1). Emits `added` with the created item metadata,
// and `next` when the user chose "add and scan next".
@customElement("spz-add-form")
export class SpzAddForm extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ attribute: false }) product?: ProductDefinition;
  @property() shelfId = "";
  @property({ type: Boolean }) narrow = true;

  @state() private qty = 1;
  @state() private unit = "szt";
  @state() private date: string | null = null;
  @state() private precision: Precision = "day";
  @state() private suggested = false;
  @state() private showMore = false;
  @state() private opened = false;
  @state() private note = "";
  @state() private production: string | null = null;
  @state() private pickingLocation = false;
  @state() private rooms: Room[] = [];
  @state() private shelves: Shelf[] = [];
  @state() private busy = false;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 20px; }
    .product-head {
      background: var(--spz-card); border: 1px solid var(--spz-divider);
      border-radius: var(--spz-radius); padding: 16px; display: flex; align-items: center; gap: 14px;
    }
    .product-head .glyph { font-size: 40px; }
    .product-head .name { font-size: 18px; font-weight: 500; color: var(--spz-text); }
    .product-head .change { font-size: 13px; color: var(--spz-primary); cursor: pointer; }
    .unit-chip {
      border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 500;
      border: 1px solid var(--spz-primary); color: var(--spz-primary); background: transparent;
      cursor: pointer; font-family: inherit;
    }
    .qty-row { display: flex; align-items: center; gap: 14px; }
    .shelf-btn {
      width: 100%; text-align: left; border: 1px solid var(--spz-divider);
      background: var(--spz-card); color: var(--spz-text); border-radius: 10px;
      padding: 14px 16px; font-size: 15px; cursor: pointer; display: flex; align-items: center;
      font-family: inherit;
    }
    .shelf-btn .chev { margin-left: auto; color: var(--spz-text-2); }
    .more-toggle { border: none; background: transparent; color: var(--spz-primary);
      font-size: 14px; text-align: left; padding: 0; cursor: pointer; font-family: inherit; }
    .cta { display: flex; flex-direction: column; gap: 10px; }
  `];

  connectedCallback() {
    super.connectedCallback();
    this.reset();
    void this.loadLocations();
  }

  private async loadLocations() {
    this.rooms = (await this.appState.api.listRooms()).rooms;
    this.shelves = (await this.appState.api.listShelves()).shelves;
    if (!this.shelfId && this.shelves.length) this.shelfId = this.shelves[0].id;
  }

  private reset() {
    this.qty = 1;
    this.unit = this.product?.default_unit ?? "szt";
    this.showMore = false;
    this.opened = false;
    this.note = "";
    this.production = null;
    // Pre-select a suggested date from the product's typical shelf life.
    if (this.product?.default_shelf_life_days) {
      const months = Math.round(this.product.default_shelf_life_days / 30);
      const val = addMonths(months);
      this.date = val.date;
      this.precision = val.precision;
      this.suggested = true;
    } else {
      this.date = null;
      this.precision = "day";
      this.suggested = false;
    }
  }

  private shelfPath(): string {
    const shelf = this.shelves.find((s) => s.id === this.shelfId);
    if (!shelf) return "—";
    const room = this.rooms.find((r) => r.id === shelf.room_id);
    return `${room?.name ?? "?"} / ${shelf.name}`;
  }

  private onDate(e: CustomEvent<DateValue>) {
    this.date = e.detail.date;
    this.precision = e.detail.precision;
    this.suggested = false;
  }

  private async submit(next: boolean) {
    if (!this.product || !this.shelfId || this.busy) return;
    this.busy = true;
    try {
      const { item } = await this.appState.api.addItem({
        product_id: this.product.id,
        shelf_id: this.shelfId,
        quantity: this.qty,
        unit: this.unit,
        best_before: this.date,
        best_before_precision: this.precision,
        production_date: this.production,
        opened: this.opened,
        notes: this.note,
      });
      this.dispatchEvent(
        new CustomEvent("added", {
          detail: { item, next, location: this.shelfPath() },
        })
      );
      this.reset();
    } finally {
      this.busy = false;
    }
  }

  render() {
    if (!this.product) {
      return html`<div class="wrap">${t("add.sheet_pick")}</div>`;
    }
    return html`<div class="wrap">
      <div class="product-head">
        <span class="glyph" aria-hidden="true">${productGlyph(this.product.emoji, this.product.category)}</span>
        <div style="flex:1">
          <div class="name">${this.product.name}</div>
          <div class="change" @click=${() => this.dispatchEvent(new CustomEvent("change-product"))}>
            ${t("add.change_product")}
          </div>
        </div>
      </div>

      <div>
        <div class="field-label">${t("add.quantity")}</div>
        <div class="qty-row">
          <spz-qty-stepper .value=${this.qty} min="0" step="1"
            @value-changed=${(e: CustomEvent) => (this.qty = e.detail.value)}></spz-qty-stepper>
          <button class="unit-chip">${t("unit." + this.unit)}</button>
        </div>
      </div>

      <div>
        <div class="field-label">${t("add.best_before")}</div>
        <spz-date-quick-pick .date=${this.date} .precision=${this.precision}
          .suggested=${this.suggested} @date-changed=${this.onDate}></spz-date-quick-pick>
      </div>

      <div>
        <div class="field-label">${t("add.shelf")}</div>
        <button class="shelf-btn" @click=${() => (this.pickingLocation = true)}>
          ${this.shelfPath()}<span class="chev">›</span>
        </button>
      </div>

      <button class="more-toggle" @click=${() => (this.showMore = !this.showMore)}>
        ${this.showMore ? t("common.less") : t("common.more")}
      </button>
      ${this.showMore
        ? html`<div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <div class="field-label">${t("add.production")}</div>
              <input type="date" .value=${this.production ?? ""}
                @change=${(e: Event) => (this.production = (e.target as HTMLInputElement).value || null)} />
            </div>
            <div>
              <div class="field-label">${t("add.note")}</div>
              <textarea rows="2" placeholder=${t("add.note_placeholder")}
                @input=${(e: Event) => (this.note = (e.target as HTMLTextAreaElement).value)}></textarea>
            </div>
            <label style="display:flex;align-items:center;gap:10px;font-size:14px;">
              <input type="checkbox" style="width:auto" .checked=${this.opened}
                @change=${(e: Event) => (this.opened = (e.target as HTMLInputElement).checked)} />
              ${t("add.opened")}
            </label>
          </div>`
        : ""}

      <div class="cta">
        <button class="btn btn-primary btn-block" ?disabled=${this.busy} @click=${() => this.submit(false)}>
          ${t("add.submit")}
        </button>
        <button class="btn btn-ghost btn-block" ?disabled=${this.busy} @click=${() => this.submit(true)}>
          ${t("add.submit_next")}
        </button>
      </div>

      <spz-bottom-sheet .open=${this.pickingLocation} .narrow=${this.narrow}
        @sheet-close=${() => (this.pickingLocation = false)}>
        <spz-location-picker .rooms=${this.rooms} .shelves=${this.shelves}
          @shelf-picked=${(e: CustomEvent) => { this.shelfId = e.detail.shelfId; this.pickingLocation = false; }}>
        </spz-location-picker>
      </spz-bottom-sheet>
    </div>`;
  }
}
