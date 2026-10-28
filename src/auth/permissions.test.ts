import { describe, expect, it } from "vitest";
import { getDefaultRouteForRole, isRoleAllowedForPath, ROUTE_PERMISSIONS } from "./permissions";
import type { BackendRole } from "./auth.types";

describe("SYSTEMMX - Matriz de Permisos Frontend (Etapa 12 y Fase 4)", () => {
  describe("Rutas por defecto en Login / Redirección", () => {
    it("ADMIN dirige a Inicio (/)", () => {
      expect(getDefaultRouteForRole("ADMIN")).toBe("/");
    });

    it("VENTAS dirige a Ventas (/ventas)", () => {
      expect(getDefaultRouteForRole("VENTAS")).toBe("/ventas");
    });

    it("COMPRAS dirige a Pedidos (/pedidos)", () => {
      expect(getDefaultRouteForRole("COMPRAS")).toBe("/pedidos");
    });

    it("CONSULTA dirige a Productos (/productos)", () => {
      expect(getDefaultRouteForRole("CONSULTA")).toBe("/productos");
    });

    it("DEMO dirige a /demo", () => {
      expect(getDefaultRouteForRole("DEMO")).toBe("/demo");
    });

    it("Sin rol dirige a /login", () => {
      expect(getDefaultRouteForRole(null)).toBe("/login");
    });
  });

  describe("Matriz de Autorización por Ruta", () => {
    it("ADMIN tiene acceso total a todos los módulos", () => {
      const allPaths = Object.keys(ROUTE_PERMISSIONS);
      allPaths.forEach((path) => {
        expect(isRoleAllowedForPath(path, "ADMIN")).toBe(true);
      });
    });

    it("VENTAS solo accede a ventas, cuentas por cobrar e inventario de consulta", () => {
      expect(isRoleAllowedForPath("/ventas", "VENTAS")).toBe(true);
      expect(isRoleAllowedForPath("/cuentas-por-cobrar", "VENTAS")).toBe(true);
      expect(isRoleAllowedForPath("/productos", "VENTAS")).toBe(true);
      expect(isRoleAllowedForPath("/lotes", "VENTAS")).toBe(true);
      expect(isRoleAllowedForPath("/inventario/movimientos", "VENTAS")).toBe(true);

      // Prohibidos
      expect(isRoleAllowedForPath("/pedidos", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/proveedores", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/usuarios", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/categorias", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/tarifas-iva", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/reportes", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/auditoria", "VENTAS")).toBe(false);
      expect(isRoleAllowedForPath("/demo", "VENTAS")).toBe(false);
    });

    it("COMPRAS solo accede a pedidos e inventario de consulta", () => {
      expect(isRoleAllowedForPath("/pedidos", "COMPRAS")).toBe(true);
      expect(isRoleAllowedForPath("/productos", "COMPRAS")).toBe(true);
      expect(isRoleAllowedForPath("/lotes", "COMPRAS")).toBe(true);
      expect(isRoleAllowedForPath("/inventario/movimientos", "COMPRAS")).toBe(true);

      // Prohibidos
      expect(isRoleAllowedForPath("/ventas", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/cuentas-por-cobrar", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/proveedores", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/usuarios", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/categorias", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/tarifas-iva", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/reportes", "COMPRAS")).toBe(false);
      expect(isRoleAllowedForPath("/auditoria", "COMPRAS")).toBe(false);
    });

    it("CONSULTA solo accede a inventario y reportes en lectura", () => {
      expect(isRoleAllowedForPath("/productos", "CONSULTA")).toBe(true);
      expect(isRoleAllowedForPath("/lotes", "CONSULTA")).toBe(true);
      expect(isRoleAllowedForPath("/inventario/movimientos", "CONSULTA")).toBe(true);
      expect(isRoleAllowedForPath("/reportes", "CONSULTA")).toBe(true);

      // Prohibidos
      expect(isRoleAllowedForPath("/pedidos", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/ventas", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/cuentas-por-cobrar", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/proveedores", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/usuarios", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/categorias", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/tarifas-iva", "CONSULTA")).toBe(false);
      expect(isRoleAllowedForPath("/auditoria", "CONSULTA")).toBe(false);
    });

    it("DEMO solo accede al entorno demostrativo aislado /demo", () => {
      expect(isRoleAllowedForPath("/demo", "DEMO")).toBe(true);

      // Estrictamente prohibido en datos reales y operaciones
      expect(isRoleAllowedForPath("/ventas", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/cuentas-por-cobrar", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/pedidos", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/proveedores", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/usuarios", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/categorias", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/tarifas-iva", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/reportes", "DEMO")).toBe(false);
      expect(isRoleAllowedForPath("/auditoria", "DEMO")).toBe(false);
    });
  });
});
