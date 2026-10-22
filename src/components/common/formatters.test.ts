import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { changeLanguage } from "../../i18n";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from "./formatters";

describe("Formatters con soporte de locale", () => {
  beforeEach(async () => {
    await changeLanguage("es");
  });

  afterEach(async () => {
    await changeLanguage("es");
  });

  it("formatea moneda conservando CRC en español (es-CR)", () => {
    const formatted = formatCurrency(1250000.5);
    // En es-CR el símbolo suele ser ₡
    expect(formatted).toContain("1");
    expect(formatted).toContain("250");
    expect(formatted).toMatch(/CRC|₡/);
  });

  it("formatea moneda en inglés (en-US) conservando código de moneda CRC", async () => {
    await changeLanguage("en");
    const formatted = formatCurrency(1250000.5);
    expect(formatted).toContain("CRC");
    expect(formatted).toContain("1,250,000.50");
  });

  it("formatea moneda en portugués (pt-BR) conservando código de moneda CRC", async () => {
    await changeLanguage("pt");
    const formatted = formatCurrency(1250000.5);
    expect(formatted).toContain("CRC");
    // En pt-BR se usan puntos para miles y coma para decimales
    expect(formatted).toContain("1.250.000,50");
  });

  it("permite pasar locale explícito a formatCurrency", () => {
    const formattedEn = formatCurrency(500, "en-US");
    expect(formattedEn).toContain("CRC");
    expect(formattedEn).toContain("500.00");
  });

  it("formatea números con formatNumber según locale activo", async () => {
    await changeLanguage("en");
    expect(formatNumber(1000.5)).toBe("1,000.5");

    await changeLanguage("pt");
    expect(formatNumber(1000.5)).toBe("1.000,5");
  });

  it("formatea fechas con formatDate", () => {
    const formatted = formatDate("2026-09-11T12:00:00Z");
    expect(formatted).not.toBe("-");
    expect(formatDate("")).toBe("-");
  });

  it("formatea fecha y hora con formatDateTime", () => {
    const formatted = formatDateTime("2026-09-11T12:30:45Z");
    expect(formatted).not.toBe("-");
    expect(formatDateTime("")).toBe("-");
  });
});
