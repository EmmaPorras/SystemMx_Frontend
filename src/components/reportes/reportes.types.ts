export type ReporteProductoTop = {
  nombre: string;
  cantidad: number;
};

export type ReporteRentabilidadPedido = {
  pedidoNumero: string;
  inversion: number;
  ventaGenerada: number;
  utilidad: number;
};

export type ReporteResumen = {
  ventasDelMes: number;
  inversionPendiente: number;
  utilidadEstimada: number;
  productosBajaRotacion: number;
  productosMasVendidos: ReporteProductoTop[];
  rentabilidadPorPedido: ReporteRentabilidadPedido[];
};
