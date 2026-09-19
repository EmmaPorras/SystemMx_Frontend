export type CategoriaProducto = {
  idCategoria: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
};

export type TarifaIvaProducto = {
  idTarifaIva: number;
  codigo: string;
  porcentaje: number;
  descripcion?: string | null;
  activo: boolean;
};

export type Producto = {
  idProducto: number;

  idCategoria?: number | null;
  idTarifaIva?: number | null;

  nombre: string;
  descripcion?: string | null;
  sku?: string | null;

  precioVentaSugeridoSinIva: number;
  stockMinimo: number;
  activo: boolean;

  marca?: string | null;
  variante?: string | null;
  imagenUrl?: string | null;

  precioVentaEstandarConIva?: number | null;
  costoReferencia?: number | null;
  observaciones?: string | null;

  createdAt?: string;
  updatedAt?: string;

  categoria?: CategoriaProducto | null;
  tarifaIva?: TarifaIvaProducto | null;

  stockActual: number;
};