// Lightweight i18n: flat dotted keys, {var} interpolation, PL plural helper.

import pl from "./pl.json";
import en from "./en.json";

type Dict = Record<string, string>;
const DICTS: Record<string, Dict> = { pl: pl as Dict, en: en as Dict };

let current: Dict = en as Dict;
let lang = "en";

export function setLanguage(hassLanguage: string | undefined): void {
  lang = hassLanguage === "pl" ? "pl" : "en";
  current = DICTS[lang];
}

export function getLanguage(): string {
  return lang;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let str = current[key] ?? (en as Dict)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

// Polish plural: [one, few, many] → 1 partia / 2 partie / 5 partii.
export function plural(
  n: number,
  forms: [string, string, string]
): string {
  if (lang !== "pl") {
    // English-ish fallback: singular vs plural (few == plural here).
    return n === 1 ? forms[0] : forms[1];
  }
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs === 1 && n === 1) return forms[0];
  if (n1 >= 2 && n1 <= 4 && (abs < 10 || abs >= 20)) return forms[1];
  return forms[2];
}

// Batches count with correct plural form.
export function batches(n: number): string {
  if (lang === "pl") {
    return `${n} ${plural(n, ["partia", "partie", "partii"])}`;
  }
  return `${n} ${n === 1 ? "batch" : "batches"}`;
}

export function pieces(n: number): string {
  if (lang === "pl") {
    return `${n} ${plural(n, ["sztuka", "sztuki", "sztuk"])}`;
  }
  return `${n} ${n === 1 ? "piece" : "pieces"}`;
}
