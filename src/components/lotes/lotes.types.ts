export type EstadoLoteInventario =
  | "EN_PROCESO"
  | "EN_STOCK"
  | "VENDIDO_PARCIAL"
  | "AGOTADO";

export type LoteInventario = {
  idLote: number;
  codigoLote: string;

  idProducto: number;
  idPedido: number;
  idDetallePedido: number | null;

  cantidadInicial: number;
  cantidadRecibida: number;
  cantidadDisponible: number;
  cantidadVendida: number;
  cantidadPendienteRecepcion: number;

  estadoLote: EstadoLoteInventario;

  fechaEntrada: string | null;

  costoUnitarioReal: number;
  precioVentaRecomendado: number;

  producto: {
    idProducto: number;
    nombre: string;
    activo: boolean;
  } | null;

  pedido: {
    idPedido: number;
    numeroPedido: number | string;
    estado: string;
  } | null;
};

export type LotesQuery = {
  productoId?: number;
  pedidoId?: number;
  estadoLote?: EstadoLoteInventario;
  pagina?: number;
  limite?: number;
};
