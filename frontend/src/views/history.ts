import { LitElement, css, html } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import type { AppState } from "../state";
import type { HistoryEntry } from "../types";
import { t, getLanguage } from "../i18n";
import { tokens, shared } from "../styles";
import { relativeTime, dayGroup } from "../lib/dates";
import { historyIcon, historyText } from "../lib/history";
import "../components/empty-state";

const PAGE = 50;

interface DayGroupBlock {
  header: string;
  entries: HistoryEntry[];
}

@customElement("spz-view-history")
export class SpzViewHistory extends LitElement {
  @property({ attribute: false }) appState!: AppState;
  @property({ type: Boolean }) narrow = true;

  @state() private entries: HistoryEntry[] = [];
  @state() private total = 0;
  @state() private type?: string;
  @state() private loading = false;

  @query("#sentinel") private sentinel?: HTMLElement;

  private offset = 0;
  private observer?: IntersectionObserver;

  private readonly filters: { key: string; type?: string }[] = [
    { key: "history.all", type: undefined },
    { key: "history.added", type: "add" },
    { key: "history.consumed", type: "consume" },
    { key: "history.trashed", type: "delete" },
  ];

  static styles = [tokens, shared, css`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 16px; }
    .filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
    .filters .chip { min-height: 40px; }
    .group { display: flex; flex-direction: column; gap: 8px; }
    .group-head { font-size: 13px; font-weight: 600; color: var(--spz-text-2);
      text-transform: uppercase; letter-spacing: 0.04em; padding: 0 2px; }
    .act-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
    .act-row + .act-row { border-top: 1px solid var(--spz-divider); }
    .act-ico { width: 34px; height: 34px; flex: none; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 16px; background: var(--spz-bg-2); }
    .act-text { font-size: 14px; color: var(--spz-text); line-height: 1.3; }
    .act-meta { font-size: 12px; color: var(--spz-text-2); margin-top: 2px; }
    #sentinel { height: 1px; }
    .loading { font-size: 13px; color: var(--spz-text-2); text-align: center; padding: 12px 0; }
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
    this.observer?.disconnect();
  }

  firstUpdated() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void this.loadMore();
      },
      { rootMargin: "300px" }
    );
    if (this.sentinel) this.observer.observe(this.sentinel);
  }

  private async load() {
    this.loading = true;
    this.offset = 0;
    const res = await this.appState.api.listHistory({
      limit: PAGE,
      offset: 0,
      type: this.type,
    });
    this.entries = res.entries;
    this.total = res.total;
    this.offset = res.entries.length;
    this.loading = false;
  }

  private async loadMore() {
    if (this.loading || this.entries.length >= this.total) return;
    this.loading = true;
    const res = await this.appState.api.listHistory({
      limit: PAGE,
      offset: this.offset,
      type: this.type,
    });
    this.entries = [...this.entries, ...res.entries];
    this.total = res.total;
    this.offset += res.entries.length;
    this.loading = false;
  }

  private setFilter(type?: string) {
    if (this.type === type) return;
    this.type = type;
    void this.load();
  }

  private buildGroups(lang: string): DayGroupBlock[] {
    const groups: DayGroupBlock[] = [];
    for (const entry of this.entries) {
      const raw = dayGroup(entry.ts, lang);
      const header =
        raw === "__today__"
          ? t("history.today")
          : raw === "__yesterday__"
          ? t("history.yesterday")
          : raw;
      const last = groups[groups.length - 1];
      if (last && last.header === header) last.entries.push(entry);
      else groups.push({ header, entries: [entry] });
    }
    return groups;
  }

  render() {
    const lang = getLanguage();
    const groups = this.buildGroups(lang);

    return html`<div class="wrap">
      <div class="filters">
        ${this.filters.map(
          (f) => html`<button
            class="chip ${this.type === f.type ? "active" : ""}"
            @click=${() => this.setFilter(f.type)}
          >
            ${t(f.key)}
          </button>`
        )}
      </div>

      ${!this.loading && this.entries.length === 0
        ? html`<spz-empty-state emoji="🕓" heading=${t("history.empty")}></spz-empty-state>`
        : groups.map(
            (g) => html`<div class="group">
              <div class="group-head">${g.header}</div>
              <div class="card">
                ${g.entries.map(
                  (h) => html`<div class="act-row">
                    <span class="act-ico" aria-hidden="true">${historyIcon(h.type)}</span>
                    <div style="flex:1;min-width:0;">
                      <div class="act-text">${historyText(h)}</div>
                      <div class="act-meta">${relativeTime(h.ts, lang)}${h.user_name ? ` · ${h.user_name}` : ""}</div>
                    </div>
                  </div>`
                )}
              </div>
            </div>`
          )}

      ${this.loading && this.entries.length > 0
        ? html`<div class="loading">${t("common.loading")}</div>`
        : ""}
      <div id="sentinel"></div>
    </div>`;
  }
}
