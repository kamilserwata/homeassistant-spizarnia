// Shared types mirroring the backend WebSocket payloads (SPEC §5, §7).

export type FreshnessStatus = "expired" | "expiring_soon" | "ok" | "no_date";
export type Precision = "day" | "month" | "year" | "none";

export interface Room {
  id: string;
  name: string;
  icon: string;
  order: number;
  created_at: string;
}

export interface RoomOverview extends Room {
  shelf_count: number;
  item_count: number;
  expired: number;
  expiring: number;
}

export interface Shelf {
  id: string;
  room_id: string;
  name: string;
  order: number;
  notes: string;
}

export interface ShelfWithCounts extends Shelf {
  item_count: number;
  expired: number;
  expiring: number;
  preview: { emoji: string; image: string | null }[];
}

export interface ProductDefinition {
  id: string;
  name: string;
  category: string;
  emoji: string;
  image: string | null;
  default_unit: string;
  barcodes: string[];
  default_shelf_life_days: number | null;
  min_stock: number | null;
  notes: string;
  source: string;
  created_at: string;
}

export interface ProductWithStock extends ProductDefinition {
  total_quantity: number;
  item_count: number;
}

export interface Item {
  id: string;
  product_id: string;
  shelf_id: string;
  quantity: number;
  unit: string;
  best_before: string | null;
  best_before_precision: Precision;
  production_date: string | null;
  opened: boolean;
  notes: string;
  added_at: string;
  added_by: string | null;
}

export interface ItemWithMeta extends Item {
  product: ProductDefinition | null;
  status: FreshnessStatus;
  days_left: number | null;
  shelf_path: string | null;
}

export interface HistoryEntry {
  id: string;
  ts: string;
  type: string;
  product_id: string;
  product_name: string;
  item_id: string | null;
  quantity_delta: number | null;
  unit: string | null;
  shelf_id: string | null;
  shelf_path: string | null;
  user_id: string | null;
  user_name: string | null;
  details: Record<string, unknown>;
}

export interface Stats {
  expired: number;
  expiring_soon: number;
  low_stock: number;
  low_stock_product_ids: string[];
  total_items: number;
  total_quantity: number;
  by_room: Record<string, number>;
  by_category: Record<string, number>;
}

export interface Overview {
  rooms: RoomOverview[];
  stats: Stats;
  recent_history: HistoryEntry[];
}

export interface Settings {
  expiring_soon_days: number;
  off_enabled: boolean;
  off_locale: string;
  history_retention_days: number;
}

export type BarcodeResult =
  | { match: "local"; product: ProductDefinition }
  | {
      match: "off";
      suggestion: {
        name: string;
        brand: string;
        quantity_text: string;
        image_url?: string;
        categories: string[];
        suggested_category: string;
        code: string;
      };
    }
  | { match: "none"; code: string; off_error?: boolean };

export type Collection =
  | "items"
  | "products"
  | "shelves"
  | "rooms"
  | "history"
  | "settings";

// Minimal shape of the HA `hass` object passed to the panel.
export interface HomeAssistant {
  language: string;
  locale?: { language: string };
  user?: { id: string; name: string; is_admin: boolean };
  themes?: unknown;
  connection: {
    subscribeMessage<T>(
      callback: (msg: T) => void,
      options: { type: string }
    ): Promise<() => void>;
  };
  callWS<T = unknown>(msg: Record<string, unknown>): Promise<T>;
}
