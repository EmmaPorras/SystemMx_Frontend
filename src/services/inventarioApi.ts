import { apiClient } from "../api/apiClient";

import type {
  PaginacionRespuesta,
  QueryParams,
} from "../api/api.types";

import type {
  LoteInventario,
  LotesQuery,
} from "../components/lotes/lotes.types";

import type {
  MovimientoInventario,
  MovimientosQuery,
} from "../components/movimientos/movimientos.types";

export type LotesProductoQuery = Omit<
  LotesQuery,
  "productoId"
>;

export function obtenerLotesInventarioApi(
  query: LotesQuery = {},
): Promise<PaginacionRespuesta<LoteInventario>> {
  return apiClient.get<
    PaginacionRespuesta<LoteInventario>
  >(
    "/inventario/lotes",
    query as unknown as QueryParams,
  );
}

export function obtenerLotesPorProductoApi(
  productoId: number,
  query: LotesProductoQuery = {},
): Promise<PaginacionRespuesta<LoteInventario>> {
  return apiClient.get<
    PaginacionRespuesta<LoteInventario>
  >(
    `/inventario/productos/${productoId}/lotes`,
    query as unknown as QueryParams,
  );
}

export function obtenerLoteInventarioApi(
  id: number,
): Promise<LoteInventario> {
  return apiClient.get<LoteInventario>(
    `/inventario/lotes/${id}`,
  );
}

export function obtenerMovimientosInventarioApi(
  query: MovimientosQuery = {},
): Promise<PaginacionRespuesta<MovimientoInventario>> {
  return apiClient.get<
    PaginacionRespuesta<MovimientoInventario>
  >(
    "/inventario/movimientos",
    query as unknown as QueryParams,
  );
}

export function obtenerMovimientoInventarioApi(
  id: number,
): Promise<MovimientoInventario> {
  return apiClient.get<MovimientoInventario>(
    `/inventario/movimientos/${id}`,
  );
}
