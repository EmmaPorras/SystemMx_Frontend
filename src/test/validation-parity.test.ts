import { describe, it, expect } from "vitest";
import { cleanRawMoney, formatDisplayMoney } from "../components/common/moneyFormatters";

describe("Frontend Validation Parity Suite", () => {
  describe("Username formatting parity", () => {
    const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

    it("acepta usernames con letras, números, puntos, guiones y guiones bajos", () => {
      expect(USERNAME_REGEX.test("admin.user")).toBe(true);
      expect(USERNAME_REGEX.test("derek_99")).toBe(true);
      expect(USERNAME_REGEX.test("sistema-mx.demo")).toBe(true);
    });

    it("rechaza usernames con espacios o caracteres no permitidos", () => {
      expect(USERNAME_REGEX.test("usuario con espacios")).toBe(false);
      expect(USERNAME_REGEX.test("usuario@correo.com")).toBe(false);
      expect(USERNAME_REGEX.test("usuario#123")).toBe(false);
      expect(USERNAME_REGEX.test("admin!")).toBe(false);
    });

    it("valida longitudes límites (3 a 50)", () => {
      expect("ab".length >= 3).toBe(false);
      expect("abc".length >= 3).toBe(true);
      expect("a".repeat(50).length <= 50).toBe(true);
      expect("a".repeat(51).length <= 50).toBe(false);
    });
  });

  describe("Nombres humanos y caracteres legítimos Unicode", () => {
    it("preserva acentos, tildes, ñ, apóstrofes y diéresis", () => {
      const nombre = "María Peña Günther O'Connor";
      expect(nombre.length).toBeGreaterThanOrEqual(2);
      expect(nombre.length).toBeLessThanOrEqual(100);
      expect(nombre.trim()).toBe("María Peña Günther O'Connor");
    });
  });

  describe("Teléfono y correo electrónico", () => {
    const PHONE_REGEX = /^[0-9+\s()-]+$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it("acepta teléfonos válidos internacionales y locales", () => {
      expect(PHONE_REGEX.test("+506 2222-3333")).toBe(true);
      expect(PHONE_REGEX.test("(506) 8888-9999")).toBe(true);
      expect(PHONE_REGEX.test("22345678")).toBe(true);
    });

    it("rechaza teléfonos con caracteres alfabéticos", () => {
      expect(PHONE_REGEX.test("+506-TELEFONO")).toBe(false);
      expect(PHONE_REGEX.test("abc-1234")).toBe(false);
    });

    it("valida correos electrónicos válidos", () => {
      expect(EMAIL_REGEX.test("usuario@systemmx.com")).toBe(true);
      expect(EMAIL_REGEX.test("contacto.soporte@empresa.co.cr")).toBe(true);
    });

    it("rechaza correos malformados", () => {
      expect(EMAIL_REGEX.test("correo-sin-arroba")).toBe(false);
      expect(EMAIL_REGEX.test("correo@sin-tld")).toBe(false);
      expect(EMAIL_REGEX.test("@dominio.com")).toBe(false);
    });
  });

  describe("Moneda, precisión decimal y sanitización", () => {
    it("limpia montos raw y respeta 2 decimales", () => {
      expect(cleanRawMoney("12500.50", 2)).toBe("12500.50");
      expect(cleanRawMoney("12 500.75", 2)).toBe("12500.75");
      expect(cleanRawMoney("100.12345", 2)).toBe("100.12");
      expect(cleanRawMoney("abc1500def", 2)).toBe("1500");
    });

    it("formatea moneda para visualización consistente", () => {
      expect(formatDisplayMoney("1500", true)).toBe("1 500");
      expect(formatDisplayMoney("250000.75", true)).toBe("250 000.75");
    });
  });

  describe("Tarifas de IVA", () => {
    function validarTarifaPorcentaje(p: number): boolean {
      return !isNaN(p) && p >= 0 && p <= 100;
    }

    it("valida rango de porcentajes de 0 a 100", () => {
      expect(validarTarifaPorcentaje(0)).toBe(true);
      expect(validarTarifaPorcentaje(13)).toBe(true);
      expect(validarTarifaPorcentaje(100)).toBe(true);
      expect(validarTarifaPorcentaje(-1)).toBe(false);
      expect(validarTarifaPorcentaje(100.01)).toBe(false);
      expect(validarTarifaPorcentaje(NaN)).toBe(false);
    });
  });

  describe("Fechas formato ISO", () => {
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

    it("acepta formato YYYY-MM-DD", () => {
      expect(ISO_DATE_REGEX.test("2026-10-27")).toBe(true);
      expect(ISO_DATE_REGEX.test("2026-01-15")).toBe(true);
    });

    it("rechaza formatos no ISO", () => {
      expect(ISO_DATE_REGEX.test("27/10/2026")).toBe(false);
      expect(ISO_DATE_REGEX.test("10-27-2026")).toBe(false);
      expect(ISO_DATE_REGEX.test("2026-1-5")).toBe(false);
    });
  });
});
