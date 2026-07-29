export type MedioPagoVenta =
  | "EFECTIVO"
  | "SINPE"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "MIXTO"
  | "OTRO";

export type EstadoPagoVenta = "PAGADA" | "PARCIAL" | "EN_DEUDA" | "ANULADA";

export type EstadoVenta = "REGISTRADA" | "ANULADA";

export type TipoTarifaVenta = "IVA" | "EXENTO" | "ESPECIAL";

export type ModoDescuentoLote = "FIFO" | "MANUAL";

export type InventarioDisponibleVenta = {
  loteId: number;
  productoId: number;
  productoNombre: string;
  loteCodigo: string;
  pedidoId: number;
  numeroPedido: string;
  proveedorNombre: string;
  cantidadDisponible: number;
  costoUnitarioReal: number;
  precioVentaRecomendado: number;
  estadoLote: string;
  fechaEntrada?: string | null;
};

export type VentaDetalle = {
  id: number;
  productoId: number;
  productoNombre: string;
  loteId: number;
  loteCodigo: string;
  pedidoId?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;
  baseImponible: number;
  tipoTarifa: TipoTarifaVenta;
  idTarifaIva?: number | null;
  porcentajeIva: number;
  iva: number;
  totalLinea: number;
  costoUnitarioReal: number;
  costoTotal: number;
  gananciaBruta: number;
  modoDescuentoLote: ModoDescuentoLote;
  detalle: string;
};

export type Venta = {
  id: number;
  numeroVenta: string;
  fechaVenta: string;
  clienteNombre: string;
  medioPago: MedioPagoVenta;
  estadoPago: EstadoPagoVenta;
  estadoVenta: EstadoVenta;
  subtotal: number;
  descuentoTotal: number;
  ivaTotal: number;
  totalVenta: number;
  montoPagado: number;
  saldoPendiente: number;
  costoTotal: number;
  gananciaBruta: number;
  margenBruto: number;
  fechaEntrega?: string | null;
  fechaVencimientoPago?: string | null;
  observaciones: string;
  enPapelera: boolean;
  detalles: VentaDetalle[];
};

export type VentaDetalleForm = {
  idTemporal: string;
  productoId: string;
  productoNombre: string;
  loteId: string;
  loteDescripcion: string;
  cantidad: string;
  precioUnitario: string;
  descuento: string;
  tipoTarifa: TipoTarifaVenta;
  porcentajeIva: string;
  modoDescuentoLote: ModoDescuentoLote;
  detalle: string;
};

export type CrearVentaDetallePayload = {
  productoId: number;
  loteId?: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  tipoTarifa: TipoTarifaVenta;
  porcentajeIva?: number;
  modoDescuentoLote?: ModoDescuentoLote;
  detalle?: string;
};

export type CrearVentaPayload = {
  numeroVenta: number;
  fechaVenta: string;
  clienteNombre?: string;
  medioPago: MedioPagoVenta;
  montoPagado?: number;
  fechaEntrega?: string;
  fechaVencimientoPago?: string;
  observaciones?: string;
  detalles: CrearVentaDetallePayload[];
};