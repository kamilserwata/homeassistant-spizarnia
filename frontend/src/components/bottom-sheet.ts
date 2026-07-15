import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

// Mobile bottom sheet / desktop centered dialog with scrim + drag-to-dismiss.
@customElement("spz-bottom-sheet")
export class SpzBottomSheet extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean }) narrow = true;

  static styles = css`
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0, 0, 0, 0.5);
      animation: scrim 0.2s ease;
    }
    .sheet {
      position: fixed;
      z-index: 41;
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
      max-height: 88vh;
      overflow-y: auto;
      padding: 12px 20px 24px;
    }
    .narrow {
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 20px 20px 0 0;
      animation: up 0.24s ease;
    }
    .wide {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(480px, 92vw);
      border-radius: var(--ha-card-border-radius, 12px);
      animation: fade 0.2s ease;
    }
    .handle {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: var(--divider-color, rgba(225, 225, 225, 0.12));
      margin: 0 auto 16px;
    }
    @keyframes up {
      from {
        transform: translateY(100%);
      }
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes scrim {
      from {
        opacity: 0;
      }
    }
  `;

  private close() {
    this.dispatchEvent(new CustomEvent("sheet-close"));
  }

  private startY = 0;
  private dragging = false;
  private onDown(e: PointerEvent) {
    if (!this.narrow) return;
    this.dragging = true;
    this.startY = e.clientY;
  }
  private onUp(e: PointerEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    if (e.clientY - this.startY > 100) this.close();
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="scrim" @click=${this.close}></div>
      <div class="sheet ${this.narrow ? "narrow" : "wide"}" role="dialog" aria-modal="true">
        ${this.narrow
          ? html`<div
              class="handle"
              @pointerdown=${this.onDown}
              @pointerup=${this.onUp}
            ></div>`
          : ""}
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.open) this.close();
    };
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  private _onKey!: (e: KeyboardEvent) => void;
}
