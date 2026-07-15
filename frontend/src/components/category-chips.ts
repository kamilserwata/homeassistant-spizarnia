import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CATEGORIES, CATEGORY_EMOJI } from "../lib/categories";
import { t } from "../i18n";

// Horizontally scrollable category chips, single-select (empty = all).
@customElement("spz-category-chips")
export class SpzCategoryChips extends LitElement {
  @property() selected = "";
  @property({ type: Boolean }) includeAll = true;

  static styles = css`
    .row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }
    button {
      font-family: inherit;
      cursor: pointer;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      border: 1px solid var(--divider-color, rgba(225, 225, 225, 0.12));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e1e1e1);
    }
    button.active {
      background: color-mix(
        in srgb,
        var(--card-background-color, #1c1c1c) 82%,
        var(--primary-color, #03a9f4) 18%
      );
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
  `;

  private pick(cat: string) {
    this.selected = cat;
    this.dispatchEvent(
      new CustomEvent("category-changed", { detail: { category: cat } })
    );
  }

  render() {
    return html`<div class="row">
      ${this.includeAll
        ? html`<button
            class=${this.selected === "" ? "active" : ""}
            @click=${() => this.pick("")}
          >
            ${t("common.all")}
          </button>`
        : ""}
      ${CATEGORIES.map(
        (cat) => html`<button
          class=${this.selected === cat ? "active" : ""}
          @click=${() => this.pick(cat)}
        >
          ${CATEGORY_EMOJI[cat]} ${t("cat." + cat)}
        </button>`
      )}
    </div>`;
  }
}
