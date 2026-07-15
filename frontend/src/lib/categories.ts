// Category metadata: keys, emoji fallback, and light/dark tint pairs.
// Tints are applied at ~10-12% opacity behind product tiles (DESIGN §3).

export const CATEGORIES = [
  "preserves_sweet",
  "preserves_savory",
  "compotes_juices",
  "honey_syrups",
  "canned",
  "dry_goods",
  "spices",
  "oils_fats",
  "drinks",
  "sweets_snacks",
  "frozen",
  "household",
  "other",
] as const;

export type CategoryKey = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  preserves_sweet: "🍓",
  preserves_savory: "🥒",
  compotes_juices: "🍑",
  honey_syrups: "🍯",
  canned: "🥫",
  dry_goods: "🌾",
  spices: "🧂",
  oils_fats: "🫒",
  drinks: "🧃",
  sweets_snacks: "🍫",
  frozen: "❄️",
  household: "🧻",
  other: "📦",
};

// Base tint hue per category (a single hex; opacity applied via color-mix).
const CATEGORY_HUE: Record<string, string> = {
  preserves_sweet: "#e91e63", // róż
  preserves_savory: "#4caf50", // zieleń
  compotes_juices: "#ff8a65", // brzoskwinia
  honey_syrups: "#ffb300", // bursztyn
  canned: "#78909c", // stal
  dry_goods: "#c9a227", // piasek
  spices: "#bf5b3b", // terakota
  oils_fats: "#8bc34a", // oliwka
  drinks: "#29b6f6", // błękit
  sweets_snacks: "#9c27b0", // fiolet
  frozen: "#4dd0e1", // lód
  household: "#9e9e9e", // szarość
  other: "#90a4ae", // neutralny
};

// A CSS background using the category hue mixed into the card background.
export function categoryTint(category: string, pct = 10): string {
  const hue = CATEGORY_HUE[category] ?? CATEGORY_HUE.other;
  return `color-mix(in srgb, var(--card-background-color, #1c1c1c) ${
    100 - pct
  }%, ${hue} ${pct}%)`;
}

export function categoryColor(category: string): string {
  return CATEGORY_HUE[category] ?? CATEGORY_HUE.other;
}

// Visual representation: image > product emoji > category emoji (DESIGN §8).
export function productGlyph(
  emoji: string | undefined,
  category: string
): string {
  return emoji || CATEGORY_EMOJI[category] || CATEGORY_EMOJI.other;
}
