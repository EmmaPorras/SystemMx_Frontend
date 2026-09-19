import { apiClient } from "../api/apiClient";

import type {
  EstadoTarifaIVA,
  TarifaIVA,
} from "../components/tarifas-iva/tarifas-iva.types";

type TarifaIVABackend = {
  idTarifaIva: number;
  codigo: string;
  porcentaje: number | string;
  descripcion: string;
  estado?: EstadoTarifaIVA | null;
};

function mapTarifaFromBackend(item: TarifaIVABackend): TarifaIVA {
  return {
    id: item.idTarifaIva,
    codigo: item.codigo ?? "",
    porcentaje: Number(item.porcentaje ?? 0),
    descripcion: item.descripcion ?? "",
    estado: item.estado === "INACTIVA" ? "INACTIVA" : "ACTIVA",
  };
}

function mapTarifaToBackend(tarifa: TarifaIVA) {
  return {
    codigo: tarifa.codigo,
    porcentaje: tarifa.porcentaje,
    descripcion: tarifa.descripcion,
    estado: tarifa.estado,
  };
}

export async function obtenerTarifasIva(): Promise<TarifaIVA[]> {
  const data = await apiClient.get<TarifaIVABackend[]>("/tarifas-iva");

  return data.map(mapTarifaFromBackend);
}

export async function crearTarifaIva(
  tarifa: TarifaIVA,
): Promise<TarifaIVA> {
  const data = await apiClient.post<
    TarifaIVABackend,
    ReturnType<typeof mapTarifaToBackend>
  >("/tarifas-iva", mapTarifaToBackend(tarifa));

  return mapTarifaFromBackend(data);
}

export async function actualizarTarifaIvaApi(
  id: number,
  tarifa: TarifaIVA,
): Promise<TarifaIVA> {
  const data = await apiClient.patch<
    TarifaIVABackend,
    ReturnType<typeof mapTarifaToBackend>
  >(`/tarifas-iva/${id}`, mapTarifaToBackend(tarifa));

  return mapTarifaFromBackend(data);
}

export async function eliminarTarifaIvaApi(id: number): Promise<void> {
  await apiClient.delete<unknown>(`/tarifas-iva/${id}`);
}