import type { ResumenDashboard } from "../home/dashboard.types";

import type {
  CuentasPorCobrarResumenResponse,
  VencimientosCuentasPorCobrarResponse,
} from "../cuentas-por-cobrar/cuentasPorCobrar.types";

export type ConsultaPeriodo = {
  fechaDesde?: string;
  fechaHasta?: string;
};

export type ConsultaResumen = ConsultaPeriodo;

export type ConsultaInventarioHistorico = {
  fechaCorte: string;
};

export type ConsultaVencimientos = {
  fechaCorte: string;
};

export type ConsultaAuditoria = {
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: number;
};

export type ConsultaAuditoriaMovimientos =
  ConsultaAuditoria & {
    tipoMovimiento?:
      | "ENTRADA_COMPRA"
      | "SALIDA_VENTA"
      | "REINGRESO_ANULACION_VENTA";
  };

export type ReporteResumenEjecutivo =
  ResumenDashboard;

// ─────────────────────────────────────────────
// VENTAS
// ─────────────────────────────────────────────

export type ReporteVentasResumen = {
  periodo: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };

  cantidadVentas: number;
  subtotal: number;
  descuentos: number;
  iva: number;
  ventas: number;
  costo: number;
  gananciaBruta: number;
  margenBrutoPorcentaje: number;
  montoPagado: number;
  saldoPendiente: number;
};

export type ReporteVentasEvolucionItem = {
  fecha: string;
  cantidadVentas: number;
  ventas: number;
  costo: number;
  gananciaBruta: number;
  margenBrutoPorcentaje: number;
};

export type ReporteVentasProductoItem = {
  idProducto: number;
  producto: string;
  categoria: string;
  unidadesVendidas: number;
  ventas: number;
  costo: number;
  gananciaBruta: number;
  margenBrutoPorcentaje: number;
};

export type ReporteVentasLoteItem = {
  idLote: number;
  codigoLote: string;
  idProducto: number;
  producto: string;
  unidadesVendidas: number;
  ventas: number;
  costo: number;
  gananciaBruta: number;
  margenBrutoPorcentaje: number;
};

export type ReporteVentasAnuladas = {
  periodo: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };

  cantidad: number;
  importeOriginal: number;
  costoOriginal: number;
  gananciaOriginal: number;
  montoPagadoHistorico: number;
};

// ─────────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────────

export type ReporteInventarioResumen = {
  lotesConStock: number;
  unidadesRecibidas: number;
  unidadesDisponibles: number;
  valorCosto: number;
  costoPromedioPonderado: number;
};

export type ReporteInventarioProductoItem = {
  idProducto: number;
  producto: string;
  categoria: string;
  lotesActivos: number;
  stockDisponible: number;
  unidadesRecibidas: number;
  valorCosto: number;
  costoPromedioPonderado: number;
  precioVentaSugeridoPromedio: number;
};

export type ReporteInventarioEstadoItem = {
  estado: string;
  lotes: number;
  unidadesRecibidas: number;
  unidadesDisponibles: number;
  valorCostoDisponible: number;
};

export type ReporteInventarioSinStockItem = {
  idProducto: number;
  producto: string;
  cantidadRecibida: number;
  stockDisponible: number;
  lotesEnProceso: number;
  lotesAgotados: number;
};

export type ReporteInventarioHistorico = {
  fechaCorte: string;

  cobertura: {
    lotesTotales: number;
    lotesConHistorialCompleto: number;
    lotesLegacy: number;
    coberturaCompleta: boolean;
    lotesInconsistentes: number;
  };

  reconstruccion: {
    unidades: number;
    valorCosto: number;
  };

  lotes: Array<{
    idLote: number;
    codigoLote: string;
    idProducto: number;
    producto: string;
    cantidadRecibida: number;
    entradasRegistradas: number;
    historialCompleto: boolean;
    stockHistorico: number | null;
    stockActual: number;
    costoUnitarioReal: number;
    valorCostoHistorico: number | null;
    consistente: boolean | null;
  }>;
};

// ─────────────────────────────────────────────
// COMPRAS
// ─────────────────────────────────────────────

export type ReporteComprasResumen = {
  periodo: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };

  pedidos: number;
  unidadesPedidas: number;
  mercaderiaColones: number;
  envio: number;
  impuestos: number;
  otrosGastos: number;
  costoReal: number;
  promedioCostoPorPedido: number;
  promedioCostoPorUnidad: number;
};

