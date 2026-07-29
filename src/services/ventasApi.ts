import type {
  CrearVentaPayload,
  InventarioDisponibleVenta,
  Venta,
} from "../components/ventas/ventas.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

type ObtenerVentasFilters = {
  papelera?: boolean;
  deudores?: boolean;
};

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

function buildQueryParams(filters?: ObtenerVentasFilters) {
  const params = new URLSearchParams();

  if (filters?.papelera) {
    params.set("papelera", "true");
  }

  if (filters?.deudores) {
    params.set("deudores", "true");
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function obtenerVentas(
  filters?: ObtenerVentasFilters,
): Promise<Venta[]> {
  const response = await fetch(`${API_URL}/ventas${buildQueryParams(filters)}`);
  return parseResponse<Venta[]>(response);
}

export async function obtenerInventarioDisponibleVenta(): Promise<
  InventarioDisponibleVenta[]
> {
  const response = await fetch(`${API_URL}/ventas/inventario-disponible`);
  return parseResponse<InventarioDisponibleVenta[]>(response);
}

export async function crearVentaApi(
  venta: CrearVentaPayload,
): Promise<Venta> {
  const response = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(venta),
  });

  return parseResponse<Venta>(response);
}

export async function actualizarPagoVentaApi(
  id: number,
  montoPagado: number,
): Promise<Venta> {
  const response = await fetch(`${API_URL}/ventas/${id}/pago`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ montoPagado }),
  });

  return parseResponse<Venta>(response);
}

export async function enviarVentaAPapeleraApi(id: number): Promise<Venta> {
  const response = await fetch(`${API_URL}/ventas/${id}/papelera`, {
    method: "PATCH",
  });

  return parseResponse<Venta>(response);
}

export async function restaurarVentaApi(id: number): Promise<Venta> {
  const response = await fetch(`${API_URL}/ventas/${id}/restaurar`, {
    method: "PATCH",
  });

  return parseResponse<Venta>(response);
}

export async function anularVentaApi(id: number): Promise<Venta> {
  const response = await fetch(`${API_URL}/ventas/${id}/anular`, {
    method: "PATCH",
  });

  return parseResponse<Venta>(response);
}