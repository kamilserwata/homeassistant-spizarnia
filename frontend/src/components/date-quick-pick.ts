import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Precision } from "../types";
import { t, getLanguage } from "../i18n";
import {
  addMonths,
  addYears,
  endOfYear,
  formatBestBefore,
} from "../lib/dates";

export interface DateValue {
  date: string | null;
  precision: Precision;
}

// Relative date chips + calendar + precision (DESIGN §7.1).
@customElement("spz-date-quick-pick")
export class SpzDateQuickPick extends LitElement {
  @property() date: string | null = null;
  @property() precision: Precision = "day";
  @property({ type: Boolean }) suggested = false;
  @state() private activeChip = "";

  static styles = css`
    .chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    button.chip {
      font-family: inherit;
      cursor: pointer;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 13px;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
    }
    button.chip.active {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .selected {
      margin-top: 14px;
      font-size: 26px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .suggested {
      font-size: 12px;
      font-weight: 600;
      color: var(--success-color, #66bb6a);
      background: color-mix(
        in srgb,
        var(--card-background-color, #1c1c1c) 82%,
        var(--success-color, #66bb6a) 18%
      );
      padding: 3px 9px;
      border-radius: 999px;
    }
    input[type="date"] {
      font-family: inherit;
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 8px;
      padding: 8px;
    }
    .cal {
      margin-top: 12px;
    }
  `;

  private emit(val: DateValue, chip: string) {
    this.activeChip = chip;
    this.date = val.date;
    this.precision = val.precision;
    this.suggested = false;
    this.dispatchEvent(new CustomEvent("date-changed", { detail: val }));
  }

  private onCalendar(e: Event) {
    const value = (e.target as HTMLInputElement).value || null;
    this.emit({ date: value, precision: "day" }, "pick");
  }

  render() {
    const lang = getLanguage();
    const chips: { key: string; label: string; val: () => DateValue }[] = [
      { key: "none", label: t("date.none"), val: () => ({ date: null, precision: "none" }) },
      { key: "3m", label: t("date.3m"), val: () => addMonths(3) },
      { key: "6m", label: t("date.6m"), val: () => addMonths(6) },
      { key: "1y", label: t("date.1y"), val: () => addYears(1) },
      { key: "2y", label: t("date.2y"), val: () => addYears(2) },
      { key: "eoy", label: t("date.eoy"), val: () => endOfYear() },
    ];
    const display =
      this.precision === "none" || !this.date
        ? t("date.no_date")
        : formatBestBefore(this.date, this.precision, lang);
    return html`
      <div class="chips">
        ${chips.map(
          (c) => html`<button
            class="chip ${this.activeChip === c.key ? "active" : ""}"
            @click=${() => this.emit(c.val(), c.key)}
          >
            ${c.label}
          </button>`
        )}
        <label class="chip" style="display:inline-flex;align-items:center;gap:6px;">
          ${t("date.pick")}
          <input type="date" @change=${this.onCalendar} .value=${this.date ?? ""} />
        </label>
      </div>
      <div class="selected">
        ${display}
        ${this.suggested ? html`<span class="suggested">${t("add.suggested")}</span>` : ""}
      </div>
    `;
  }
}
