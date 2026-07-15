import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

// Large ± stepper with editable field and a tick bump on change (DESIGN §10).
@customElement("spz-qty-stepper")
export class SpzQtyStepper extends LitElement {
  @property({ type: Number }) value = 1;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 9999;
  @property({ type: Number }) step = 1;
  @state() private bump = false;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    button {
      width: 52px;
      height: 52px;
      flex: none;
      border-radius: 14px;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
      font-size: 28px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .value {
      flex: 1;
      text-align: center;
      font-size: 30px;
      font-weight: 500;
      color: var(--primary-text-color, #e1e1e1);
    }
    .bump {
      animation: tick 0.2s ease;
    }
    @keyframes tick {
      0% {
        transform: scale(1);
      }
      40% {
        transform: scale(1.25);
      }
      100% {
        transform: scale(1);
      }
    }
  `;

  private change(delta: number) {
    const next = Math.max(this.min, Math.min(this.max, +(this.value + delta).toFixed(3)));
    if (next === this.value) return;
    this.value = next;
    this.bump = true;
    setTimeout(() => (this.bump = false), 220);
    this.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: this.value } })
    );
  }

  render() {
    return html`
      <button
        aria-label="−"
        ?disabled=${this.value <= this.min}
        @click=${() => this.change(-this.step)}
      >
        −
      </button>
      <div class="value ${this.bump ? "bump" : ""}">${this.value}</div>
      <button
        aria-label="+"
        ?disabled=${this.value >= this.max}
        @click=${() => this.change(this.step)}
      >
        ＋
      </button>
    `;
  }
}
