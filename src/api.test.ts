import { describe, it, expect } from "vitest";
import { number, money, time } from "./api";
describe("market display precision", () => {
  it("does not invent prices for missing data", () => {
    expect(number(undefined)).toBe("—");
    expect(number(NaN)).toBe("—");
  });
  it("preserves contract tick precision", () => {
    expect(number(20000.25)).toBe("20,000.25");
    expect(number(2500.1)).toBe("2,500.10");
  });
  it("makes losses explicit", () => expect(money(-25)).toBe("−$25.00"));
  it("uses New York daylight saving rules", () => {
    expect(time("2026-03-06T14:30:00Z")).toBe("09:30:00");
    expect(time("2026-03-09T13:30:00Z")).toBe("09:30:00");
  });
});
