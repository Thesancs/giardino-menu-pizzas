import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/formatters";

describe("formatCurrency", () => {
  it("formats values as BRL", () => {
    expect(formatCurrency(62)).toContain("62");
    expect(formatCurrency(62)).toContain("R$");
  });
});
