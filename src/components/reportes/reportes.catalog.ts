import * as api from "../../services/reportesApi";

import type {
  ReportFilterMode,
  ReportFilterValues,
} from "./ReportFilters";

export type ReportFamily =
  | "resumen"
  | "ventas"
  | "inventario"
  | "compras"
  | "pagos"
  | "cuentas"
  | "auditoria";

export type ReportDefinition = {
  id: string; 
  family: ReportFamily;
  label: string;
  description: string;
  filterMode: ReportFilterMode;

  load: (
    filters: ReportFilterValues,
  ) => Promise<unknown>;
};

function periodo(
  filters: ReportFilterValues,
) {
  return {
    fechaDesde:
      filters.fechaDesde ||
      undefined,

    fechaHasta:
      filters.fechaHasta ||
      undefined,
  };
}

function fechaCorte(
  filters: ReportFilterValues,
) {
  return {
    fechaCorte:
      filters.fechaCorte,
  };
}

function auditoria(
  filters: ReportFilterValues,
) {
  const usuarioId =
    Number(filters.usuarioId);

  return {
    ...periodo(filters),

    usuarioId:
      filters.usuarioId &&
      Number.isInteger(usuarioId) &&
      usuarioId > 0
        ? usuarioId
        : undefined,
  };
}

