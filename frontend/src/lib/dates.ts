// Date formatting with best-before precision (SPEC §5.4, DESIGN §5).

import type { FreshnessStatus, Precision } from "../types";

export function formatBestBefore(
  date: string | null,
  precision: Precision,
  locale: string
): string {
  if (precision === "none" || !date) return "∞";
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  if (precision === "year") {
    return String(d.getFullYear());
  }
  if (precision === "month") {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${m}.${d.getFullYear()}`;
  }
  return new Intl.DateTimeFormat(locale || "pl", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function badgeText(
  status: FreshnessStatus,
  daysLeft: number | null,
  formatted: string
): string {
  if (status === "no_date") return "∞";
  if (status === "expired") {
    return daysLeft !== null ? `${daysLeft} dni` : "!";
  }
  if (status === "expiring_soon") {
    return daysLeft !== null ? `${daysLeft} dni` : formatted;
  }
  return formatted;
}

// Relative time for history rows ("2 godz. temu" / "2 hours ago").
export function relativeTime(iso: string, locale: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale || "pl", { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / 2592000), "month");
}

// Day group header for the history timeline.
export function dayGroup(iso: string, locale: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(d, today)) return "__today__";
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (isSameDay(d, yest)) return "__yesterday__";
  return new Intl.DateTimeFormat(locale || "pl", {
    day: "numeric",
    month: "long",
  }).format(d);
}

// Quick-pick date helpers: return {date, precision} for the add form chips.
export function addMonths(months: number): { date: string; precision: Precision } {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return { date: isoDate(d), precision: "day" };
}

export function addYears(years: number): { date: string; precision: Precision } {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return { date: isoDate(d), precision: "year" };
}

export function endOfYear(): { date: string; precision: Precision } {
  const d = new Date();
  return { date: `${d.getFullYear()}-12-31`, precision: "year" };
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
