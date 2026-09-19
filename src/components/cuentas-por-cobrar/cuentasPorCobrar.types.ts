export type CuentaPorCobrarDetalle = {
  idVenta: number;
  numeroVenta: string;

  fechaVenta: string;

  cliente: string;

  estadoPago: string;

  totalVenta: number;
  montoPagado: number;
  saldoPendiente: number;

  fechaVencimientoPago:
    | string
    | null;
};

export type CuentasPorCobrarResumenResponse = {
  resumen: {
    ventasConSaldo: number;
    totalPorCobrar: number;
  };

  detalle: CuentaPorCobrarDetalle[];
};

export type ResumenVencimiento = {
  cantidad: number;
  saldo: number;
};

export type VencimientosCuentasPorCobrarResponse = {
  fechaCorte: string;

  sinVencimiento:
    ResumenVencimiento;

  vencidas:
    ResumenVencimiento;

  venceEnFechaCorte:
    ResumenVencimiento;

  porVencer:
    ResumenVencimiento;
};
