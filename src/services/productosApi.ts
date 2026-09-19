import { apiClient } from "../api/apiClient";

import type { Producto } from "../components/productos/productos.types";

export function obtenerProductosApi(): Promise<Producto[]> {
  return apiClient.get<Producto[]>("/productos");
}

export function obtenerProductoApi(
  id: number,
): Promise<Producto> {
  return apiClient.get<Producto>(
    `/productos/${id}`,
  );
}
