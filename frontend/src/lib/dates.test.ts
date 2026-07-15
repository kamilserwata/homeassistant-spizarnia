import { describe, expect, it } from "vitest";
import { formatBestBefore, badgeText } from "./dates";

describe("formatBestBefore", () => {
  it("formats full day dates via locale", () => {
    expect(formatBestBefore("2027-06-30", "day", "pl")).toMatch(/30.*06.*2027/);
  });
  it("formats month precision as MM.YYYY", () => {
    expect(formatBestBefore("2027-06-30", "month", "pl")).toBe("06.2027");
  });
  it("formats year precision as YYYY", () => {
    expect(formatBestBefore("2027-12-31", "year", "pl")).toBe("2027");
  });
  it("returns infinity for no-date", () => {
    expect(formatBestBefore(null, "none", "pl")).toBe("∞");
    expect(formatBestBefore("2027-01-01", "none", "pl")).toBe("∞");
  });
});

describe("badgeText", () => {
  it("shows day counts for expiring", () => {
    expect(badgeText("expiring_soon", 12, "06.2027")).toBe("12 dni");
  });
  it("shows the formatted date when ok", () => {
    expect(badgeText("ok", 300, "06.2027")).toBe("06.2027");
  });
  it("shows infinity for no-date", () => {
    expect(badgeText("no_date", null, "")).toBe("∞");
  });
});
