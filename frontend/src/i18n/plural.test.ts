import { describe, expect, it, beforeAll } from "vitest";
import { setLanguage, plural, batches } from "./index";

describe("Polish plural forms", () => {
  beforeAll(() => setLanguage("pl"));

  it("uses the singular for 1", () => {
    expect(plural(1, ["partia", "partie", "partii"])).toBe("partia");
  });
  it("uses the few form for 2-4", () => {
    expect(plural(2, ["partia", "partie", "partii"])).toBe("partie");
    expect(plural(3, ["partia", "partie", "partii"])).toBe("partie");
    expect(plural(24, ["partia", "partie", "partii"])).toBe("partie");
  });
  it("uses the many form for 5+ and teens", () => {
    expect(plural(5, ["partia", "partie", "partii"])).toBe("partii");
    expect(plural(11, ["partia", "partie", "partii"])).toBe("partii");
    expect(plural(12, ["partia", "partie", "partii"])).toBe("partii");
  });
  it("batches() composes count + form", () => {
    expect(batches(1)).toBe("1 partia");
    expect(batches(3)).toBe("3 partie");
    expect(batches(5)).toBe("5 partii");
  });
});

describe("English fallback", () => {
  beforeAll(() => setLanguage("en"));
  it("uses singular/plural", () => {
    expect(batches(1)).toBe("1 batch");
    expect(batches(2)).toBe("2 batches");
  });
});
