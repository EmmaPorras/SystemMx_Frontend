import { apiClient } from "../api/apiClient";
import type { QueryParams } from "../api/api.types";

import type {
  CuentasPorCobrarResumenResponse,
  VencimientosCuentasPorCobrarResponse,
} from "../components/cuentas-por-cobrar/cuentasPorCobrar.types";

export function obtenerCuentasPorCobrarApi(): Promise<CuentasPorCobrarResumenResponse> {
  return apiClient.get<CuentasPorCobrarResumenResponse>(
    "/reportes/cuentas-por-cobrar",
  );
}

export function obtenerVencimientosCuentasPorCobrarApi(
  fechaCorte: string,
): Promise<VencimientosCuentasPorCobrarResponse> {
  return apiClient.get<VencimientosCuentasPorCobrarResponse>(
    "/reportes/cuentas-por-cobrar/vencimientos",
    {
      fechaCorte,
    } as unknown as QueryParams,
  );
}
