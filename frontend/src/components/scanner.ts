import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { t } from "../i18n";
import {
  isSecureForCamera,
  startScanner,
  type ScannerHandle,
} from "../lib/barcode";

// Fullscreen camera overlay: aiming frame, torch, manual input, serial mode.
@customElement("spz-scanner")
export class SpzScanner extends LitElement {
  @property({ type: Number }) sessionCount = 0;
  @property({ type: Boolean }) serial = true;
  @state() private error: "camera" | "https" | "" = "";
  @state() private torchOn = false;
  @state() private torchSupported = false;
  @state() private flash = false;
  @query("video") private video!: HTMLVideoElement;
  private handle?: ScannerHandle;

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: linear-gradient(150deg, #0b141a, #1d2f38);
      display: flex;
      flex-direction: column;
      color: #fff;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }
    .icon-btn {
      border: none;
      background: rgba(0, 0, 0, 0.35);
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
    }
    .counter {
      margin-left: auto;
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 13px;
    }
    .torch.on {
      background: var(--primary-color, #03a9f4);
    }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 32px;
      position: relative;
      overflow: hidden;
    }
    video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .frame {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 2;
      border-radius: 16px;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .frame.flash {
      border-color: var(--success-color, #66bb6a);
      box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.4),
        0 0 24px var(--success-color, #66bb6a);
    }
    .laser {
      width: 78%;
      height: 2px;
      background: var(--primary-color, #03a9f4);
      box-shadow: 0 0 14px var(--primary-color, #03a9f4);
    }
    .hint {
      text-align: center;
      font-size: 13px;
      opacity: 0.85;
      margin-bottom: 14px;
    }
    .serial-row {
      display: flex;
      justify-content: center;
      margin-bottom: 14px;
    }
    .serial {
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-radius: 999px;
      padding: 8px 16px;
      font-size: 13px;
      cursor: pointer;
    }
    .serial.on {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
    }
    .manual {
      padding: 16px;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .manual input {
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-radius: 10px;
      padding: 12px;
      font-size: 15px;
    }
    .manual button {
      border: none;
      background: var(--primary-color, #03a9f4);
      color: #fff;
      font-weight: 600;
      padding: 12px 16px;
      border-radius: 10px;
      cursor: pointer;
      white-space: nowrap;
    }
    .error {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 12px;
      padding: 24px;
    }
    .error .big {
      font-size: 48px;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    if (!isSecureForCamera()) {
      this.error = "https";
      return;
    }
    await this.updateComplete;
    try {
      this.handle = await startScanner(this.video, (code) => this.onDetect(code));
      this.torchSupported = this.handle.torchSupported;
    } catch {
      this.error = "camera";
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.handle?.stop();
  }

  private onDetect(code: string) {
    this.flash = true;
    setTimeout(() => (this.flash = false), 300);
    this.dispatchEvent(new CustomEvent("code", { detail: { code } }));
  }

  private submitManual(e: Event) {
    e.preventDefault();
    const input = this.renderRoot.querySelector<HTMLInputElement>(".manual input");
    const code = input?.value.trim();
    if (code) {
      this.onDetect(code);
      if (input) input.value = "";
    }
  }

  private async toggleTorch() {
    const ok = await this.handle?.setTorch(!this.torchOn);
    if (ok) this.torchOn = !this.torchOn;
  }

  private close() {
    this.dispatchEvent(new CustomEvent("scanner-close"));
  }

  private toggleSerial() {
    this.serial = !this.serial;
    this.dispatchEvent(
      new CustomEvent("serial-changed", { detail: { serial: this.serial } })
    );
  }

  render() {
    return html`
      <div class="top">
        <button class="icon-btn" aria-label=${t("common.close")} @click=${this.close}>
          ✕
        </button>
        <div class="counter">${t("scan.session_added", { n: this.sessionCount })}</div>
        ${this.torchSupported
          ? html`<button
              class="icon-btn torch ${this.torchOn ? "on" : ""}"
              aria-label="🔦"
              @click=${this.toggleTorch}
            >
              🔦
            </button>`
          : ""}
      </div>

      ${this.error
        ? html`<div class="error">
            <div class="big">${this.error === "https" ? "🔒" : "📷"}</div>
            <div style="font-size:18px;font-weight:500;">
              ${this.error === "https" ? t("scan.no_https") : t("scan.no_camera")}
            </div>
            <div style="font-size:14px;opacity:.8;max-width:320px;">
              ${this.error === "https" ? t("scan.no_https_sub") : t("scan.no_camera_sub")}
            </div>
          </div>`
        : html`
            <div class="stage">
              <video muted playsinline></video>
              <div class="frame ${this.flash ? "flash" : ""}">
                <div class="laser"></div>
              </div>
            </div>
            <div class="hint">${t("scan.hint")}</div>
            <div class="serial-row">
              <button class="serial ${this.serial ? "on" : ""}" @click=${this.toggleSerial}>
                ${this.serial ? t("scan.serial_on") : t("scan.serial_off")}
              </button>
            </div>
          `}

      <form class="manual" @submit=${this.submitManual}>
        <input inputmode="numeric" placeholder=${t("scan.manual")} />
        <button type="submit">OK</button>
      </form>
    `;
  }
}
