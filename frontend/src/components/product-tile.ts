import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { FreshnessStatus, Precision } from "../types";
import { categoryTint, productGlyph } from "../lib/categories";
import "./freshness-badge";

// Batch / group tile: glyph or image, name, quantity, badge, category tint.
@customElement("spz-product-tile")
export class SpzProductTile extends LitElement {
  @property() name = "";
  @property() emoji = "";
  @property() image: string | null = null;
  @property() category = "other";
  @property() qtyLabel = "";
  @property() status: FreshnessStatus = "ok";
  @property() date: string | null = null;
  @property() precision: Precision = "day";
  @property({ type: Number }) daysLeft: number | null = null;
  @property({ type: Boolean }) opened = false;
  @property({ type: Boolean }) group = false;
  @property() groupInfo = "";

  static styles = css`
    .tile {
      position: relative;
      cursor: pointer;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 150px;
    }
    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    .glyph {
      font-size: 40px;
      line-height: 1;
    }
    .img {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
    }
    .name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .qty-row {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
    }
    .opened {
      font-size: 11px;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .group-info {
      font-size: 11px;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .minus {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `;

  private open() {
    this.dispatchEvent(new CustomEvent("tile-open"));
  }
  private minus(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("tile-minus"));
  }

  render() {
    return html`
      <div
        class="tile"
        style="background:${categoryTint(this.category)}"
        @click=${this.open}
      >
        <spz-freshness-badge
          class="badge"
          .status=${this.status}
          .date=${this.date}
          .precision=${this.precision}
          .daysLeft=${this.daysLeft}
        ></spz-freshness-badge>
        ${this.image
          ? html`<img class="img" src=${this.image} alt="" aria-hidden="true" />`
          : html`<div class="glyph" aria-hidden="true">
              ${productGlyph(this.emoji, this.category)}
            </div>`}
        <div class="name">${this.name}</div>
        <div class="qty-row">
          <span>${this.qtyLabel}</span>
          ${this.opened ? html`<span class="opened">· 🥄</span>` : ""}
        </div>
        ${this.group ? html`<div class="group-info">${this.groupInfo}</div>` : ""}
        <button class="minus" aria-label="−1" @click=${this.minus}>−</button>
      </div>
    `;
  }
}
