export type EstadoPedidoCompra =
  | "REGISTRADO"
  | "EN_TRANSITO"
  | "RECIBIDO"
  | "CANCELADO";

export type EstadoLoteProducto =
  | "EN_PROCESO"
  | "EN_STOCK"
  | "VENDIDO_PARCIAL"
  | "AGOTADO";

export type MonedaCompra = "CRC" | "USD" | "EUR" | "COP" | "BRL";

export type PedidoDetalle = {
  idTemporal: string;
  productoId?: number;
  productoNombre: string;
  loteCodigo: string;
  cantidad: number;
  cantidadDisponible: number;
  costoUnitarioOrigen: number;
  costoUnitarioReal: number;
  precioVentaRecomendado: number;
  estadoLote: EstadoLoteProducto;
};

export type PedidoDetalleForm = {
  productoNombre: string;
  loteCodigo: string;
  cantidad: string;
  costoUnitarioOrigen: string;
  precioVentaRecomendado: string;
  estadoLote: EstadoLoteProducto;
};

export type PedidoDetalleFormField = keyof PedidoDetalleForm;

export type PedidoDetalleFormErrors = Partial<
  Record<PedidoDetalleFormField, string>
>;

export type PedidoCabeceraFormField =
  | "numeroPedido"
  | "fecha"
  | "origen"
  | "proveedorId"
  | "monedaCompra"
  | "tipoCambio"
  | "observaciones"
  | "estado";

export type PedidoCabeceraFormErrors = Partial<
  Record<PedidoCabeceraFormField, string>
>;

export type PedidoCompra = {
  id: number;
  numeroPedido: string;
  fecha: string;
  fechaRecepcion?: string;
  origen: string;
  proveedorId: number;
  proveedorNombre: string;
  monedaCompra: MonedaCompra;
  tipoCambio: string;
  inversionTotal: number;
  observaciones: string;
  estado: EstadoPedidoCompra;
  detalles: PedidoDetalle[];
};