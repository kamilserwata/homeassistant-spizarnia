import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { FreshnessStatus, Precision } from "../types";
import { badgeText, formatBestBefore } from "../lib/dates";
import { getLanguage } from "../i18n";

// Status pill: colored background (12% tint) + full-color text (DESIGN §5).
@customElement("spz-freshness-badge")
export class SpzFreshnessBadge extends LitElement {
  @property() status: FreshnessStatus = "ok";
  @property() date: string | null = null;
  @property() precision: Precision = "day";
  @property({ type: Number }) daysLeft: number | null = null;

  static styles = css`
    span {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 999px;
      white-space: nowrap;
      line-height: 1.3;
    }
    .expired {
      color: var(--error-color, #ef5350);
      background: color-mix(in srgb, transparent 88%, var(--error-color, #ef5350) 12%);
    }
    .expiring_soon {
      color: var(--warning-color, #ffa726);
      background: color-mix(in srgb, transparent 88%, var(--warning-color, #ffa726) 12%);
    }
    .ok {
      color: var(--success-color, #66bb6a);
      background: color-mix(in srgb, transparent 88%, var(--success-color, #66bb6a) 12%);
    }
    .no_date {
      color: var(--secondary-text-color, #9b9b9b);
      background: color-mix(in srgb, transparent 90%, var(--secondary-text-color, #9b9b9b) 10%);
    }
  `;

  render() {
    const formatted = formatBestBefore(this.date, this.precision, getLanguage());
    const text = badgeText(this.status, this.daysLeft, formatted);
    return html`<span class=${this.status} title=${formatted}>${text}</span>`;
  }
}
