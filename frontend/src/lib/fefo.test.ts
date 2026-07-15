import { describe, expect, it } from "vitest";
import { fefoSort, hasOlderBatch } from "./fefo";
import type { Item } from "../types";

const mk = (over: Partial<Item>): Item => ({
  id: "x",
  product_id: "p",
  shelf_id: "s",
  quantity: 1,
  unit: "szt",
  best_before: null,
  best_before_precision: "day",
  production_date: null,
  opened: false,
  notes: "",
  added_at: "2026-01-01T00:00:00+00:00",
  added_by: null,
  ...over,
});

describe("fefoSort", () => {
  it("orders opened first, then earliest date, then oldest added", () => {
    const items = [
      mk({ id: "fresh", best_before: "2027-01-01" }),
      mk({ id: "old", best_before: "2026-06-01" }),
      mk({ id: "opened", best_before: "2026-12-01", opened: true }),
      mk({ id: "nodate", best_before: null }),
    ];
    const order = fefoSort(items).map((i) => i.id);
    expect(order).toEqual(["opened", "old", "fresh", "nodate"]);
  });
});

describe("hasOlderBatch", () => {
  it("flags an older batch when a fresher one is chosen", () => {
    const items = [
      mk({ id: "old", best_before: "2026-06-01" }),
      mk({ id: "fresh", best_before: "2027-01-01" }),
    ];
    expect(hasOlderBatch(items, "fresh")?.id).toBe("old");
    expect(hasOlderBatch(items, "old")).toBeUndefined();
  });
});