export type ReporteComprasEvolucionItem = {
  fecha: string;
  pedidos: number;
  unidadesPedidas: number;
  mercaderiaColones: number;
  costoReal: number;
};

export type ReporteComprasProveedorItem = {
  idProveedor: number;
  proveedor: string;
  pedidos: number;
  unidadesPedidas: number;
  mercaderiaColones: number;
  costosAdicionales: number;
  costoReal: number;
};

export type ReporteComprasProductoItem = {
  idProducto: number;
  producto: string;
  categoria: string;
  pedidos: number;
  unidadesPedidas: number;
  mercaderiaColones: number;
  envio: number;
  impuestos: number;
  otrosGastos: number;
  costoReal: number;
};

export type ReporteComprasCostos = {
  mercaderia: {
    monto: number;
    porcentaje: number;
  };

  envio: {
    monto: number;
    porcentaje: number;
  };

  impuestos: {
    monto: number;
    porcentaje: number;
  };

  otrosGastos: {
    monto: number;
    porcentaje: number;
  };

  costoReal: number;
  diferencia: number;
  consistente: boolean;
};

export type ReporteComprasCanceladas = {
  periodo: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };

  cantidadPedidos: number;
  unidadesPlaneadas: number;
  mercaderiaOriginal: number;
  costoRealOriginal: number;
};

// ─────────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────────

export type ReportePagosResumen = {
  periodo: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };

  cantidadPagos: number;
  totalPagado: number;
  promedioPago: number;
};

export type ReportePagosEvolucionItem = {
  fecha: string;
  cantidadPagos: number;
  totalPagado: number;
};

export type ReportePagosMetodoItem = {
  metodoPago: string;
  cantidadPagos: number;
  totalPagado: number;
  porcentaje: number;
};

export type ReportePagosConciliacion = {
  resumen: {
    ventasActivas: number;
    conciliadas: number;
    historialIncompleto: number;
    inconsistentes: number;
    montoPagadoVenta: number;
    montoLedger: number;
    diferenciaCobertura: number;
  };

  detalle: Array<{
    idVenta: number;
    numeroVenta: string;
    fechaVenta: string;
    totalVenta: number;
    montoPagadoVenta: number;
    saldoPendiente: number;
    cantidadPagosLedger: number;
    montoLedger: number;
    diferencia: number;
    estado: string;
  }>;
};

// ─────────────────────────────────────────────
// CUENTAS POR COBRAR
// ─────────────────────────────────────────────

export type ReporteCuentasPorCobrar =
  CuentasPorCobrarResumenResponse;

export type ReporteVencimientos =
  VencimientosCuentasPorCobrarResponse;

// ─────────────────────────────────────────────
// AUDITORÍA
// ─────────────────────────────────────────────

export type ReporteAuditoriaResumen = {
  movimientos: {
    total: number;
    conUsuario: number;
    sinUsuario: number;
    coberturaPorcentaje: number;
  };

  pagos: {
    total: number;
    conUsuario: number;
    sinUsuario: number;
    coberturaPorcentaje: number;
  };
};

export type ReporteAuditoriaUsuarioItem = {
  idUsuario: number;
  username: string;
  nombre: string;
  rol: string;

  movimientos: number;
  entradas: number;
  salidas: number;
  reingresos: number;
  unidadesMovidas: number;

  pagosProcesados: number;
  montoPagosProcesado: number;
};

export type ReporteAuditoriaMovimientoItem = {
  idMovimiento: number;
  fechaMovimiento: string;
  tipoMovimiento: string;
  cantidad: number;

  idUsuario: number | null;
  usuarioActual: string | null;
  usuarioSnapshot: string | null;

  idProducto: number;
  idLote: number;

  referenciaTipo: string;
  referenciaId: number;

  costoUnitario: number;
  totalMovimiento: number;

  motivo: string;
  observaciones: string | null;
};

export type ReporteAuditoriaPagoItem = {
  idPagoVenta: number;
  fecha: string;

  idVenta: number;
  numeroVenta: string;
  estadoVenta: string;

  metodoPago: string;
  monto: number;

  idUsuario: number | null;
  usuarioActual: string | null;
  usuarioSnapshot: string | null;

  referencia: string | null;
  observaciones: string | null;
};

export type ReporteAuditoriaLegacy = {
  movimientos: Array<{
    tipoMovimiento: string;
    cantidad: number;
    unidades: number;
  }>;

  pagos: {
    cantidad: number;
    monto: number;
  };
};
