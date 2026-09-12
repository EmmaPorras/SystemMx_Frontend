export type ResumenDashboard = {
  periodo: {
    fechaDesde: string | null;
    fechaHasta: string | null;
  };

  ventas: {
    cantidad: number;
    total: number;
    costo: number;
    gananciaBruta: number;
    margenBrutoPorcentaje: number;
    montoPagado: number;
    saldoPendiente: number;
  };

  inventario: {
    lotesConStock: number;
    unidadesDisponibles: number;
    valorCosto: number;
  };

  cuentasPorCobrar: {
    ventasConSaldo: number;
    saldo: number;
  };

  pedidos: {
    registrados: number;
    enTransito: number;
    recibidos: number;
    cancelados: number;
    pendientes: number;
    total: number;
  };
};
