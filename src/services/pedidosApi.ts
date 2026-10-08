import { apiClient } from "../api/apiClient";

import type {
  PedidoCompra,
  ProductoSugerido,
  RecepcionPedidoPayload,
} from "../components/pedidos/pedidos.types";

function mapPedidoToCreatePayload(pedido: PedidoCompra) {
  return {
    fecha: pedido.fecha,
    origen: pedido.origen,
    proveedorId: pedido.proveedorId,
    monedaCompra: pedido.monedaCompra,
    tipoCambio: Number(pedido.tipoCambio),
    estado:
      pedido.estado === "EN_TRANSITO"
        ? "EN_TRANSITO"
        : "REGISTRADO",
    observaciones:
      pedido.observaciones?.trim() || undefined,

    detalles: pedido.detalles.map((detalle) => ({
      productoId: detalle.productoId,
      productoNombre: detalle.productoNombre.trim(),
      categoriaId: Number(detalle.categoriaId),
      marca: detalle.marca?.trim() || undefined,
      loteCodigo: detalle.loteCodigo,
      cantidad: Number(detalle.cantidad),
      cantidadRecibida: 0,
      costoUnitarioOrigen: Number(detalle.costoUnitarioOrigen),
      precioVentaRecomendado: Number(detalle.precioVentaRecomendado),
      estadoLote: "EN_PROCESO" as const,
    })),
  };
}

function mapPedidoToUpdatePayload(pedido: PedidoCompra) {
  return {
    fecha: pedido.fecha,
    origen: pedido.origen,
    proveedorId: pedido.proveedorId,
    monedaCompra: pedido.monedaCompra,
    tipoCambio: Number(pedido.tipoCambio),
    observaciones:
      pedido.observaciones?.trim() || undefined,
    estado: pedido.estado,
  };
}

type CrearPedidoPayload = ReturnType<typeof mapPedidoToCreatePayload>;
type ActualizarPedidoPayload = ReturnType<typeof mapPedidoToUpdatePayload>;

export function obtenerPedidos(): Promise<PedidoCompra[]> {
  return apiClient.get<PedidoCompra[]>("/pedidos");
}

export function obtenerSiguienteNumeroPedidoApi(): Promise<{
  numeroPedido: number;
}> {
  return apiClient.get<{ numeroPedido: number }>(
    "/pedidos/siguiente-numero",
  );
}

export function obtenerPedidoApi(
  id: number,
): Promise<PedidoCompra> {
  return apiClient.get<PedidoCompra>(
    `/pedidos/${id}`,
  );
}

export function buscarProductosSugeridosApi(
  busqueda: string,
): Promise<ProductoSugerido[]> {
  return apiClient.get<ProductoSugerido[]>(
    "/pedidos/productos-sugeridos",
    { busqueda },
  );
}

export function crearPedidoApi(
  pedido: PedidoCompra,
): Promise<PedidoCompra> {
  return apiClient.post<PedidoCompra, CrearPedidoPayload>(
    "/pedidos",
    mapPedidoToCreatePayload(pedido),
  );
}

export function actualizarPedidoApi(
  id: number,
  pedido: PedidoCompra,
): Promise<PedidoCompra> {
  return apiClient.patch<PedidoCompra, ActualizarPedidoPayload>(
    `/pedidos/${id}`,
    mapPedidoToUpdatePayload(pedido),
  );
}

export function registrarRecepcionPedidoApi(
  id: number,
  payload: RecepcionPedidoPayload,
): Promise<PedidoCompra> {
  return apiClient.patch<
    PedidoCompra,
    RecepcionPedidoPayload
  >(
    `/pedidos/${id}/recepcion`,
    payload,
  );
}

export async function cancelarPedidoApi(id: number): Promise<void> {
  await apiClient.delete<unknown>(`/pedidos/${id}`);
}
