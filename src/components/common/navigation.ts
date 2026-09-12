import type { ElementType } from "react";

import {
  Boxes,
  FileBarChart,
  History,
  House,
  PackageSearch,
  Percent,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  WalletCards,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  path: string;
  description: string;
  icon: ElementType;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "General",
    items: [
      {
        label: "Inicio",
        path: "/",
        description: "Resumen general del sistema",
        icon: House,
      },
    ],
  },
  {
    label: "Compras",
    items: [
      {
        label: "Proveedores",
        path: "/proveedores",
        description: "Catálogo de proveedores",
        icon: Truck,
      },
      {
        label: "Pedidos",
        path: "/pedidos",
        description: "Compras y recepción de inventario",
        icon: ReceiptText,
      },
    ],
  },
  {
    label: "Inventario",
    items: [
      {
        label: "Productos",
        path: "/productos",
        description: "Consulta de productos",
        icon: PackageSearch,
      },
      {
        label: "Lotes",
        path: "/lotes",
        description: "Trazabilidad de inventario",
        icon: Boxes,
      },
      {
        label: "Movimientos",
        path: "/inventario/movimientos",
        description: "Historial de entradas y salidas",
        icon: History,
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      {
        label: "Categorías",
        path: "/categorias",
        description: "Clasificación de productos",
        icon: Tags,
      },
      {
        label: "Tarifas IVA",
        path: "/tarifas-iva",
        description: "Catálogo de impuestos",
        icon: Percent,
      },
    ],
  },
  {
    label: "Ventas",
    items: [
      {
        label: "Ventas",
        path: "/ventas",
        description: "Ventas, pagos y anulaciones",
        icon: ShoppingCart,
      },
      {
        label: "Cuentas por cobrar",
        path: "/cuentas-por-cobrar",
        description: "Saldos pendientes y vencimientos",
        icon: WalletCards,
      },
    ],
  },
  {
    label: "Análisis",
    items: [
      {
        label: "Reportes",
        path: "/reportes",
        description: "Indicadores y análisis",
        icon: FileBarChart,
      },
      {
        label: "Auditoría",
        path: "/auditoria",
        description: "Trazabilidad administrativa",
        icon: ShieldCheck,
      },
    ],
  },
];

export const navigationItems =
  navigationGroups.flatMap((group) => group.items);
