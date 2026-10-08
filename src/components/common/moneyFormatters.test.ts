import { describe, expect, it } from "vitest";
import {
  formatDisplayMoney,
  cleanRawMoney,
  formatMoneyWithSymbol,
} from "./moneyFormatters";

describe("moneyFormatters", () => {
  describe("formatDisplayMoney", () => {
    it("formatea enteros con espacios de miles", () => {
      expect(formatDisplayMoney("30000")).toBe("30 000");
      expect(formatDisplayMoney(1250000)).toBe("1 250 000");
      expect(formatDisplayMoney("500")).toBe("500");
    });

    it("formatea decimales preservando punto y dígitos decimales", () => {
      expect(formatDisplayMoney("520.50")).toBe("520.50");
      expect(formatDisplayMoney("12500.75")).toBe("12 500.75");
    });

    it("maneja cadenas vacías y valores nulos", () => {
      expect(formatDisplayMoney("")).toBe("");
      expect(formatDisplayMoney(0)).toBe("0");
    });
  });

  describe("cleanRawMoney", () => {
    it("remueve espacios y formatea coma como punto decimal", () => {
      expect(cleanRawMoney("30 000")).toBe("30000");
      expect(cleanRawMoney("1 250 000,50")).toBe("1250000.50");
      expect(cleanRawMoney("520.75")).toBe("520.75");
    });

    it("restringe decimales a maxDecimals", () => {
      expect(cleanRawMoney("100.12345", 2)).toBe("100.12");
    });
  });

  describe("formatMoneyWithSymbol", () => {
    it("formatea con símbolo de colones", () => {
      expect(formatMoneyWithSymbol(30000, "CRC").replace(/\s/g, " ")).toBe("₡ 30 000");
    });

    it("formatea con símbolo de dólares y euros", () => {
      expect(formatMoneyWithSymbol(150.5, "USD")).toContain("$");
      expect(formatMoneyWithSymbol(200, "EUR")).toContain("€");
    });
  });
});
