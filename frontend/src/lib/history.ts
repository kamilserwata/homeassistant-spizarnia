// History row rendering helpers (icon + localized text) — DESIGN §6.7.

import type { HistoryEntry } from "../types";
import { t } from "../i18n";

export function historyIcon(type: string): string {
  switch (type) {
    case "add":
      return "➕";
    case "consume":
      return "➖";
    case "move":
      return "↔️";
    case "adjust":
      return "✏️";
    case "open":
      return "🥄";
    case "delete":
      return "🗑️";
    case "expire_notice":
      return "⚠️";
    default:
      return "•";
  }
}

export function historyText(h: HistoryEntry): string {
  const qty =
    h.quantity_delta != null
      ? `${Math.abs(h.quantity_delta)}${h.unit ? " " + h.unit : ""}`
      : "";
  const product = h.product_name || "";
  switch (h.type) {
    case "add":
      return t("history.add", { qty, product });
    case "consume":
      return t("history.consume", { qty, product });
    case "adjust":
      return t("history.adjust", { product });
    case "move":
      return t("history.move", { product });
    case "open":
      return t("history.open", { product });
    case "delete":
      return t("history.delete", { product });
    default:
      return product;
  }
}
