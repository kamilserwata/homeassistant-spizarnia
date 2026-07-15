import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { t } from "../i18n";

// Destructive-cascade confirmation only (DESIGN §3.7). Shows loss count.
@customElement("spz-confirm-dialog")
export class SpzConfirmDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property() heading = "";
  @property() body = "";
  @property() confirmLabel = "";

  static styles = css`
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 70;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .box {
      background: var(--card-background-color, #1c1c1c);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 22px;
      width: min(400px, 100%);
      color: var(--primary-text-color, #e1e1e1);
    }
    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 500;
    }
    p {
      margin: 0 0 20px;
      font-size: 14px;
      color: var(--secondary-text-color, #9b9b9b);
      line-height: 1.5;
    }
    .actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    button {
      font-family: inherit;
      cursor: pointer;
      border-radius: 10px;
      padding: 12px 18px;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: transparent;
      color: var(--primary-text-color, #e1e1e1);
    }
    .danger {
      background: var(--error-color, #ef5350);
      color: #fff;
      border: none;
    }
  `;

  private cancel() {
    this.dispatchEvent(new CustomEvent("confirm-cancel"));
  }
  private confirm() {
    this.dispatchEvent(new CustomEvent("confirm-ok"));
  }

  render() {
    if (!this.open) return html``;
    return html`<div class="scrim" @click=${this.cancel}>
      <div class="box" role="alertdialog" aria-modal="true" @click=${(e: Event) => e.stopPropagation()}>
        <h3>${this.heading}</h3>
        <p>${this.body}</p>
        <div class="actions">
          <button @click=${this.cancel}>${t("common.cancel")}</button>
          <button class="danger" @click=${this.confirm}>
            ${this.confirmLabel || t("common.delete")}
          </button>
        </div>
      </div>
    </div>`;
  }
}
