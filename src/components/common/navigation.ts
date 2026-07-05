export type NavigationItem = {
  label: string;
  path: string;
  description: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "Inicio", path: "/", description: "Resumen general del sistema" },
  { label: "Proveedores", path: "/proveedores", description: "Catálogo de proveedores" },
  { label: "Tarifas IVA", path: "/tarifas-iva", description: "Catálogo de impuestos" },
  { label: "Productos", path: "/productos", description: "Catálogo general y precios" },
  { label: "Pedidos", path: "/pedidos", description: "Compras y entradas de inventario" },
  { label: "Lotes", path: "/lotes", description: "Trazabilidad por pedido" },
  { label: "Ventas", path: "/ventas", description: "Salida de inventario y caja" },
  { label: "Reportes", path: "/reportes", description: "Indicadores y análisis" },
];
