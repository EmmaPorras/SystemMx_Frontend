export type TipoMovimientoInventario =
  | "ENTRADA_COMPRA"
  | "SALIDA_VENTA"
  | "REINGRESO_ANULACION_VENTA";

export type ReferenciaMovimientoInventario =
  | "PEDIDO"
  | "VENTA";

export type MovimientoInventario = {
  idMovimiento: number;
  fechaMovimiento: string;

  tipoMovimiento: TipoMovimientoInventario;

  cantidad: number;

  referenciaTipo: ReferenciaMovimientoInventario;
  referenciaId: number;

  idUsuario: number | null;
  usuario: string | null;

  motivo: string;
  observaciones: string | null;

  costoUnitario: number;
  totalMovimiento: number;

  producto: {
    idProducto: number;
    nombre: string;
  } | null;

  lote: {
    idLote: number;
    codigoLote: string;
  } | null;
};

export type MovimientosQuery = {
  productoId?: number;
  loteId?: number;

  tipoMovimiento?: TipoMovimientoInventario;

  referenciaTipo?: ReferenciaMovimientoInventario;
  referenciaId?: number;

  desde?: string;
  hasta?: string;

  usuarioId?: number;

  pagina?: number;
  limite?: number;
};
