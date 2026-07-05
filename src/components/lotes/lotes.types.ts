export type EstadoLote = "ACTIVO" | "AGOTADO" | "PENDIENTE";

export type LoteInventario = {
  id: number;
  pedidoNumero: string;
  productoNombre: string;
  cantidadInicial: number;
  stockRestante: number;
  costoUnitario: number;
  fechaIngreso: string;
  estado: EstadoLote;
};
