import { apiClient } from "../api/apiClient";

import type {
  EvolucionVentasItem,
  ResumenDashboard,
  VentasPorProductoItem,
} from "../components/home/dashboard.types";

export type PeriodoDashboard = {
  fechaDesde?: string;
  fechaHasta?: string;
};

function construirQuery(
  periodo: PeriodoDashboard = {},
) {
  const params = new URLSearchParams();

  if (periodo.fechaDesde) {
    params.set(
      "fechaDesde",
      periodo.fechaDesde,
    );
  }

  if (periodo.fechaHasta) {
    params.set(
      "fechaHasta",
      periodo.fechaHasta,
    );
  }

  return params.toString();
}

export function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  return apiClient.get<ResumenDashboard>(
    "/reportes/resumen",
  );
}

export function obtenerEvolucionVentas(
  periodo: PeriodoDashboard = {},
): Promise<EvolucionVentasItem[]> {
  const query =
    construirQuery(periodo);

  const url = query
    ? `/reportes/ventas/evolucion?${query}`
    : "/reportes/ventas/evolucion";

  return apiClient.get<EvolucionVentasItem[]>(
    url,
  );
}

export function obtenerVentasPorProducto(
  periodo: PeriodoDashboard = {},
): Promise<VentasPorProductoItem[]> {
  const query =
    construirQuery(periodo);

  const url = query
    ? `/reportes/ventas/productos?${query}`
    : "/reportes/ventas/productos";

  return apiClient.get<VentasPorProductoItem[]>(
    url,
  );
}