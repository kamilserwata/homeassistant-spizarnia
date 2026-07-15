import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ItemWithMeta, ProductDefinition } from "../types";
import { t, batches, getLanguage } from "../i18n";
import { tokens, shared } from "../styles";
import { productGlyph } from "../lib/categories";
import { fefoSort, hasOlderBatch } from "../lib/fefo";
import { formatBestBefore } from "../lib/dates";
import "./qty-stepper";
import "./freshness-badge";

// Dispense-by-scan flow (DESIGN §7.2): FEFO auto-select + anti-waste warning.
@customElement("spz-dispense-form")
export class SpzDispenseForm extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ attribute: false }) product?: ProductDefinition;

  @state() private items: ItemWithMeta[] = [];
  @state() private selectedId = "";
  @state() private qty = 1;
  @state() private busy = false;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .head {
      background: var(--spz-card); border: 1px solid var(--spz-divider);
      border-radius: var(--spz-radius); padding: 16px; display: flex; align-items: center; gap: 14px;
    }
    .head .glyph { font-size: 36px; }
    .head .name { font-size: 18px; font-weight: 500; color: var(--spz-text); }
    .head .sub { font-size: 13px; color: var(--spz-text-2); }
    .batch {
      display: flex; align-items: center; gap: 12px; width: 100%; cursor: pointer;
      border: 1px solid var(--spz-divider); border-radius: 12px; padding: 12px 14px;
      background: var(--spz-card); color: var(--spz-text); font-family: inherit; text-align: left;
    }
    .batch.selected { border-color: var(--spz-primary); }
    .batch .info { flex: 1; }
    .batch .qty { font-size: 14px; font-weight: 500; }
    .batch .tag { font-size: 12px; color: var(--spz-text-2); }
    .anti {
      display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--spz-text);
      background: color-mix(in srgb, var(--spz-card) 80%, var(--spz-warning) 20%);
      border: 1px solid var(--spz-warning); border-radius: 10px; padding: 12px;
    }
    .list { display: flex; flex-direction: column; gap: 10px; }
  `];

  connectedCallback() {
    super.connectedCallback();
    void this.load();
  }
  updated(changed: Map<string, unknown>) {
    if (changed.has("product")) void this.load();
  }

  private async load() {
    if (!this.product) return;
    const res = await this.appState.api.listItems({ product_id: this.product.id });
    this.items = fefoSort(res.items);
    this.selectedId = this.items[0]?.id ?? "";
    this.qty = 1;
  }

  private async confirm() {
    if (!this.selectedId || this.busy) return;
    this.busy = true;
    const name = this.product?.name ?? "";
    try {
      // Consume from the chosen batch; overflow cascades via FEFO on the product.
      const selected = this.items.find((i) => i.id === this.selectedId);
      if (selected && this.qty <= selected.quantity) {
        await this.appState.api.consume(this.selectedId, this.qty);
      } else {
        await this.appState.api.consumeFefo(this.product!.id, this.qty);
      }
      this.dispatchEvent(
        new CustomEvent("dispensed", { detail: { name, qty: this.qty } })
      );
    } finally {
      this.busy = false;
    }
  }

  render() {
    if (!this.product) return html``;
    const lang = getLanguage();
    const older = hasOlderBatch(this.items, this.selectedId);
    const selectedMax =
      this.items.find((i) => i.id === this.selectedId)?.quantity ?? 1;

    return html`<div class="wrap">
      <div class="head">
        <span class="glyph" aria-hidden="true">${productGlyph(this.product.emoji, this.product.category)}</span>
        <div>
          <div class="name">${this.product.name}</div>
          <div class="sub">${batches(this.items.length)}</div>
        </div>
      </div>

      <div>
        <div class="field-label">${t("sheet.batches_fefo")}</div>
        <div class="list">
          ${this.items.map((p, idx) => {
            const tag = [
              idx === 0 ? t("sheet.oldest") : "",
              p.opened ? t("sheet.opened_tag") : "",
            ].filter(Boolean).join(" · ");
            return html`<button
              class="batch ${p.id === this.selectedId ? "selected" : ""}"
              @click=${() => { this.selectedId = p.id; this.qty = 1; }}
            >
              <spz-freshness-badge .status=${p.status} .date=${p.best_before}
                .precision=${p.best_before_precision} .daysLeft=${p.days_left}></spz-freshness-badge>
              <div class="info">
                <div class="qty">${p.quantity} ${t("unit." + p.unit)}</div>
                <div class="tag">${tag}</div>
              </div>
              ${p.id === this.selectedId ? html`<span style="color:var(--spz-primary);font-size:20px">●</span>` : ""}
            </button>`;
          })}
        </div>
      </div>

      ${older
        ? html`<div class="anti">⚠️ ${t("sheet.anti_waste", { date: formatBestBefore(older.best_before, older.best_before_precision, lang) })}</div>`
        : ""}

      <div>
        <div class="field-label">${t("add.quantity")}</div>
        <spz-qty-stepper .value=${this.qty} min="1" .max=${Math.max(selectedMax, this.qty)} step="1"
          @value-changed=${(e: CustomEvent) => (this.qty = e.detail.value)}></spz-qty-stepper>
      </div>

      <button class="btn btn-primary btn-block" ?disabled=${this.busy} @click=${this.confirm}>
        ${t("dashboard.quick_consume")}
      </button>
    </div>`;
  }
}
