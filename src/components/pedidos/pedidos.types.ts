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

export type ProductoSugerido = {
  id: number;
  nombre: string;
  nombreBusqueda: string;
  precioVentaSugerido: number;
  activo: boolean;
};

export type PedidoDetalle = {
  idTemporal: string;
  productoId?: number;
  productoNombre: string;
  loteCodigo: string;
  cantidad: number;

  // Cantidad recibida total del lote.
  cantidadRecibida?: number;

  // Pendiente por llegar.
  cantidadPendiente?: number;

  // Disponible para vender.
  cantidadDisponible: number;

  costoUnitarioOrigen: number;
  costoUnitarioReal: number;
  precioVentaRecomendado: number;
  estadoLote: EstadoLoteProducto;
};

export type PedidoDetalleForm = {
  productoId?: number;
  productoNombre: string;
  loteCodigo: string;
  cantidad: string;

  // Cantidad que llegó en esta acción del formulario.
  cantidadRecibida: string;

  // Cantidad ya recibida antes de esta acción. Es interna del formulario.
  cantidadRecibidaPrevia: string;

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