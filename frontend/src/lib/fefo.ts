// FEFO ordering mirror of the backend (SPEC §6) for optimistic client hints.

import type { Item } from "../types";

// opened DESC, best_before ASC (nulls last), added_at ASC.
export function fefoSort<T extends Item>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.opened !== b.opened) return a.opened ? -1 : 1;
    const ab = a.best_before ?? "9999-99-99";
    const bb = b.best_before ?? "9999-99-99";
    if (ab !== bb) return ab < bb ? -1 : 1;
    return a.added_at < b.added_at ? -1 : 1;
  });
}

// The batch FEFO would consume first.
export function fefoFirst<T extends Item>(items: T[]): T | undefined {
  return fefoSort(items)[0];
}

// Whether choosing `chosen` leaves an older batch behind (anti-waste warning).
export function hasOlderBatch<T extends Item>(items: T[], chosenId: string): T | undefined {
  const ordered = fefoSort(items);
  const idx = ordered.findIndex((i) => i.id === chosenId);
  if (idx <= 0) return undefined;
  return ordered[0];
}
