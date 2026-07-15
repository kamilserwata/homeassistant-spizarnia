import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import type { HomeAssistant, ProductDefinition, ItemWithMeta } from "./types";
import { AppState } from "./state";
import { setLanguage, t } from "./i18n";
import { tokens, shared } from "./styles";
import { parsePath, navigate, navigateBack, type Route, type ViewName } from "./router";
import { productGlyph } from "./lib/categories";
import "./components/freshness-badge";

import "./components/toast";
import "./components/bottom-sheet";
import "./components/confirm-dialog";
import "./components/scanner";
import "./components/add-form";
import "./components/dispense-form";
import "./components/product-picker";
import "./components/product-form";
import "./components/location-picker";
import { SpzToast } from "./components/toast";

import "./views/dashboard";
import "./views/shelf";
// The remaining views are registered by their own modules.
import "./views/room";
import "./views/catalog";
import "./views/product";
import "./views/history";
import "./views/search";
import "./views/settings";

// Displayed in Settings → About. Bump alongside manifest.json.
const APP_VERSION = "0.1.0";

type Overlay =
  | "none"
  | "add-menu"
  | "scanner"
  | "add-form"
  | "dispense"
  | "picker"
  | "new-product"
  | "move"
  | "status";

type ScanMode = "add" | "consume" | "barcode-for-product";

