import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Room, Shelf } from "../types";
import { t } from "../i18n";

// Two-step room → shelf picker (DESIGN §9). Emits shelf-picked with shelf id.
@customElement("spz-location-picker")
export class SpzLocationPicker extends LitElement {
  @property({ attribute: false }) rooms: Room[] = [];
  @property({ attribute: false }) shelves: Shelf[] = [];
  @state() private roomId = "";

  static styles = css`
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    button {
      font-family: inherit;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      border-radius: 12px;
      padding: 14px 16px;
      color: var(--primary-text-color, #e1e1e1);
      font-size: 15px;
    }
    .chevron {
      margin-left: auto;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .back {
      background: none;
      border: none;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 14px;
      padding: 0 0 10px;
    }
    .title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color, #e1e1e1);
    }
  `;

  private pickShelf(shelfId: string) {
    this.dispatchEvent(
      new CustomEvent("shelf-picked", { detail: { shelfId } })
    );
  }

  render() {
    if (!this.roomId) {
      return html`
        <div class="title">${t("nav.rooms")}</div>
        <div class="list">
          ${this.rooms.map(
            (r) => html`<button @click=${() => (this.roomId = r.id)}>
              <ha-icon icon=${r.icon}></ha-icon>
              <span>${r.name}</span>
              <span class="chevron">›</span>
            </button>`
          )}
        </div>
      `;
    }
    const shelves = this.shelves.filter((s) => s.room_id === this.roomId);
    return html`
      <button class="back" @click=${() => (this.roomId = "")}>‹ ${t("common.back")}</button>
      <div class="title">${t("room.shelves")}</div>
      <div class="list">
        ${shelves.map(
          (s) => html`<button @click=${() => this.pickShelf(s.id)}>
            <span>${s.name}</span>
            <span class="chevron">›</span>
          </button>`
        )}
      </div>
    `;
  }
}
