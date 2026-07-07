import type {
  EstadoTarifaIVA,
  TarifaIVA,
} from "../components/tarifas-iva/tarifas-iva.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

type TarifaIVABackend = {
  idTarifaIva: number;
  codigo: string;
  porcentaje: number | string;
  descripcion: string;
  estado?: EstadoTarifaIVA | null;
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
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

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return typeof data === "object" && data !== null && "message" in data;
}

function getApiErrorMessage(data: unknown): string {
  if (!isApiErrorResponse(data)) {
    return "Ocurrió un error inesperado.";
  }

  if (Array.isArray(data.message)) {
    return data.message.join(" ");
  }

  return data.message || data.error || "Ocurrió un error inesperado.";
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data));
  }

  return data as T;
}

export async function obtenerTarifasIva(): Promise<TarifaIVA[]> {
  const response = await fetch(`${API_URL}/tarifas-iva`);
  const data = await parseResponse<TarifaIVABackend[]>(response);

  return data.map(mapTarifaFromBackend);
}

export async function crearTarifaIva(tarifa: TarifaIVA): Promise<TarifaIVA> {
  const response = await fetch(`${API_URL}/tarifas-iva`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapTarifaToBackend(tarifa)),
  });

  const data = await parseResponse<TarifaIVABackend>(response);

  return mapTarifaFromBackend(data);
}

export async function actualizarTarifaIvaApi(
  id: number,
  tarifa: TarifaIVA,
): Promise<TarifaIVA> {
  const response = await fetch(`${API_URL}/tarifas-iva/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapTarifaToBackend(tarifa)),
  });

  const data = await parseResponse<TarifaIVABackend>(response);

  return mapTarifaFromBackend(data);
}

export async function eliminarTarifaIvaApi(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/tarifas-iva/${id}`, {
    method: "DELETE",
  });

  await parseResponse<{ message: string; id: number }>(response);
}