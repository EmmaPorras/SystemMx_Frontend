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

export type NavigationItemConfig = {
  labelKey: string;
  defaultLabel: string;
  path: string;
  descriptionKey: string;
  defaultDescription: string;
  icon: ElementType;
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
      },
      {
        labelKey: "navigation.orders",
        defaultLabel: "Pedidos",
        path: "/pedidos",
        descriptionKey: "navigation.ordersDesc",
        defaultDescription: "Compras y recepción de inventario",
        icon: ReceiptText,
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
      },
      {
        labelKey: "navigation.batches",
        defaultLabel: "Lotes",
        path: "/lotes",
        descriptionKey: "navigation.batchesDesc",
        defaultDescription: "Trazabilidad de inventario",
        icon: Boxes,
      },
      {
        labelKey: "navigation.movements",
        defaultLabel: "Movimientos",
        path: "/inventario/movimientos",
        descriptionKey: "navigation.movementsDesc",
        defaultDescription: "Historial de entradas y salidas",
        icon: History,
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
      },
      {
        labelKey: "navigation.vatRates",
        defaultLabel: "Tarifas IVA",
        path: "/tarifas-iva",
        descriptionKey: "navigation.vatRatesDesc",
        defaultDescription: "Catálogo de impuestos",
        icon: Percent,
      },
      {
        labelKey: "navigation.users",
        defaultLabel: "Usuarios",
        path: "/usuarios",
        descriptionKey: "navigation.usersDesc",
        defaultDescription: "Gestión de cuentas e invitaciones",
        icon: Users,
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
      },
      {
        labelKey: "navigation.accountsReceivable",
        defaultLabel: "Cuentas por cobrar",
        path: "/cuentas-por-cobrar",
        descriptionKey: "navigation.accountsReceivableDesc",
        defaultDescription: "Saldos pendientes y vencimientos",
        icon: WalletCards,
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
      },
      {
        labelKey: "navigation.audit",
        defaultLabel: "Auditoría",
        path: "/auditoria",
        descriptionKey: "navigation.auditDesc",
        defaultDescription: "Trazabilidad administrativa",
        icon: ShieldCheck,
      },
    ],
  },
];

export function getNavigationGroups(
  translateFn: (key: string, defaultValue?: string) => string = (k, d) => i18n.t(k, d ?? ""),
): NavigationGroup[] {
  return navigationGroupConfigs.map((group) => ({
    label: translateFn(group.labelKey, group.defaultLabel),
    items: group.items.map((item) => ({
      label: translateFn(item.labelKey, item.defaultLabel),
      path: item.path,
      description: translateFn(item.descriptionKey, item.defaultDescription),
      icon: item.icon,
    })),
  }));
}

export function useNavigation() {
  const { t } = useTranslation();

  const groups = useMemo(() => {
    return getNavigationGroups((k, d) => t(k, d ?? ""));
  }, [t]);

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
