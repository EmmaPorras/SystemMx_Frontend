export type EstadoProducto = "ACTIVO" | "INACTIVO";

export type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precioReferencia: number;
  stockTotal: number;
  proveedorId: number;
  proveedorNombre: string;
  tarifaIvaId: number;
  tarifaIvaDescripcion: string;
  estado: EstadoProducto;
};
