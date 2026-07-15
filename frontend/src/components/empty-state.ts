import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

// Teaching empty state: emoji illustration, heading, description, 1-2 CTAs.
@customElement("spz-empty-state")
export class SpzEmptyState extends LitElement {
  @property() emoji = "📦";
  @property() heading = "";
  @property() description = "";

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      padding: 40px 24px;
    }
    .emoji {
      font-size: 56px;
      line-height: 1;
      margin-bottom: 8px;
    }
    .heading {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
    }
    .desc {
      font-size: 14px;
      color: var(--secondary-text-color, #9b9b9b);
      max-width: 320px;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `;

  render() {
    return html`
      <div class="emoji" aria-hidden="true">${this.emoji}</div>
      <div class="heading">${this.heading}</div>
      ${this.description ? html`<div class="desc">${this.description}</div>` : ""}
      <div class="actions"><slot></slot></div>
    `;
  }
}
