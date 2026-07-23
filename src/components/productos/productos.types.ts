import type {
  EstadoLoteProducto,
  MonedaCompra,
} from "../pedidos/pedidos.types";

export type EstadoProducto =
  | "DISPONIBLE"
  | "EN_PROCESO"
  | "AGOTADO"
  | "ACTIVO"
  | "INACTIVO";

export type ProductoLoteDetalle = {
  idTemporal: string;
  pedidoId: number;
  numeroPedido: string;
  fecha: string;
  origen: string;
  proveedorId: number;
  proveedorNombre: string;
  monedaCompra: MonedaCompra;
  tipoCambio: string;
  loteCodigo: string;
  cantidad: number;
  cantidadDisponible: number;
  costoUnitarioOrigen: number;
  costoUnitarioReal: number;
  precioVentaRecomendado: number;
  estadoLote: EstadoLoteProducto;
};

export type Producto = {
  productoKey?: string;

  // ID real del producto si viene desde backend.
  id: number;

  // ID visual para tabla: 1, 2, 3...
  displayId?: number;

  nombre: string;

  // Campos legacy para no romper archivos viejos si aún existen.
  categoria: string;
  precioReferencia: number;
  stockTotal: number;
  proveedorId: number;
  proveedorNombre: string;
  tarifaIvaId: number;
  tarifaIvaDescripcion: string;

  // Nueva vista de Productos.
  precioVenta?: number;

  // Stock disponible para venta.
  // No incluye lotes EN_PROCESO.
  stockActual?: number;

  // Stock comprado pero pendiente de llegada.
  stockEnProceso?: number;

  proveedores?: string[];
  estado: EstadoProducto;
  lotes?: ProductoLoteDetalle[];
  ultimaCompra?: string;
  costoMinimoReal?: number;
  costoMaximoReal?: number;
};