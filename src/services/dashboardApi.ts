import { apiClient } from "../api/apiClient";

import type { ResumenDashboard } from "../components/home/dashboard.types";

export function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  return apiClient.get<ResumenDashboard>("/reportes/resumen");
}
