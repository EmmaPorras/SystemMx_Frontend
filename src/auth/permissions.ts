import type { BackendRole } from "./auth.types";

export const ROUTE_PERMISSIONS: Record<string, BackendRole[]> = {
  "/": ["ADMIN"],
  "/usuarios": ["ADMIN"],
  "/proveedores": ["ADMIN"],
  "/categorias": ["ADMIN"],
  "/tarifas-iva": ["ADMIN"],
  "/auditoria": ["ADMIN"],
  "/pedidos": ["ADMIN", "COMPRAS"],
  "/ventas": ["ADMIN", "VENTAS"],
  "/cuentas-por-cobrar": ["ADMIN", "VENTAS"],
  "/reportes": ["ADMIN", "CONSULTA"],
  "/productos": ["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"],
  "/lotes": ["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"],
  "/inventario/movimientos": ["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"],
};

export function getDefaultRouteForRole(role?: BackendRole | null): string {
  if (!role) return "/login";
  switch (role) {
    case "ADMIN":
      return "/";
    case "VENTAS":
      return "/ventas";
    case "COMPRAS":
      return "/pedidos";
    case "CONSULTA":
      return "/productos";
    default:
      return "/productos";
  }
}

export function isRoleAllowedForPath(path: string, role?: BackendRole | null): boolean {
  if (!role) return false;
  if (role === "ADMIN") return true;

  const normalizedPath = path.split("?")[0].split("#")[0];
  const permissions = ROUTE_PERMISSIONS[normalizedPath];

  if (!permissions) {
    return false;
  }

  return permissions.includes(role);
}
