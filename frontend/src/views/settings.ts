import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { RoomOverview } from "../types";
import { t, batches } from "../i18n";
import { tokens, shared } from "../styles";
import "../components/bottom-sheet";
import "../components/confirm-dialog";

// Settings view: alerts, Open Food Facts, rooms/shelves, data, about (DESIGN §6.8).
@customElement("spz-view-settings")
export class SpzViewSettings extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ type: Boolean }) narrow = true;
  @property() version = "";

  @state() private days = -1;
  @state() private renameRoom?: RoomOverview;
  @state() private renameValue = "";
  @state() private deleteTarget?: RoomOverview;
  @state() private deleteShelves = 0;
  @state() private deleteItems = 0;

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .card { display: flex; flex-direction: column; gap: 12px; }
    .head { display: flex; align-items: center; gap: 12px; }
    .head .title { font-size: 15px; font-weight: 600; color: var(--spz-text); }
    .head .knob-wrap { margin-left: auto; }
    .desc { font-size: 13px; color: var(--spz-text-2); }
    input[type="range"] { width: 100%; accent-color: var(--spz-primary); padding: 0; }
    .switch { width: 46px; height: 28px; border-radius: 999px; position: relative;
      background: var(--spz-divider); transition: background .2s; cursor: pointer; flex: none; }
    .switch.on { background: var(--spz-primary); }
    .knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
      border-radius: 50%; background: #fff; transition: transform .2s; }
    .switch.on .knob { transform: translateX(18px); }
    .room-row { display: flex; align-items: center; gap: 12px; padding: 10px 0;
      border-top: 1px solid var(--spz-divider); }
    .room-row:first-of-type { border-top: none; }
    .grab { color: var(--spz-text-2); font-size: 18px; cursor: grab; user-select: none; }
    .room-main { flex: 1; min-width: 0; text-align: left; background: none; border: none;
      cursor: pointer; font-family: inherit; padding: 4px 0; }
    .room-main .name { font-size: 15px; color: var(--spz-text); }
    .room-main .meta { font-size: 13px; color: var(--spz-text-2); margin-top: 2px; }
    .del { flex: none; display: inline-flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 8px; background: none; border: none;
      cursor: pointer; color: var(--spz-text-2); }
    .del:hover { color: var(--spz-error); }
    .del ha-icon { --mdc-icon-size: 20px; }
    .about-row { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
    .sheet-title { font-size: 18px; font-weight: 500; color: var(--spz-text); margin-bottom: 14px; }
    .sheet-actions { display: flex; gap: 10px; margin-top: 16px; }
    .sheet-actions .btn { flex: 1; }
  `];

  private unsub?: () => void;
  private slideTimer?: number;
  connectedCallback() {
    super.connectedCallback();
    this.unsub = this.appState.subscribe(() => this.requestUpdate());
    if (!this.appState.settings) void this.appState.refreshSettings();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsub?.();
    if (this.slideTimer) clearTimeout(this.slideTimer);
  }

  private onSlide(e: Event) {
    const n = Number((e.target as HTMLInputElement).value);
    this.days = n;
    if (this.slideTimer) clearTimeout(this.slideTimer);
    this.slideTimer = window.setTimeout(() => {
      void this.appState.api.updateSettings({ expiring_soon_days: n });
    }, 400);
  }

  private toggleOff() {
    const enabled = this.appState.settings?.off_enabled ?? false;
    void this.appState.api.updateSettings({ off_enabled: !enabled });
  }

  private openRename(room: RoomOverview) {
    this.renameRoom = room;
    this.renameValue = room.name;
  }

  private async saveRename() {
    if (!this.renameRoom) return;
    const name = this.renameValue.trim();
    if (name) await this.appState.api.updateRoom(this.renameRoom.id, { name });
    this.renameRoom = undefined;
  }

  private async askDelete(room: RoomOverview) {
    const res = await this.appState.api.deleteRoom(room.id, true);
    this.deleteShelves = res.affected_shelves;
    this.deleteItems = res.affected_items;
    this.deleteTarget = room;
  }

  private async confirmDelete() {
    if (!this.deleteTarget) return;
    await this.appState.api.deleteRoom(this.deleteTarget.id, false);
    this.deleteTarget = undefined;
  }

  private async exportJson() {
    const res = await this.appState.api.exportData();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spizarnia-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  render() {
    const settings = this.appState.settings;
    const ov = this.appState.overview;
    const rooms = ov?.rooms ?? [];
    if (this.days === -1 && settings) this.days = settings.expiring_soon_days;
    const days = this.days === -1 ? (settings?.expiring_soon_days ?? 30) : this.days;
    const offEnabled = settings?.off_enabled ?? false;

    return html`<div class="wrap">
      <div class="card">
        <div class="head"><span class="title">${t("settings.alerts")}</span></div>
        <input type="range" min="1" max="365" .value=${String(days)} @input=${this.onSlide} />
        <div class="desc">${t("settings.threshold", { days })}</div>
        <div class="desc">${t("settings.threshold_effect", { batches: batches(ov?.stats.expiring_soon ?? 0) })}</div>
      </div>

      <div class="card">
        <div class="head">
          <span class="title">${t("settings.off")}</span>
          <div class="knob-wrap">
            <div class="switch ${offEnabled ? "on" : ""}" role="switch" aria-checked=${offEnabled}
              @click=${this.toggleOff}><span class="knob"></span></div>
          </div>
        </div>
        <div class="desc">${t("settings.off_desc")}</div>
        <div class="desc">${t("settings.off_locale", { locale: settings?.off_locale ?? "" })}</div>
      </div>

      <div class="card">
        <div class="head"><span class="title">${t("settings.rooms")}</span></div>
        ${rooms.map(
          (r) => html`<div class="room-row">
            <span class="grab" aria-hidden="true">≡</span>
            <button class="room-main" @click=${() => this.openRename(r)}>
              <div class="name">${r.name}</div>
              <div class="meta">${r.shelf_count} · ${batches(r.item_count)}</div>
            </button>
            <button class="del" title=${t("room.delete")} @click=${() => this.askDelete(r)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>`
        )}
      </div>

      <div class="card">
        <div class="head"><span class="title">${t("settings.data")}</span></div>
        <div class="desc">${t("settings.records", { n: ov?.stats.total_items ?? 0 })}</div>
        <button class="btn" @click=${this.exportJson}>${t("settings.export")}</button>
      </div>

      <div class="card">
        <div class="head"><span class="title">${t("settings.about")}</span></div>
        <div class="about-row">
          <span class="desc">${t("settings.version", { version: this.version })}</span>
          <span class="desc">${t("settings.license")}</span>
          <a href="https://github.com/kamilserwata/homeassistant-spizarnia" target="_blank" rel="noopener noreferrer">${t("settings.github")}</a>
        </div>
      </div>

      ${this.renderRenameSheet()}
      ${this.renderDeleteDialog()}
    </div>`;
  }

  private renderRenameSheet() {
    if (!this.renameRoom) return html``;
    return html`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${() => (this.renameRoom = undefined)}>
      <div class="sheet-title">${t("room.rename")}</div>
      <input
        type="text"
        .value=${this.renameValue}
        @input=${(e: Event) => (this.renameValue = (e.target as HTMLInputElement).value)}
        @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") void this.saveRename(); }}
      />
      <div class="sheet-actions">
        <button class="btn" @click=${() => (this.renameRoom = undefined)}>${t("common.cancel")}</button>
        <button class="btn btn-primary" @click=${this.saveRename}>${t("common.save")}</button>
      </div>
    </spz-bottom-sheet>`;
  }

  private renderDeleteDialog() {
    const room = this.deleteTarget;
    if (!room) return html``;
    return html`<spz-confirm-dialog
      open
      heading=${t("confirm.delete_room", { name: room.name })}
      body=${t("confirm.delete_room_body", {
        shelves: t("confirm.shelves", { n: this.deleteShelves }),
        items: t("confirm.items", { n: this.deleteItems }),
      })}
      @confirm-cancel=${() => (this.deleteTarget = undefined)}
      @confirm-ok=${this.confirmDelete}
    ></spz-confirm-dialog>`;
  }
}
