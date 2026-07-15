import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AppState } from "../state";
import type { ShelfWithCounts } from "../types";
import { t, batches } from "../i18n";
import { tokens, shared } from "../styles";
import { navigate } from "../router";
import "../components/empty-state";
import "../components/bottom-sheet";

// Room view: shelves as full-width cards + inline "add shelf" prompt (DESIGN §6.2).
@customElement("spz-view-room")
export class SpzViewRoom extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property() roomId = "";
  @property({ type: Boolean }) narrow = true;

  @state() private shelves: ShelfWithCounts[] = [];
  @state() private loading = true;
  @state() private addOpen = false;
  @state() private addValue = "";

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 12px; }
    .shelf {
      text-align: left; cursor: pointer; width: 100%;
      border: 1px solid var(--spz-divider); border-radius: var(--spz-radius);
      background: var(--spz-card); padding: 16px; font-family: inherit;
      display: flex; flex-direction: column; gap: 12px;
    }
    .shelf .top { display: flex; align-items: center; gap: 10px; }
    .shelf .name { font-size: 16px; font-weight: 500; color: var(--spz-text); }
    .shelf .meta { font-size: 13px; color: var(--spz-text-2); margin-left: auto; }
    .dots { display: flex; gap: 5px; }
    .dot { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700;
      border-radius: 999px; padding: 2px 7px; }
    .dot.exp { color: var(--spz-error); background: color-mix(in srgb, transparent 86%, var(--spz-error) 14%); }
    .dot.soon { color: var(--spz-warning); background: color-mix(in srgb, transparent 86%, var(--spz-warning) 14%); }
    .preview { display: flex; align-items: center; gap: 6px; }
    .preview .glyph { font-size: 22px; line-height: 1; }
    .preview img { width: 26px; height: 26px; border-radius: 6px; object-fit: cover; }
    .preview .more { font-size: 13px; color: var(--spz-text-2); font-weight: 500; margin-left: 2px; }
    .add-shelf {
      cursor: pointer; border: 1.5px dashed var(--spz-divider); border-radius: var(--spz-radius);
      background: transparent; color: var(--spz-text-2); padding: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 14px; min-height: 56px; font-family: inherit; width: 100%;
    }
    .sheet-title { font-size: 18px; font-weight: 500; color: var(--spz-text); margin-bottom: 14px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 18px; }
    .empty-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  `];

  private unsub?: () => void;
  private lastSignal = -1;
  connectedCallback() {
    super.connectedCallback();
    this.unsub = this.appState.subscribe(() => {
      if (this.appState.changeSignal !== this.lastSignal) {
        this.lastSignal = this.appState.changeSignal;
        void this.load();
      }
    });
    void this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsub?.();
  }
  updated(changed: Map<string, unknown>) {
    if (changed.has("roomId")) void this.load();
  }

  private async load() {
    this.loading = true;
    const res = await this.appState.api.listShelves(this.roomId);
    this.shelves = res.shelves;
    this.loading = false;
  }

  private async createShelf(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    await this.appState.api.createShelf(this.roomId, trimmed);
    this.addOpen = false;
    this.addValue = "";
    void this.load();
  }

  private quickChips() {
    return [
      t("room.shelf_top"),
      t("room.shelf_mid"),
      t("room.shelf_bottom"),
      t("room.shelf_rack"),
    ];
  }

  render() {
    if (this.loading && this.shelves.length === 0)
      return html`<div class="wrap">
        ${[1, 2, 3].map(() => html`<div class="card" style="height:96px"></div>`)}
      </div>`;

    if (this.shelves.length === 0)
      return html`<div class="wrap">
        <spz-empty-state emoji="🗄️" heading=${t("room.empty_title")} description=${t("room.empty_sub")}>
          <div class="empty-chips">
            ${this.quickChips().map(
              (name) => html`<button class="chip" @click=${() => this.createShelf(name)}>${name}</button>`
            )}
          </div>
        </spz-empty-state>
        ${this.renderSheet()}
      </div>`;

    return html`<div class="wrap">
      ${this.shelves.map((s) => this.renderShelf(s))}
      <button class="add-shelf" @click=${() => (this.addOpen = true)}>＋ ${t("room.add_shelf")}</button>
      ${this.renderSheet()}
    </div>`;
  }

  private renderShelf(s: ShelfWithCounts) {
    const preview = s.preview.slice(0, 8);
    const more = s.preview.length > 8 ? s.preview.length - 8 : 0;
    return html`<button class="shelf" @click=${() => navigate("shelf", s.id)}>
      <div class="top">
        <span class="name">${s.name}</span>
        <div class="dots">
          ${s.expired ? html`<span class="dot exp">${s.expired}</span>` : ""}
          ${s.expiring ? html`<span class="dot soon">${s.expiring}</span>` : ""}
        </div>
        <span class="meta">${batches(s.item_count)}</span>
      </div>
      ${preview.length
        ? html`<div class="preview">
            ${preview.map((p) =>
              p.image
                ? html`<img src=${p.image} alt="" aria-hidden="true" />`
                : html`<span class="glyph" aria-hidden="true">${p.emoji}</span>`
            )}
            ${more ? html`<span class="more">+${more}</span>` : ""}
          </div>`
        : ""}
    </button>`;
  }

  private renderSheet() {
    if (!this.addOpen) return html``;
    return html`<spz-bottom-sheet open .narrow=${this.narrow} @sheet-close=${() => (this.addOpen = false)}>
      <div class="sheet-title">${t("room.add_shelf")}</div>
      <input
        type="text"
        .value=${this.addValue}
        placeholder=${t("room.shelf_name_placeholder")}
        @input=${(e: Event) => (this.addValue = (e.target as HTMLInputElement).value)}
        @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") void this.createShelf(this.addValue); }}
      />
      <div class="chips">
        ${this.quickChips().map(
          (name) => html`<button class="chip" @click=${() => (this.addValue = name)}>${name}</button>`
        )}
      </div>
      <button class="btn btn-primary btn-block" @click=${() => this.createShelf(this.addValue)}>
        ${t("common.add")}
      </button>
    </spz-bottom-sheet>`;
  }
}
