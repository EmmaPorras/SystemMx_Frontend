export type EstadoPedidoCompra = "REGISTRADO" | "EN_TRANSITO" | "RECIBIDO";

export type PedidoDetalle = {
  idTemporal: string;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  costoUnitario: number;
  tarifaPorcentaje: number;
  subtotal: number;
  impuesto: number;
  total: number;
};

export type PedidoCompra = {
  id: number;
  numeroPedido: string;
  fecha: string;
  origen: string;
  proveedorId: number;
  proveedorNombre: string;
  inversionTotal: number;
  observaciones: string;
  estado: EstadoPedidoCompra;
  detalles: PedidoDetalle[];
};
