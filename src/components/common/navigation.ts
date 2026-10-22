import { useMemo, type ElementType } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
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
  Users,
  WalletCards,
} from "lucide-react";
import type { BackendRole } from "../../auth/auth.types";
import { useAuth } from "../../auth/useAuth";

export type NavigationItem = {
  label: string;
  path: string;
  description: string;
  icon: ElementType;
  allowedRoles?: BackendRole[];
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export type NavigationItemConfig = {
  labelKey: string;
  defaultLabel: string;
  path: string;
  descriptionKey: string;
  defaultDescription: string;
  icon: ElementType;
  allowedRoles?: BackendRole[];
};

export type NavigationGroupConfig = {
  labelKey: string;
  defaultLabel: string;
  items: NavigationItemConfig[];
};

export const navigationGroupConfigs: NavigationGroupConfig[] = [
  {
    labelKey: "navigation.general",
    defaultLabel: "General",
    items: [
      {
        labelKey: "navigation.home",
        defaultLabel: "Inicio",
        path: "/",
        descriptionKey: "navigation.homeDesc",
        defaultDescription: "Resumen general del sistema",
        icon: House,
        allowedRoles: ["ADMIN"],
      },
    ],
  },
  {
    labelKey: "navigation.purchases",
    defaultLabel: "Compras",
    items: [
      {
        labelKey: "navigation.suppliers",
        defaultLabel: "Proveedores",
        path: "/proveedores",
        descriptionKey: "navigation.suppliersDesc",
        defaultDescription: "Catálogo de proveedores",
        icon: Truck,
        allowedRoles: ["ADMIN"],
      },
      {
        labelKey: "navigation.orders",
        defaultLabel: "Pedidos",
        path: "/pedidos",
        descriptionKey: "navigation.ordersDesc",
        defaultDescription: "Compras y recepción de inventario",
        icon: ReceiptText,
        allowedRoles: ["ADMIN", "COMPRAS"],
      },
    ],
  },
  {
    labelKey: "navigation.inventory",
    defaultLabel: "Inventario",
    items: [
      {
        labelKey: "navigation.products",
        defaultLabel: "Productos",
        path: "/productos",
        descriptionKey: "navigation.productsDesc",
        defaultDescription: "Consulta de productos",
        icon: PackageSearch,
        allowedRoles: ["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"],
      },
      {
        labelKey: "navigation.batches",
        defaultLabel: "Lotes",
        path: "/lotes",
        descriptionKey: "navigation.batchesDesc",
        defaultDescription: "Trazabilidad de inventario",
        icon: Boxes,
        allowedRoles: ["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"],
      },
      {
        labelKey: "navigation.movements",
        defaultLabel: "Movimientos",
        path: "/inventario/movimientos",
        descriptionKey: "navigation.movementsDesc",
        defaultDescription: "Historial de entradas y salidas",
        icon: History,
        allowedRoles: ["ADMIN", "VENTAS", "COMPRAS", "CONSULTA"],
      },
    ],
  },
  {
    labelKey: "navigation.settings",
    defaultLabel: "Configuración",
    items: [
      {
        labelKey: "navigation.categories",
        defaultLabel: "Categorías",
        path: "/categorias",
        descriptionKey: "navigation.categoriesDesc",
        defaultDescription: "Clasificación de productos",
        icon: Tags,
        allowedRoles: ["ADMIN"],
      },
      {
        labelKey: "navigation.vatRates",
        defaultLabel: "Tarifas IVA",
        path: "/tarifas-iva",
        descriptionKey: "navigation.vatRatesDesc",
        defaultDescription: "Catálogo de impuestos",
        icon: Percent,
        allowedRoles: ["ADMIN"],
      },
      {
        labelKey: "navigation.users",
        defaultLabel: "Usuarios",
        path: "/usuarios",
        descriptionKey: "navigation.usersDesc",
        defaultDescription: "Gestión de cuentas e invitaciones",
        icon: Users,
        allowedRoles: ["ADMIN"],
      },
    ],
  },
  {
    labelKey: "navigation.sales",
    defaultLabel: "Ventas",
    items: [
      {
        labelKey: "navigation.sales",
        defaultLabel: "Ventas",
        path: "/ventas",
        descriptionKey: "navigation.salesDesc",
        defaultDescription: "Ventas, pagos y anulaciones",
        icon: ShoppingCart,
        allowedRoles: ["ADMIN", "VENTAS"],
      },
      {
        labelKey: "navigation.accountsReceivable",
        defaultLabel: "Cuentas por cobrar",
        path: "/cuentas-por-cobrar",
        descriptionKey: "navigation.accountsReceivableDesc",
        defaultDescription: "Saldos pendientes y vencimientos",
        icon: WalletCards,
        allowedRoles: ["ADMIN", "VENTAS"],
      },
    ],
  },
  {
    labelKey: "navigation.analytics",
    defaultLabel: "Análisis",
    items: [
      {
        labelKey: "navigation.reports",
        defaultLabel: "Reportes",
        path: "/reportes",
        descriptionKey: "navigation.reportsDesc",
        defaultDescription: "Indicadores y análisis",
        icon: FileBarChart,
        allowedRoles: ["ADMIN", "CONSULTA"],
      },
      {
        labelKey: "navigation.audit",
        defaultLabel: "Auditoría",
        path: "/auditoria",
        descriptionKey: "navigation.auditDesc",
        defaultDescription: "Trazabilidad administrativa",
        icon: ShieldCheck,
        allowedRoles: ["ADMIN"],
      },
    ],
  },
];

export function getNavigationGroups(
  translateFn: (key: string, defaultValue?: string) => string = (k, d) => i18n.t(k, d ?? ""),
  userRole?: BackendRole | null,
): NavigationGroup[] {
  return navigationGroupConfigs
    .map((group) => {
      const filteredItems = group.items
        .filter((item) => {
          if (!userRole) return true;
          if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
          return item.allowedRoles.includes(userRole);
        })
        .map((item) => ({
          label: translateFn(item.labelKey, item.defaultLabel),
          path: item.path,
          description: translateFn(item.descriptionKey, item.defaultDescription),
          icon: item.icon,
          allowedRoles: item.allowedRoles,
        }));

      return {
        label: translateFn(group.labelKey, group.defaultLabel),
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
}

export function useNavigation() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const groups = useMemo(() => {
    return getNavigationGroups((k, d) => t(k, d ?? ""), user?.rol);
  }, [t, user?.rol]);

  const items = useMemo(() => {
    return groups.flatMap((group) => group.items);
  }, [groups]);

  return {
    navigationGroups: groups,
    navigationItems: items,
  };
}

export const navigationGroups: NavigationGroup[] = getNavigationGroups();
export const navigationItems: NavigationItem[] = navigationGroups.flatMap((group) => group.items);
