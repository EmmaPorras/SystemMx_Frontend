import type { PedidoCompra } from "../components/pedidos/pedidos.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
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

function mapPedidoToBackend(pedido: PedidoCompra) {
  return {
    numeroPedido: Number(pedido.numeroPedido),
    fecha: pedido.fecha,
    origen: pedido.origen,
    proveedorId: pedido.proveedorId,
    monedaCompra: pedido.monedaCompra,
    tipoCambio: Number(pedido.tipoCambio),
    estado: pedido.estado,
    observaciones: pedido.observaciones,
    detalles: pedido.detalles.map((detalle) => ({
      productoNombre: detalle.productoNombre,
      loteCodigo: detalle.loteCodigo,
      cantidad: detalle.cantidad,
      costoUnitarioOrigen: detalle.costoUnitarioOrigen,
      precioVentaRecomendado: detalle.precioVentaRecomendado,
      estadoLote: detalle.estadoLote,
    })),
  };
}

export async function obtenerPedidos(): Promise<PedidoCompra[]> {
  const response = await fetch(`${API_URL}/pedidos`);
  return parseResponse<PedidoCompra[]>(response);
}

export async function crearPedidoApi(
  pedido: PedidoCompra,
): Promise<PedidoCompra> {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapPedidoToBackend(pedido)),
  });

  return parseResponse<PedidoCompra>(response);
}

export async function actualizarPedidoApi(
  id: number,
  pedido: PedidoCompra,
): Promise<PedidoCompra> {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapPedidoToBackend(pedido)),
  });

  return parseResponse<PedidoCompra>(response);
}

export async function eliminarPedidoApi(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: "DELETE",
  });

  await parseResponse<{ message: string; id: number }>(response);
}