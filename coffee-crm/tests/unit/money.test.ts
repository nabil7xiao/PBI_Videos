import { describe, expect, it } from "vitest";
import { formatMoney, fromMinor, toMinor } from "@/lib/money";

describe("money", () => {
  it("parses amounts into minor units without float errors", () => {
    expect(toMinor("4.50")).toBe(450);
    expect(toMinor("0.1")).toBe(10);
    expect(toMinor("19.99")).toBe(1999);
    expect(toMinor("1,234.56")).toBe(123456);
    expect(toMinor(0.3)).toBe(30);
    expect(toMinor("-2.5")).toBe(-250);
    expect(toMinor("7")).toBe(700);
  });

  it("rejects invalid input", () => {
    expect(toMinor("abc")).toBeNull();
    expect(toMinor("")).toBeNull();
    expect(toMinor("4.505")).toBeNull();
    expect(toMinor("1e3")).toBeNull();
  });

  it("formats with currency", () => {
    expect(formatMoney(450)).toBe("$4.50");
    expect(formatMoney(123456, "USD")).toBe("$1,234.56");
    expect(formatMoney(450, "EUR")).toBe("€4.50");
    expect(fromMinor(1999)).toBe(19.99);
  });
});
