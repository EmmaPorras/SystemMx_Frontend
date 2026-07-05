import type {
  EstadoProveedor,
  MonedaPreferida,
  Proveedor,
} from "../components/proveedores/proveedores.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

type ProveedorBackend = {
  idOrigenCompra: number;
  tipoOrigen: string;
  nombreReferencia: string;
  contacto?: string | null;
  observaciones?: string | null;
  pais?: string | null;
  monedaPreferida?: MonedaPreferida | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  estado?: EstadoProveedor | null;
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function normalizarMonedaPreferida(
  moneda: string | null | undefined,
): MonedaPreferida {
  if (
    moneda === "CRC" ||
    moneda === "USD" ||
    moneda === "EUR" ||
    moneda === "COP" ||
    moneda === "BRL"
  ) {
    return moneda;
  }

  return "CRC";
}

function mapProveedorFromBackend(item: ProveedorBackend): Proveedor {
  return {
    id: item.idOrigenCompra,
    nombre: item.nombreReferencia ?? "",
    telefono: item.telefono ?? "",
    correo: item.correo ?? "",
    direccion: item.direccion ?? "",
    monedaPreferida: normalizarMonedaPreferida(item.monedaPreferida),
    estado: item.estado === "INACTIVO" ? "INACTIVO" : "ACTIVO",
  };
}

function mapProveedorToBackend(proveedor: Proveedor) {
  return {
    tipoOrigen: "Proveedor",
    nombreReferencia: proveedor.nombre,
    telefono: proveedor.telefono,
    correo: proveedor.correo,
    direccion: proveedor.direccion,
    estado: proveedor.estado,
    contacto: proveedor.correo,
    monedaPreferida: proveedor.monedaPreferida,
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

export async function obtenerProveedores(): Promise<Proveedor[]> {
  const response = await fetch(`${API_URL}/proveedores`);
  const data = await parseResponse<ProveedorBackend[]>(response);

  return data.map(mapProveedorFromBackend);
}

export async function crearProveedor(proveedor: Proveedor): Promise<Proveedor> {
  const response = await fetch(`${API_URL}/proveedores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapProveedorToBackend(proveedor)),
  });

  const data = await parseResponse<ProveedorBackend>(response);

  return mapProveedorFromBackend(data);
}

export async function actualizarProveedorApi(
  id: number,
  proveedor: Proveedor,
): Promise<Proveedor> {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapProveedorToBackend(proveedor)),
  });

  const data = await parseResponse<ProveedorBackend>(response);

  return mapProveedorFromBackend(data);
}

export async function eliminarProveedorApi(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    method: "DELETE",
  });

  await parseResponse<{ message: string; id: number }>(response);
}