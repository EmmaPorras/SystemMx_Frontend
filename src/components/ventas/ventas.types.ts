export type EstadoVenta = "COMPLETADA" | "ANULADA" | "BORRADOR";

export type VentaDetalle = {
  idTemporal: string;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitarioSinIva: number;
  tarifaPorcentaje: number;
  subtotal: number;
  impuesto: number;
  total: number;
};

export type Venta = {
  id: number;
  consecutivo: string;
  fecha: string;
  cliente: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoVenta;
  detalles: VentaDetalle[];
};
