import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { AppState } from "../state";
import type { HistoryEntry } from "../types";
import { t, batches, plural, getLanguage } from "../i18n";
import { tokens, shared } from "../styles";
import { navigate } from "../router";
import { relativeTime } from "../lib/dates";
import { historyIcon, historyText } from "../lib/history";
import "../components/empty-state";

@customElement("spz-view-dashboard")
export class SpzViewDashboard extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ type: Boolean }) narrow = true;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 20px; }
    .alerts { display: grid; gap: 12px; }
    .alert {
      text-align: left; cursor: pointer; display: flex; align-items: center; gap: 12px;
      border: 1px solid var(--spz-divider); border-radius: var(--spz-radius);
      padding: 14px 16px; background: var(--spz-card);
      font-family: inherit;
    }
    .alert .num { font-size: 20px; font-weight: 700; line-height: 1; }
    .alert .lbl { font-size: 13px; color: var(--spz-text-2); margin-top: 3px; }
    .alert .ico { font-size: 22px; }
    .alert .chev { margin-left: auto; color: var(--spz-text-2); font-size: 20px; }
    .quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .quick button {
      cursor: pointer; border: 1px solid var(--spz-divider); border-radius: var(--spz-radius);
      background: var(--spz-card); color: var(--spz-text); padding: 16px 8px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      font-family: inherit; font-size: 14px; font-weight: 500; min-height: 48px;
    }
    .quick .ico { font-size: 24px; }
    .rooms { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .room {
      text-align: left; cursor: pointer; border: 1px solid var(--spz-divider);
      border-radius: var(--spz-radius); background: var(--spz-card); padding: 16px;
      display: flex; flex-direction: column; gap: 10px; font-family: inherit;
    }
    .room .top { display: flex; align-items: center; gap: 10px; }
    .room ha-icon { --mdc-icon-size: 26px; color: var(--spz-text); }
    .room .name { font-size: 16px; font-weight: 500; color: var(--spz-text); }
    .room .meta { font-size: 13px; color: var(--spz-text-2); }
    .dots { display: flex; gap: 5px; margin-left: auto; }
    .dot { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700;
      border-radius: 999px; padding: 2px 7px; }
    .dot.exp { color: var(--spz-error); background: color-mix(in srgb, transparent 86%, var(--spz-error) 14%); }
    .dot.soon { color: var(--spz-warning); background: color-mix(in srgb, transparent 86%, var(--spz-warning) 14%); }
    .new-room {
      cursor: pointer; border: 1.5px dashed var(--spz-divider); border-radius: var(--spz-radius);
      background: transparent; color: var(--spz-text-2); padding: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 14px; min-height: 88px; font-family: inherit;
    }
    .activity-head { display: flex; align-items: center; margin-bottom: 6px; }
    .activity-head a { margin-left: auto; font-size: 13px; }
    .act-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-top: 1px solid var(--spz-divider); }
    .act-ico { width: 34px; height: 34px; flex: none; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 16px; background: var(--spz-bg-2); }
    .act-text { font-size: 14px; color: var(--spz-text); line-height: 1.3; }
    .act-meta { font-size: 12px; color: var(--spz-text-2); }
    @media (min-width: 700px) {
      .rooms { grid-template-columns: repeat(3, 1fr); }
      .alerts { grid-template-columns: repeat(3, 1fr); }
    }
  `];

  private unsub?: () => void;
  connectedCallback() {
    super.connectedCallback();
    this.unsub = this.appState.subscribe(() => this.requestUpdate());
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsub?.();
  }

  private goStatus(status: string) {
    window.dispatchEvent(new CustomEvent("spz-status-filter", { detail: { status } }));
  }

  render() {
    const ov = this.appState.overview;
    if (!ov) return html`<div class="wrap">${this.skeleton()}</div>`;
    const s = ov.stats;
    const days = this.appState.settings?.expiring_soon_days ?? 30;
    const lang = getLanguage();

    const alerts = [];
    if (s.expired > 0)
      alerts.push({ ico: "🔴", num: s.expired, color: "var(--spz-error)",
        lbl: t("dashboard.expired"), status: "expired" });
    if (s.expiring_soon > 0)
      alerts.push({ ico: "🟠", num: s.expiring_soon, color: "var(--spz-warning)",
        lbl: t("dashboard.expiring", { days }), status: "expiring_soon" });
    if (s.low_stock > 0)
      alerts.push({ ico: "🛒", num: s.low_stock, color: "var(--spz-info)",
        lbl: t("dashboard.low_stock"), status: "low_stock" });

    return html`<div class="wrap">
      ${alerts.length
        ? html`<div class="alerts">
            ${alerts.map(
              (a) => html`<button class="alert" style="border-left:4px solid ${a.color}"
                @click=${() => this.goStatus(a.status)}>
                <span class="ico">${a.ico}</span>
                <div style="flex:1;min-width:0;">
                  <div class="num" style="color:${a.color}">${a.num}</div>
                  <div class="lbl">${a.lbl}</div>
                </div>
                <span class="chev">›</span>
              </button>`
            )}
          </div>`
        : html`<div class="alert" style="border-left:4px solid var(--spz-success)">
            <span class="ico">✅</span>
            <div>
              <div class="num" style="color:var(--spz-success)">${t("dashboard.all_fresh")}</div>
              <div class="lbl">${t("dashboard.all_fresh_sub")}</div>
            </div>
          </div>`}

      <div class="quick">
        <button @click=${() => navigate("scan")}><span class="ico">📷</span>${t("dashboard.quick_scan")}</button>
        <button @click=${() => navigate("add")}><span class="ico">➕</span>${t("dashboard.quick_add")}</button>
        <button @click=${() => window.dispatchEvent(new CustomEvent("spz-consume-scan"))}>
          <span class="ico">➖</span>${t("dashboard.quick_consume")}
        </button>
      </div>

      <div>
        <div class="section-label">${t("dashboard.rooms")}</div>
        <div class="rooms">
          ${ov.rooms.map(
            (r) => html`<button class="room" @click=${() => navigate("room", r.id)}>
              <div class="top">
                <ha-icon icon=${r.icon}></ha-icon>
                <div class="dots">
                  ${r.expired ? html`<span class="dot exp">${r.expired}</span>` : ""}
                  ${r.expiring ? html`<span class="dot soon">${r.expiring}</span>` : ""}
                </div>
              </div>
              <div class="name">${r.name}</div>
              <div class="meta">${batches(r.item_count)} · ${r.shelf_count} ${plural(r.shelf_count, ["półka", "półki", "półek"])}</div>
            </button>`
          )}
          <button class="new-room" @click=${() => window.dispatchEvent(new CustomEvent("spz-new-room"))}>
            ${t("dashboard.new_room")}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="activity-head">
          <div class="section-title" style="margin-bottom:0">${t("dashboard.activity")}</div>
          <a href="#" @click=${(e: Event) => { e.preventDefault(); navigate("history"); }}>${t("dashboard.all_history")}</a>
        </div>
        ${ov.recent_history.length
          ? ov.recent_history.map((h: HistoryEntry) => html`<div class="act-row">
              <span class="act-ico">${historyIcon(h.type)}</span>
              <div style="flex:1;min-width:0;">
                <div class="act-text">${historyText(h)}</div>
                <div class="act-meta">${relativeTime(h.ts, lang)}${h.user_name ? ` · ${h.user_name}` : ""}</div>
              </div>
            </div>`)
          : html`<div class="act-meta" style="padding:11px 0">${t("history.empty")}</div>`}
      </div>
    </div>`;
  }

  private skeleton() {
    return html`<div class="card" style="height:72px"></div>
      <div class="card" style="height:88px"></div>
      <div class="card" style="height:160px"></div>`;
  }
}