@customElement("spizarnia-panel")
export class SpizarniaPanel extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) narrow = false;
  @property({ attribute: false }) route?: { prefix: string; path: string };
  @property({ attribute: false }) panel?: unknown;

  @state() private current: Route = { view: "dashboard" };
  @state() private overlay: Overlay = "none";
  @state() private pendingProduct?: ProductDefinition;
  @state() private pendingShelfId = "";
  @state() private scanMode: ScanMode = "add";
  @state() private scanSerial = true;
  @state() private scanSession = 0;
  @state() private scanLooking = false;
  @state() private moveItem?: ItemWithMeta;
  @state() private statusFilter = "";
  @state() private statusItems: ItemWithMeta[] = [];
  @state() private moveShelves: { id: string; room_id: string; name: string; order: number; notes: string }[] = [];
  @state() private presetName = "";
  @state() private presetBarcode = "";
  @state() private headerTitle = "";
  @state() private headerSub = "";
  @state() private ready = false;
  @state() private confirmCfg?: {
    heading: string;
    body: string;
    onOk: () => void;
  };

  private appState!: AppState;
  @query("spz-toast") private toastEl?: SpzToast;

  static styles = [tokens, shared, css`
    :host {
      display: block;
      height: 100%;
      background: var(--spz-bg);
      color: var(--spz-text);
    }
    .shell { display: flex; flex-direction: column; height: 100%; }
    /* Mobile header */
    .m-header {
      flex: none; display: flex; align-items: center; gap: 12px;
      padding: 16px 16px 12px; border-bottom: 1px solid var(--spz-divider);
      background: var(--spz-bg);
    }
    .m-header .back {
      border: none; background: transparent; color: var(--spz-text);
      font-size: 26px; line-height: 1; cursor: pointer; padding: 0 4px 0 0;
    }
    .m-header .title { flex: 1; font-size: 22px; font-weight: 500; }
    .m-header .sub { font-size: 13px; color: var(--spz-text-2); }
    .m-header .menu { border: none; background: transparent; color: var(--spz-text-2);
      font-size: 22px; cursor: pointer; width: 40px; height: 40px; }
    /* Desktop top bar */
    .d-bar {
      flex: none; display: flex; align-items: center; gap: 22px;
      padding: 0 24px; height: 64px; background: var(--spz-primary); color: #fff;
    }
    .d-bar .brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 500; }
    .d-tabs { display: flex; gap: 4px; height: 100%; align-items: stretch; }
    .d-tabs button {
      border: none; background: transparent; color: #fff; cursor: pointer;
      padding: 0 16px; font-size: 14px; font-family: inherit; opacity: .85;
      border-bottom: 3px solid transparent;
    }
    .d-tabs button.active { opacity: 1; border-bottom-color: #fff; font-weight: 500; }
    .d-actions { margin-left: auto; display: flex; align-items: center; gap: 12px; }
    .d-search {
      display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.18);
      border-radius: 8px; padding: 8px 14px; width: 240px; color: rgba(255,255,255,0.85);
      font-size: 14px; cursor: pointer; border: none; font-family: inherit;
    }
    .d-add {
      border: none; cursor: pointer; background: #fff; color: var(--spz-primary);
      font-weight: 600; font-size: 14px; padding: 9px 16px; border-radius: 8px; font-family: inherit;
    }
    /* Content */
    .content { flex: 1; overflow-y: auto; }
    .inner { padding: 16px; }
    .inner.desktop { max-width: 1200px; margin: 0 auto; padding: 24px; }
    /* Bottom nav + FAB */
    .m-nav {
      flex: none; position: relative; height: 64px; border-top: 1px solid var(--spz-divider);
      background: var(--spz-card); display: flex; align-items: stretch;
    }
    .m-nav button {
      flex: 1; border: none; background: transparent; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
      color: var(--spz-text-2); font-family: inherit;
    }
    .m-nav button.active { color: var(--spz-primary); }
    .m-nav .ico { font-size: 20px; line-height: 1; }
    .m-nav .lbl { font-size: 10px; }
    .fab {
      position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%);
      width: 58px; height: 58px; border-radius: 50%; border: 4px solid var(--spz-bg);
      background: var(--spz-primary); color: #fff; font-size: 30px; line-height: 1;
      cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.35); z-index: 5;
    }
    .add-menu { display: flex; flex-direction: column; gap: 10px; }
    .add-menu .title { font-size: 18px; font-weight: 500; margin-bottom: 4px; }
    .add-menu button {
      display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 12px;
      border: 1px solid var(--spz-divider); background: var(--spz-card); color: var(--spz-text);
      font-size: 15px; cursor: pointer; font-family: inherit; text-align: left; min-height: 48px;
    }
    .add-menu button.primary { background: var(--spz-primary); color: #fff; border: none; }
    .add-menu .ico { font-size: 22px; }
    .looking { text-align: center; padding: 20px; color: var(--spz-text-2); }
  `];

  connectedCallback() {
    super.connectedCallback();
    this._onLocation = () => this.syncRoute();
    this._onToast = (e: Event) => {
      const d = (e as CustomEvent).detail;
      this.toastEl?.show(d.message, d.undo);
    };
    this._onConsumeScan = () => this.startScan("consume");
    this._onNewRoom = () => this.newRoom();
    this._onStatusFilter = (e: Event) =>
      this.openStatusList((e as CustomEvent).detail.status);
    window.addEventListener("location-changed", this._onLocation);
    window.addEventListener("popstate", this._onLocation);
    window.addEventListener("spz-toast", this._onToast);
    window.addEventListener("spz-consume-scan", this._onConsumeScan);
    window.addEventListener("spz-new-room", this._onNewRoom);
    window.addEventListener("spz-status-filter", this._onStatusFilter);
    this.addEventListener("new-product", (e) => this.onNewProduct(e as CustomEvent));
    this.addEventListener("add-for-product", (e) =>
      this.openAddForm((e as CustomEvent).detail.product)
    );
    this.addEventListener("scan-here", (e) => {
      this.pendingShelfId = (e as CustomEvent).detail.shelfId;
      this.startScan("add");
    });
    this.addEventListener("add-here", (e) => {
      this.pendingShelfId = (e as CustomEvent).detail.shelfId;
      this.overlay = "picker";
    });
    this.addEventListener("move-item", (e) => {
      this.moveItem = (e as CustomEvent).detail.item;
      void this.appState.api.listShelves().then((r) => {
        this.moveShelves = r.shelves;
        this.overlay = "move";
      });
    });
    this.addEventListener("scan-barcode-for-product", (e) => {
      this.pendingProduct = (e as CustomEvent).detail.product ?? this.pendingProduct;
      this.startScan("barcode-for-product");
    });
    this.syncRoute();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("location-changed", this._onLocation);
    window.removeEventListener("popstate", this._onLocation);
    window.removeEventListener("spz-toast", this._onToast);
    window.removeEventListener("spz-consume-scan", this._onConsumeScan);
    window.removeEventListener("spz-new-room", this._onNewRoom);
    window.removeEventListener("spz-status-filter", this._onStatusFilter);
    this.appState?.disconnect();
  }

  private _onLocation!: () => void;
  private _onToast!: (e: Event) => void;
  private _onConsumeScan!: () => void;
  private _onNewRoom!: () => void;
  private _onStatusFilter!: (e: Event) => void;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has("hass") && this.hass && !this.appState) {
      setLanguage(this.hass.language);
      this.appState = new AppState(this.hass);
      void this.appState.connect().then(() => {
        this.ready = true;
        this.requestUpdate();
        void this.updateHeader();
      });
      this.appState.subscribe(() => this.requestUpdate());
    } else if (changed.has("hass") && this.appState) {
      this.appState.setHass(this.hass);
    }
  }

  private syncRoute() {
    this.current = parsePath(window.location.pathname);
    void this.updateHeader();
    this.requestUpdate();
  }

  private async updateHeader() {
    const r = this.current;
    this.headerSub = "";
    switch (r.view) {
      case "dashboard":
        this.headerTitle = t("app.title");
        break;
      case "room": {
        const room = this.appState?.rooms?.find((x) => x.id === r.id);
        this.headerTitle = room?.name ?? t("nav.rooms");
        break;
      }
      case "shelf": {
        if (this.appState) {
          const shelves = (await this.appState.api.listShelves()).shelves;
          const shelf = shelves.find((s) => s.id === r.id);
          const room = this.appState.rooms?.find((x) => x.id === shelf?.room_id);
          this.headerTitle = shelf?.name ?? t("nav.rooms");
          this.headerSub = room?.name ?? "";
        }
        break;
      }
      case "catalog":
        this.headerTitle = t("nav.catalog");
        break;
      case "product":
        this.headerTitle = t("nav.catalog");
        break;
      case "history":
        this.headerTitle = t("nav.history");
        break;
      case "search":
        this.headerTitle = t("nav.search");
        break;
      case "settings":
        this.headerTitle = t("nav.settings");
        break;
    }
    this.requestUpdate();
  }

  // ---- overlays / flows ----
  private openAddMenu() {
    this.overlay = "add-menu";
  }
  private closeOverlay() {
    this.overlay = "none";
    this.pendingProduct = undefined;
    this.moveItem = undefined;
  }

  private startScan(mode: ScanMode) {
    this.scanMode = mode;
    this.scanSession = 0;
    this.overlay = "scanner";
  }

  private async onScanCode(e: CustomEvent) {
    const code = e.detail.code as string;
    if (this.scanMode === "barcode-for-product" && this.pendingProduct) {
      const existing = [...this.pendingProduct.barcodes, code];
      await this.appState.api.updateProduct(this.pendingProduct.id, { barcodes: existing });
      this.toastEl?.show(t("toast.moved", { product: this.pendingProduct.name }));
      this.closeOverlay();
      return;
    }
    this.scanLooking = true;
    try {
      const res = await this.appState.api.barcodeLookup(code);
      if (res.match === "local") {
        this.pendingProduct = res.product;
        this.afterProductChosen();
      } else if (res.match === "off") {
        const created = await this.appState.api.createProduct({
          name: res.suggestion.name,
          category: res.suggestion.suggested_category,
          barcodes: [res.suggestion.code],
        });
        this.pendingProduct = created.product;
        this.afterProductChosen();
      } else {
        this.presetBarcode = code;
        this.presetName = "";
        this.overlay = "new-product";
      }
    } finally {
      this.scanLooking = false;
    }
  }

  private afterProductChosen() {
    if (this.scanMode === "consume") {
      this.overlay = "dispense";
    } else {
      this.overlay = "add-form";
    }
  }

  private openAddForm(product?: ProductDefinition) {
    this.pendingProduct = product;
    this.overlay = product ? "add-form" : "picker";
  }

  private onAdded(e: CustomEvent) {
    const { next, location } = e.detail;
    const product = this.pendingProduct;
    const qty = e.detail.item?.quantity ?? "";
    this.toastEl?.show(
      t("toast.added", { product: product?.name ?? "", qty, location }),
      undefined
    );
    if (next) {
      this.startScan("add");
    } else {
      this.closeOverlay();
    }
  }

  private onDispensed(e: CustomEvent) {
    this.toastEl?.show(t("toast.consumed", e.detail));
    if (this.scanSerial && this.scanMode === "consume") {
      this.startScan("consume");
    } else {
      this.closeOverlay();
    }
  }

  private onProductPicked(e: CustomEvent) {
    this.pendingProduct = e.detail.product;
    this.overlay = this.scanMode === "consume" ? "dispense" : "add-form";
  }

  private onNewProduct(e: CustomEvent) {
    this.presetName = e.detail?.name ?? "";
    this.presetBarcode = "";
    this.overlay = "new-product";
  }

  private onProductSaved(e: CustomEvent) {
    this.pendingProduct = e.detail.product;
    this.overlay = "add-form";
  }

  private async newRoom() {
    const name = prompt(t("dashboard.new_room"));
    if (name?.trim()) {
      const { room } = await this.appState.api.createRoom(name.trim());
      await this.appState.api.createShelf(room.id, "Półka 1");
    }
  }

  private async onMovePicked(e: CustomEvent) {
    if (!this.moveItem) return;
    const shelfId = e.detail.shelfId;
    const name = this.moveItem.product?.name ?? "";
    await this.appState.api.moveItem(this.moveItem.id, shelfId);
    this.toastEl?.show(t("toast.moved", { product: name }));
    this.closeOverlay();
  }

  private async openStatusList(status: string) {
    this.statusFilter = status;
    if (status === "low_stock") {
      // Low stock is product-level; jump to the catalog for the shopping view.
      this.statusItems = [];
    } else {
      const res = await this.appState.api.listItems({ status });
      this.statusItems = res.items;
    }
    this.overlay = "status";
  }

  private async trashStatusItem(item: ItemWithMeta) {
    await this.appState.api.deleteItem(item.id, "expired");
    this.statusItems = this.statusItems.filter((i) => i.id !== item.id);
    this.toastEl?.show(t("toast.deleted", { product: item.product?.name ?? "" }));
  }

  // ---- render ----
  render() {
    if (!this.ready) {
      return html`<div class="looking">${t("common.loading")}</div>`;
    }
    if (this.appState.error) {
      return html`<div class="looking">${t("common.error")}</div>`;
    }
    if (this.overlay === "scanner") {
      return html`
        <spz-scanner
          .sessionCount=${this.scanSession}
          .serial=${this.scanSerial}
          @code=${(e: CustomEvent) => this.onScanCode(e)}
          @serial-changed=${(e: CustomEvent) => (this.scanSerial = e.detail.serial)}
          @scanner-close=${() => this.closeOverlay()}
        ></spz-scanner>
        ${this.scanLooking ? html`<div class="looking">${t("scan.lookup")}</div>` : nothing}
        <spz-toast></spz-toast>
      `;
    }

    return html`
      <div class="shell">
        ${this.narrow ? this.renderMobileHeader() : this.renderDesktopBar()}
        <div class="content">
          <div class="inner ${this.narrow ? "" : "desktop"}">${this.renderView()}</div>
        </div>
        ${this.narrow ? this.renderNav() : nothing}
      </div>
      ${this.renderOverlays()}
      <spz-confirm-dialog
        .open=${!!this.confirmCfg}
        .heading=${this.confirmCfg?.heading ?? ""}
        .body=${this.confirmCfg?.body ?? ""}
        @confirm-cancel=${() => (this.confirmCfg = undefined)}
        @confirm-ok=${() => { this.confirmCfg?.onOk(); this.confirmCfg = undefined; }}
      ></spz-confirm-dialog>
      <spz-toast></spz-toast>
    `;
  }

  private renderMobileHeader() {
    const showBack = this.current.view !== "dashboard";
    return html`<div class="m-header">
      ${showBack
        ? html`<button class="back" aria-label=${t("common.back")} @click=${() => navigateBack()}>‹</button>`
        : nothing}
      <div class="title">
        ${this.headerSub ? html`<div class="sub">${this.headerSub}</div>` : nothing}
        ${this.headerTitle}
      </div>
    </div>`;
  }

  private renderDesktopBar() {
    const tabs: { view: ViewName; label: string }[] = [
      { view: "dashboard", label: t("nav.dashboard") },
      { view: "catalog", label: t("nav.catalog") },
      { view: "history", label: t("nav.history") },
      { view: "settings", label: t("nav.settings") },
    ];
    return html`<div class="d-bar">
      <div class="brand"><span>🫙</span> ${t("app.title")}</div>
      <div class="d-tabs">
        ${tabs.map(
          (tab) => html`<button
            class=${this.current.view === tab.view ? "active" : ""}
            @click=${() => navigate(tab.view)}
          >${tab.label}</button>`
        )}
      </div>
      <div class="d-actions">
        <button class="d-search" @click=${() => navigate("search")}>🔍 ${t("search.placeholder")}</button>
        <button class="d-add" @click=${() => this.openAddMenu()}>⊕ ${t("common.add")}</button>
      </div>
    </div>`;
  }

  private renderNav() {
    const items: { view: ViewName; icon: string; label: string }[] = [
      { view: "dashboard", icon: "🏠", label: t("nav.dashboard") },
      { view: "catalog", icon: "📖", label: t("nav.rooms") },
    ];
    const more: { view: ViewName; icon: string; label: string }[] = [
      { view: "search", icon: "🔍", label: t("nav.search") },
      { view: "history", icon: "🕓", label: t("nav.more") },
    ];
    return html`<div class="m-nav">
      ${items.map(
        (n) => html`<button class=${this.current.view === n.view ? "active" : ""} @click=${() => navigate(n.view)}>
          <span class="ico">${n.icon}</span><span class="lbl">${n.label}</span>
        </button>`
      )}
      <button style="visibility:hidden"></button>
      ${more.map(
        (n) => html`<button class=${this.current.view === n.view ? "active" : ""} @click=${() => navigate(n.view)}>
          <span class="ico">${n.icon}</span><span class="lbl">${n.label}</span>
        </button>`
      )}
      <button class="fab" aria-label=${t("common.add")} @click=${() => this.openAddMenu()}>＋</button>
    </div>`;
  }

  private renderView() {
    const r = this.current;
    const s = this.appState;
    switch (r.view) {
      case "room":
        return html`<spz-view-room .appState=${s} .narrow=${this.narrow} .roomId=${r.id ?? ""}></spz-view-room>`;
      case "shelf":
        return html`<spz-view-shelf .appState=${s} .narrow=${this.narrow} .shelfId=${r.id ?? ""}></spz-view-shelf>`;
      case "catalog":
        return html`<spz-view-catalog .appState=${s} .narrow=${this.narrow}></spz-view-catalog>`;
      case "product":
        return html`<spz-view-product .appState=${s} .narrow=${this.narrow} .productId=${r.id ?? ""}></spz-view-product>`;
      case "history":
        return html`<spz-view-history .appState=${s} .narrow=${this.narrow}></spz-view-history>`;
      case "search":
        return html`<spz-view-search .appState=${s} .narrow=${this.narrow}></spz-view-search>`;
      case "settings":
        return html`<spz-view-settings .appState=${s} .narrow=${this.narrow} .version=${APP_VERSION}></spz-view-settings>`;
      default:
        return html`<spz-view-dashboard .appState=${s} .narrow=${this.narrow}></spz-view-dashboard>`;
    }
  }

  private renderStatusList() {
    const title =
      this.statusFilter === "expired"
        ? t("status.expired")
        : this.statusFilter === "expiring_soon"
        ? t("status.expiring_soon")
        : t("dashboard.low_stock");
    if (this.statusFilter === "low_stock") {
      return html`<div style="padding:8px 0">
        <div style="font-size:18px;font-weight:500;margin-bottom:12px">${title}</div>
        <button class="btn btn-primary btn-block" @click=${() => { this.closeOverlay(); navigate("catalog"); }}>
          ${t("nav.catalog")}
        </button>
      </div>`;
    }
    return html`<div style="padding:8px 0">
      <div style="font-size:18px;font-weight:500;margin-bottom:12px">${title}</div>
      ${this.statusItems.length === 0
        ? html`<div style="color:var(--spz-text-2);padding:12px 0">${t("dashboard.all_fresh")}</div>`
        : this.statusItems.map(
            (i) => html`<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--spz-divider)">
              <span style="font-size:26px" aria-hidden="true">${productGlyph(i.product?.emoji ?? "", i.product?.category ?? "other")}</span>
              <button style="flex:1;min-width:0;text-align:left;background:none;border:none;cursor:pointer;color:var(--spz-text)"
                @click=${() => { this.closeOverlay(); navigate("shelf", i.shelf_id); }}>
                <div style="font-size:15px;font-weight:500">${i.product?.name ?? ""}</div>
                <div style="font-size:12px;color:var(--spz-text-2)">${i.quantity} ${t("unit." + i.unit)} · ${i.shelf_path ?? ""}</div>
              </button>
              <spz-freshness-badge .status=${i.status} .date=${i.best_before} .precision=${i.best_before_precision} .daysLeft=${i.days_left}></spz-freshness-badge>
              <button class="btn" style="min-height:40px;padding:8px 12px;color:var(--spz-error);border-color:var(--spz-error)"
                @click=${() => this.trashStatusItem(i)}>🗑️</button>
            </div>`
          )}
    </div>`;
  }

  private renderOverlays() {
    const n = this.narrow;
    return html`
      <spz-bottom-sheet .open=${this.overlay === "add-menu"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        <div class="add-menu">
          <div class="title">${t("add_menu.title")}</div>
          <button class="primary" @click=${() => this.startScan("add")}><span class="ico">📷</span>${t("add_menu.scan")}</button>
          <button @click=${() => { this.scanMode = "add"; this.overlay = "picker"; }}><span class="ico">📖</span>${t("add_menu.catalog")}</button>
          <button @click=${() => this.onNewProduct(new CustomEvent("x"))}><span class="ico">✨</span>${t("add_menu.new")}</button>
          <button @click=${() => this.startScan("consume")}><span class="ico">➖</span>${t("add_menu.consume_scan")}</button>
        </div>
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "add-form"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "add-form"
          ? html`<spz-add-form .appState=${this.appState} .product=${this.pendingProduct}
              .shelfId=${this.pendingShelfId} .narrow=${n}
              @added=${(e: CustomEvent) => this.onAdded(e)}
              @change-product=${() => (this.overlay = "picker")}></spz-add-form>`
          : nothing}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "dispense"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "dispense"
          ? html`<spz-dispense-form .appState=${this.appState} .product=${this.pendingProduct}
              @dispensed=${(e: CustomEvent) => this.onDispensed(e)}></spz-dispense-form>`
          : nothing}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "picker"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "picker"
          ? html`<spz-product-picker .appState=${this.appState}
              @product-picked=${(e: CustomEvent) => this.onProductPicked(e)}></spz-product-picker>`
          : nothing}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "new-product"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "new-product"
          ? html`<spz-product-form .appState=${this.appState} .presetName=${this.presetName}
              .presetBarcode=${this.presetBarcode}
              @saved=${(e: CustomEvent) => this.onProductSaved(e)}></spz-product-form>`
          : nothing}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "status"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "status" ? this.renderStatusList() : nothing}
      </spz-bottom-sheet>

      <spz-bottom-sheet .open=${this.overlay === "move"} .narrow=${n} @sheet-close=${() => this.closeOverlay()}>
        ${this.overlay === "move"
          ? html`<spz-location-picker .rooms=${this.appState.rooms ?? []}
              .shelves=${this.moveShelves} @shelf-picked=${(e: CustomEvent) => this.onMovePicked(e)}></spz-location-picker>`
          : nothing}
      </spz-bottom-sheet>
    `;
  }
}
