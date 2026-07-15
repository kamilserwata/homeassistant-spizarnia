// Typed WebSocket client for the Spiżarnia backend (SPEC §7).

import type {
  BarcodeResult,
  Collection,
  HistoryEntry,
  HomeAssistant,
  Item,
  ItemWithMeta,
  Overview,
  Precision,
  ProductDefinition,
  ProductWithStock,
  Room,
  Settings,
  Shelf,
  ShelfWithCounts,
} from "./types";

export class SpizarniaApi {
  constructor(private hass: HomeAssistant) {}

  setHass(hass: HomeAssistant) {
    this.hass = hass;
  }

  private ws<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
    return this.hass.callWS<T>({ type, ...payload });
  }

  subscribe(cb: (collection: Collection) => void): Promise<() => void> {
    return this.hass.connection.subscribeMessage<{
      collection: Collection;
      action: string;
    }>((msg) => cb(msg.collection), { type: "spizarnia/subscribe" });
  }

  // Reads
  overview() {
    return this.ws<Overview>("spizarnia/overview");
  }
  listRooms() {
    return this.ws<{ rooms: Room[] }>("spizarnia/rooms/list");
  }
  listShelves(room_id?: string) {
    return this.ws<{ shelves: ShelfWithCounts[] }>("spizarnia/shelves/list", {
      room_id,
    });
  }
  listProducts(opts: {
    query?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    return this.ws<{ products: ProductWithStock[]; total: number }>(
      "spizarnia/products/list",
      opts
    );
  }
  listItems(opts: {
    shelf_id?: string;
    room_id?: string;
    product_id?: string;
    status?: string;
  } = {}) {
    return this.ws<{ items: ItemWithMeta[] }>("spizarnia/items/list", opts);
  }
  listHistory(opts: {
    limit?: number;
    offset?: number;
    type?: string;
    product_id?: string;
    room_id?: string;
  } = {}) {
    return this.ws<{ entries: HistoryEntry[]; total: number }>(
      "spizarnia/history/list",
      opts
    );
  }
  search(query: string) {
    return this.ws<{ products: ProductWithStock[]; items: ItemWithMeta[] }>(
      "spizarnia/search",
      { query }
    );
  }
  getSettings() {
    return this.ws<{ settings: Settings }>("spizarnia/settings/get");
  }

  // Rooms
  createRoom(name: string, icon?: string) {
    return this.ws<{ room: Room }>("spizarnia/rooms/create", { name, icon });
  }
  updateRoom(room_id: string, fields: { name?: string; icon?: string }) {
    return this.ws<{ room: Room }>("spizarnia/rooms/update", {
      room_id,
      ...fields,
    });
  }
  deleteRoom(room_id: string, dry_run = false) {
    return this.ws<{ affected_shelves: number; affected_items: number }>(
      "spizarnia/rooms/delete",
      { room_id, dry_run }
    );
  }
  reorderRooms(room_ids: string[]) {
    return this.ws("spizarnia/rooms/reorder", { room_ids });
  }

  // Shelves
  createShelf(room_id: string, name: string, notes?: string) {
    return this.ws<{ shelf: Shelf }>("spizarnia/shelves/create", {
      room_id,
      name,
      notes,
    });
  }
  updateShelf(
    shelf_id: string,
    fields: { name?: string; notes?: string; room_id?: string }
  ) {
    return this.ws<{ shelf: Shelf }>("spizarnia/shelves/update", {
      shelf_id,
      ...fields,
    });
  }
  deleteShelf(shelf_id: string, dry_run = false) {
    return this.ws<{ affected_items: number }>("spizarnia/shelves/delete", {
      shelf_id,
      dry_run,
    });
  }
  reorderShelves(shelf_ids: string[]) {
    return this.ws("spizarnia/shelves/reorder", { shelf_ids });
  }

  // Products
  createProduct(fields: Partial<ProductDefinition> & { name: string; category: string }) {
    return this.ws<{ product: ProductDefinition }>(
      "spizarnia/products/create",
      fields
    );
  }
  updateProduct(product_id: string, fields: Partial<ProductDefinition>) {
    return this.ws<{ product: ProductDefinition }>(
      "spizarnia/products/update",
      { product_id, ...fields }
    );
  }
  deleteProduct(product_id: string) {
    return this.ws("spizarnia/products/delete", { product_id });
  }

  // Items
  addItem(fields: {
    product_id: string;
    shelf_id: string;
    quantity: number;
    unit?: string;
    best_before?: string | null;
    best_before_precision?: Precision;
    production_date?: string | null;
    opened?: boolean;
    notes?: string;
  }) {
    return this.ws<{ item: ItemWithMeta }>("spizarnia/items/add", fields);
  }
  updateItem(item_id: string, fields: Partial<Item>) {
    return this.ws<{ item: ItemWithMeta | null }>("spizarnia/items/update", {
      item_id,
      ...fields,
    });
  }
  consume(item_id: string, quantity: number) {
    return this.ws<{ item: ItemWithMeta | null }>("spizarnia/items/consume", {
      item_id,
      quantity,
    });
  }
  consumeFefo(product_id: string, quantity: number) {
    return this.ws<{ operations: { item_id: string; taken: number; remaining: number }[] }>(
      "spizarnia/items/consume_fefo",
      { product_id, quantity }
    );
  }
  moveItem(item_id: string, shelf_id: string) {
    return this.ws<{ item: ItemWithMeta }>("spizarnia/items/move", {
      item_id,
      shelf_id,
    });
  }
  setOpened(item_id: string, opened: boolean) {
    return this.ws<{ item: ItemWithMeta }>("spizarnia/items/set_opened", {
      item_id,
      opened,
    });
  }
  deleteItem(item_id: string, reason?: string) {
    return this.ws("spizarnia/items/delete", { item_id, reason });
  }

  // Settings / export / barcode
  updateSettings(fields: Partial<Settings>) {
    return this.ws("spizarnia/settings/update", fields);
  }
  exportData() {
    return this.ws<{ format: string; data: unknown }>("spizarnia/export");
  }
  barcodeLookup(code: string) {
    return this.ws<BarcodeResult>("spizarnia/barcode/lookup", { code });
  }
}
