import { apiClient } from "../api/apiClient";
import type { QueryParams } from "../api/api.types";

import type {
  ConsultaAuditoria,
  ConsultaAuditoriaMovimientos,
  ConsultaInventarioHistorico,
  ConsultaPeriodo,
  ConsultaResumen,
  ConsultaVencimientos,

  ReporteAuditoriaLegacy,
  ReporteAuditoriaMovimientoItem,
  ReporteAuditoriaPagoItem,
  ReporteAuditoriaResumen,
  ReporteAuditoriaUsuarioItem,

  ReporteComprasCanceladas,
  ReporteComprasCostos,
  ReporteComprasEvolucionItem,
  ReporteComprasProductoItem,
  ReporteComprasProveedorItem,
  ReporteComprasResumen,

  ReporteCuentasPorCobrar,

  ReporteInventarioEstadoItem,
  ReporteInventarioHistorico,
  ReporteInventarioProductoItem,
  ReporteInventarioResumen,
  ReporteInventarioSinStockItem,

  ReportePagosConciliacion,
  ReportePagosEvolucionItem,
  ReportePagosMetodoItem,
  ReportePagosResumen,

  ReporteResumenEjecutivo,

  ReporteVentasAnuladas,
  ReporteVentasEvolucionItem,
  ReporteVentasLoteItem,
  ReporteVentasProductoItem,
  ReporteVentasResumen,

  ReporteVencimientos,
} from "../components/reportes/reportes.types";

// ─────────────────────────────────────────────
// RESUMEN
// ─────────────────────────────────────────────

export function obtenerReporteResumenApi(
  query: ConsultaResumen = {},
): Promise<ReporteResumenEjecutivo> {
  return apiClient.get<ReporteResumenEjecutivo>(
    "/reportes/resumen",
    query as unknown as QueryParams,
  );
}

// ─────────────────────────────────────────────
// VENTAS
// ─────────────────────────────────────────────

export function obtenerReporteVentasResumenApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteVentasResumen> {
  return apiClient.get<ReporteVentasResumen>(
    "/reportes/ventas/resumen",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteVentasEvolucionApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteVentasEvolucionItem[]> {
  return apiClient.get<ReporteVentasEvolucionItem[]>(
    "/reportes/ventas/evolucion",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteVentasProductosApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteVentasProductoItem[]> {
  return apiClient.get<ReporteVentasProductoItem[]>(
    "/reportes/ventas/productos",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteVentasLotesApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteVentasLoteItem[]> {
  return apiClient.get<ReporteVentasLoteItem[]>(
    "/reportes/ventas/lotes",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteVentasAnuladasApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteVentasAnuladas> {
  return apiClient.get<ReporteVentasAnuladas>(
    "/reportes/ventas/anuladas",
    query as unknown as QueryParams,
  );
}

// ─────────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────────

export function obtenerReporteInventarioResumenApi():
  Promise<ReporteInventarioResumen> {
  return apiClient.get<ReporteInventarioResumen>(
    "/reportes/inventario/resumen",
  );
}

export function obtenerReporteInventarioProductosApi():
  Promise<ReporteInventarioProductoItem[]> {
  return apiClient.get<ReporteInventarioProductoItem[]>(
    "/reportes/inventario/productos",
  );
}

export function obtenerReporteInventarioEstadosApi():
  Promise<ReporteInventarioEstadoItem[]> {
  return apiClient.get<ReporteInventarioEstadoItem[]>(
    "/reportes/inventario/estados",
  );
}

export function obtenerReporteInventarioSinStockApi():
  Promise<ReporteInventarioSinStockItem[]> {
  return apiClient.get<ReporteInventarioSinStockItem[]>(
    "/reportes/inventario/sin-stock",
  );
}

export function obtenerReporteInventarioHistoricoApi(
  query: ConsultaInventarioHistorico,
): Promise<ReporteInventarioHistorico> {
  return apiClient.get<ReporteInventarioHistorico>(
    "/reportes/inventario/historico",
    query as unknown as QueryParams,
  );
}

// ─────────────────────────────────────────────
// COMPRAS
// ─────────────────────────────────────────────

export function obtenerReporteComprasResumenApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteComprasResumen> {
  return apiClient.get<ReporteComprasResumen>(
    "/reportes/compras/resumen",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteComprasEvolucionApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteComprasEvolucionItem[]> {
  return apiClient.get<ReporteComprasEvolucionItem[]>(
    "/reportes/compras/evolucion",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteComprasProveedoresApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteComprasProveedorItem[]> {
  return apiClient.get<ReporteComprasProveedorItem[]>(
    "/reportes/compras/proveedores",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteComprasProductosApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteComprasProductoItem[]> {
  return apiClient.get<ReporteComprasProductoItem[]>(
    "/reportes/compras/productos",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteComprasCostosApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteComprasCostos> {
  return apiClient.get<ReporteComprasCostos>(
    "/reportes/compras/costos",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteComprasCanceladasApi(
  query: ConsultaPeriodo = {},
): Promise<ReporteComprasCanceladas> {
  return apiClient.get<ReporteComprasCanceladas>(
    "/reportes/compras/canceladas",
    query as unknown as QueryParams,
  );
}

// ─────────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────────

export function obtenerReportePagosResumenApi(
  query: ConsultaPeriodo = {},
): Promise<ReportePagosResumen> {
  return apiClient.get<ReportePagosResumen>(
    "/reportes/pagos/resumen",
    query as unknown as QueryParams,
  );
}

export function obtenerReportePagosEvolucionApi(
  query: ConsultaPeriodo = {},
): Promise<ReportePagosEvolucionItem[]> {
  return apiClient.get<ReportePagosEvolucionItem[]>(
    "/reportes/pagos/evolucion",
    query as unknown as QueryParams,
  );
}

export function obtenerReportePagosMetodosApi(
  query: ConsultaPeriodo = {},
): Promise<ReportePagosMetodoItem[]> {
  return apiClient.get<ReportePagosMetodoItem[]>(
    "/reportes/pagos/metodos",
    query as unknown as QueryParams,
  );
}

export function obtenerReportePagosConciliacionApi():
  Promise<ReportePagosConciliacion> {
  return apiClient.get<ReportePagosConciliacion>(
    "/reportes/pagos/conciliacion",
  );
}

// ─────────────────────────────────────────────
// CUENTAS POR COBRAR
// ─────────────────────────────────────────────

export function obtenerReporteCuentasPorCobrarApi():
  Promise<ReporteCuentasPorCobrar> {
  return apiClient.get<ReporteCuentasPorCobrar>(
    "/reportes/cuentas-por-cobrar",
  );
}

export function obtenerReporteVencimientosApi(
  query: ConsultaVencimientos,
): Promise<ReporteVencimientos> {
  return apiClient.get<ReporteVencimientos>(
    "/reportes/cuentas-por-cobrar/vencimientos",
    query as unknown as QueryParams,
  );
}

// ─────────────────────────────────────────────
// AUDITORÍA
// ─────────────────────────────────────────────

export function obtenerReporteAuditoriaResumenApi():
  Promise<ReporteAuditoriaResumen> {
  return apiClient.get<ReporteAuditoriaResumen>(
    "/reportes/auditoria/resumen",
  );
}

export function obtenerReporteAuditoriaUsuariosApi(
  query: ConsultaAuditoria = {},
): Promise<ReporteAuditoriaUsuarioItem[]> {
  return apiClient.get<ReporteAuditoriaUsuarioItem[]>(
    "/reportes/auditoria/usuarios",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteAuditoriaMovimientosApi(
  query: ConsultaAuditoriaMovimientos = {},
): Promise<ReporteAuditoriaMovimientoItem[]> {
  return apiClient.get<ReporteAuditoriaMovimientoItem[]>(
    "/reportes/auditoria/movimientos",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteAuditoriaPagosApi(
  query: ConsultaAuditoria = {},
): Promise<ReporteAuditoriaPagoItem[]> {
  return apiClient.get<ReporteAuditoriaPagoItem[]>(
    "/reportes/auditoria/pagos",
    query as unknown as QueryParams,
  );
}

export function obtenerReporteAuditoriaLegacyApi():
  Promise<ReporteAuditoriaLegacy> {
  return apiClient.get<ReporteAuditoriaLegacy>(
    "/reportes/auditoria/legacy",
  );
}
