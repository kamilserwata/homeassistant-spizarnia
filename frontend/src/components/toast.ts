import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { t } from "../i18n";

interface ToastItem {
  id: number;
  message: string;
  undo?: () => void;
}

// Toast queue with a 5s Undo action (DESIGN §3.7). Live region for a11y.
@customElement("spz-toast")
export class SpzToast extends LitElement {
  @state() private queue: ToastItem[] = [];
  private seq = 0;

  static styles = css`
    :host {
      position: fixed;
      left: 50%;
      bottom: 88px;
      transform: translateX(-50%);
      z-index: 60;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: min(440px, calc(100vw - 32px));
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-background-color, #202124);
      color: var(--primary-text-color, #e1e1e1);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 14px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      animation: toast 0.2s ease;
    }
    .msg {
      flex: 1;
    }
    button {
      border: none;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    @keyframes toast {
      from {
        transform: translateY(24px);
        opacity: 0;
      }
    }
  `;

  show(message: string, undo?: () => void) {
    const id = ++this.seq;
    this.queue = [...this.queue, { id, message, undo }];
    setTimeout(() => this.dismiss(id), 5000);
  }

  private dismiss(id: number) {
    this.queue = this.queue.filter((tt) => tt.id !== id);
  }

  private runUndo(item: ToastItem) {
    item.undo?.();
    this.dismiss(item.id);
  }

  render() {
    return html`<div aria-live="polite">
      ${this.queue.map(
        (item) => html`
          <div class="toast">
            <span class="msg">${item.message}</span>
            ${item.undo
              ? html`<button @click=${() => this.runUndo(item)}>
                  ${t("common.undo")}
                </button>`
              : ""}
          </div>
        `
      )}
    </div>`;
  }
}

// Convenience: dispatch a global toast from anywhere in the panel.
export function toast(message: string, undo?: () => void) {
  window.dispatchEvent(
    new CustomEvent("spz-toast", { detail: { message, undo } })
  );
}
