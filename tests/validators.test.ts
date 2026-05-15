import { describe, expect, it } from "vitest";
import { formatPhoneInput, isRequired, isValidBrazilianPhone, onlyDigits } from "@/lib/validators";

describe("validators", () => {
  it("keeps only digits", () => {
    expect(onlyDigits("(11) 99999-0000")).toBe("11999990000");
  });

  it("validates Brazilian phone length", () => {
    expect(isValidBrazilianPhone("(11) 99999-0000")).toBe(true);
    expect(isValidBrazilianPhone("123")).toBe(false);
  });

  it("formats phone input", () => {
    expect(formatPhoneInput("11999990000")).toBe("(11) 99999-0000");
  });

  it("checks required fields", () => {
    expect(isRequired("Glauber")).toBe(true);
    expect(isRequired("   ")).toBe(false);
  });
});