export const reportesCatalog:
  ReportDefinition[] = [
  {
    id: "resumen",
    family: "resumen",
    label: "Resumen ejecutivo",
    description:
      "Visión consolidada del negocio.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteResumenApi(
        periodo(f),
      ),
  },

  // VENTAS
  {
    id: "ventas-resumen",
    family: "ventas",
    label: "Resumen de ventas",
    description:
      "Ventas, costos, utilidad y cobros.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteVentasResumenApi(
        periodo(f),
      ),
  },
  {
    id: "ventas-evolucion",
    family: "ventas",
    label: "Evolución de ventas",
    description:
      "Comportamiento diario de ventas.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteVentasEvolucionApi(
        periodo(f),
      ),
  },
  {
    id: "ventas-productos",
    family: "ventas",
    label: "Ventas por producto",
    description:
      "Rentabilidad y unidades por producto.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteVentasProductosApi(
        periodo(f),
      ),
  },
  {
    id: "ventas-lotes",
    family: "ventas",
    label: "Ventas por lote",
    description:
      "Rentabilidad por lote vendido.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteVentasLotesApi(
        periodo(f),
      ),
  },
  {
    id: "ventas-anuladas",
    family: "ventas",
    label: "Ventas anuladas",
    description:
      "Impacto histórico de ventas anuladas.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteVentasAnuladasApi(
        periodo(f),
      ),
  },

  // INVENTARIO
  {
    id: "inventario-resumen",
    family: "inventario",
    label: "Resumen de inventario",
    description:
      "Existencias y valoración actual.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteInventarioResumenApi(),
  },
  {
    id: "inventario-productos",
    family: "inventario",
    label: "Inventario por producto",
    description:
      "Existencias y valoración agrupadas.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteInventarioProductosApi(),
  },
  {
    id: "inventario-estados",
    family: "inventario",
    label: "Inventario por estado",
    description:
      "Distribución del inventario por estado.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteInventarioEstadosApi(),
  },
  {
    id: "inventario-sin-stock",
    family: "inventario",
    label: "Productos sin stock",
    description:
      "Productos sin disponibilidad actual.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteInventarioSinStockApi(),
  },
  {
    id: "inventario-historico",
    family: "inventario",
    label: "Inventario histórico",
    description:
      "Reconstrucción a una fecha de corte.",
    filterMode: "fechaCorte",
    load: (f) =>
      api.obtenerReporteInventarioHistoricoApi(
        fechaCorte(f),
      ),
  },

  // COMPRAS
  {
    id: "compras-resumen",
    family: "compras",
    label: "Resumen de compras",
    description:
      "Costos y volúmenes de compras.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteComprasResumenApi(
        periodo(f),
      ),
  },
  {
    id: "compras-evolucion",
    family: "compras",
    label: "Evolución de compras",
    description:
      "Comportamiento de compras por fecha.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteComprasEvolucionApi(
        periodo(f),
      ),
  },
  {
    id: "compras-proveedores",
    family: "compras",
    label: "Compras por proveedor",
    description:
      "Costos y pedidos por proveedor.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteComprasProveedoresApi(
        periodo(f),
      ),
  },
  {
    id: "compras-productos",
    family: "compras",
    label: "Compras por producto",
    description:
      "Costos de adquisición por producto.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteComprasProductosApi(
        periodo(f),
      ),
  },
  {
    id: "compras-costos",
    family: "compras",
    label: "Composición de costos",
    description:
      "Mercadería, envío, impuestos y gastos.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteComprasCostosApi(
        periodo(f),
      ),
  },
  {
    id: "compras-canceladas",
    family: "compras",
    label: "Compras canceladas",
    description:
      "Impacto histórico de pedidos cancelados.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReporteComprasCanceladasApi(
        periodo(f),
      ),
  },

  // PAGOS
  {
    id: "pagos-resumen",
    family: "pagos",
    label: "Resumen de pagos",
    description:
      "Cantidad y monto de pagos recibidos.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReportePagosResumenApi(
        periodo(f),
      ),
  },
  {
    id: "pagos-evolucion",
    family: "pagos",
    label: "Evolución de pagos",
    description:
      "Pagos recibidos por fecha.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReportePagosEvolucionApi(
        periodo(f),
      ),
  },
  {
    id: "pagos-metodos",
    family: "pagos",
    label: "Métodos de pago",
    description:
      "Distribución por método de pago.",
    filterMode: "periodo",
    load: (f) =>
      api.obtenerReportePagosMetodosApi(
        periodo(f),
      ),
  },
  {
    id: "pagos-conciliacion",
    family: "pagos",
    label: "Conciliación",
    description:
      "Comparación entre venta y ledger de pagos.",
    filterMode: "none",
    load: () =>
      api.obtenerReportePagosConciliacionApi(),
  },

  // CxC
  {
    id: "cuentas-resumen",
    family: "cuentas",
    label: "Cuentas por cobrar",
    description:
      "Ventas y saldos pendientes.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteCuentasPorCobrarApi(),
  },
  {
    id: "cuentas-vencimientos",
    family: "cuentas",
    label: "Vencimientos",
    description:
      "Clasificación de saldos por fecha de corte.",
    filterMode: "fechaCorte",
    load: (f) =>
      api.obtenerReporteVencimientosApi(
        fechaCorte(f),
      ),
  },

  // AUDITORÍA
  {
    id: "auditoria-resumen",
    family: "auditoria",
    label: "Resumen de auditoría",
    description:
      "Cobertura de usuario en operaciones.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteAuditoriaResumenApi(),
  },
  {
    id: "auditoria-usuarios",
    family: "auditoria",
    label: "Actividad por usuario",
    description:
      "Movimientos y pagos procesados.",
    filterMode: "auditoria",
    load: (f) =>
      api.obtenerReporteAuditoriaUsuariosApi(
        auditoria(f),
      ),
  },
  {
    id: "auditoria-movimientos",
    family: "auditoria",
    label: "Movimientos auditados",
    description:
      "Historial de movimientos con identidad.",
    filterMode: "auditoriaMovimiento",
    load: (f) =>
      api.obtenerReporteAuditoriaMovimientosApi({
        ...auditoria(f),

        tipoMovimiento:
          f.tipoMovimiento
            ? (f.tipoMovimiento as
                | "ENTRADA_COMPRA"
                | "SALIDA_VENTA"
                | "REINGRESO_ANULACION_VENTA")
            : undefined,
      }),
  },
  {
    id: "auditoria-pagos",
    family: "auditoria",
    label: "Pagos auditados",
    description:
      "Historial de pagos con identidad.",
    filterMode: "auditoria",
    load: (f) =>
      api.obtenerReporteAuditoriaPagosApi(
        auditoria(f),
      ),
  },
  {
    id: "auditoria-legacy",
    family: "auditoria",
    label: "Cobertura legacy",
    description:
      "Operaciones históricas sin identidad completa.",
    filterMode: "none",
    load: () =>
      api.obtenerReporteAuditoriaLegacyApi(),
  },
];

export const reportFamilyLabels:
  Record<ReportFamily, string> = {
  resumen: "Resumen",
  ventas: "Ventas",
  inventario: "Inventario",
  compras: "Compras",
  pagos: "Pagos",
  cuentas: "Cuentas por cobrar",
  auditoria: "Auditoría",
};
