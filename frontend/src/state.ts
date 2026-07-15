// Lightweight frontend store: cached collections invalidated by WS events.

import { SpizarniaApi } from "./api";
import type {
  Collection,
  HomeAssistant,
  Overview,
  Room,
  Settings,
} from "./types";

type Listener = () => void;

export class AppState {
  api: SpizarniaApi;
  private listeners = new Set<Listener>();
  private unsubWs?: () => void;

  overview?: Overview;
  rooms?: Room[];
  settings?: Settings;
  loading = true;
  error?: string;

  constructor(hass: HomeAssistant) {
    this.api = new SpizarniaApi(hass);
  }

  setHass(hass: HomeAssistant) {
    this.api.setHass(hass);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const l of this.listeners) l();
  }

  async connect() {
    try {
      this.unsubWs = await this.api.subscribe((collection) =>
        this.onServerChange(collection)
      );
      await this.refreshOverview();
      this.settings = (await this.api.getSettings()).settings;
      this.loading = false;
      this.emit();
    } catch (err) {
      this.loading = false;
      this.error = String(err);
      this.emit();
    }
  }

  disconnect() {
    this.unsubWs?.();
  }

  private onServerChange(collection: Collection) {
    // Overview aggregates items/shelves/rooms/history; refetch broadly.
    if (
      collection === "items" ||
      collection === "shelves" ||
      collection === "rooms" ||
      collection === "history"
    ) {
      void this.refreshOverview();
    }
    if (collection === "settings") {
      void this.refreshSettings();
    }
    // Bump a signal so views re-fetch their own data.
    this.changeSignal++;
    this.emit();
  }

  // A monotonically increasing counter views can watch to know when to refetch.
  changeSignal = 0;

  async refreshOverview() {
    this.overview = await this.api.overview();
    this.rooms = this.overview.rooms;
    this.emit();
  }

  async refreshSettings() {
    this.settings = (await this.api.getSettings()).settings;
    this.emit();
  }
}
