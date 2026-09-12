import type {
  PedidoCompra,
  PedidoDetalle,
} from "./pedidos.types";

export function obtenerCantidadPendiente(
  detalle: PedidoDetalle,
): number {
  return Math.max(
    0,
    detalle.cantidad - (detalle.cantidadRecibida ?? 0),
  );
}

export function puedeRecibirPedido(
  pedido: PedidoCompra,
): boolean {
  if (
    pedido.estado !== "REGISTRADO" &&
    pedido.estado !== "EN_TRANSITO"
  ) {
    return false;
  }

  return pedido.detalles.some(
    (detalle) =>
      detalle.loteId !== undefined &&
      obtenerCantidadPendiente(detalle) > 0,
  );
}

export function puedeCancelarPedido(
  pedido: PedidoCompra,
): boolean {
  if (
    pedido.estado !== "REGISTRADO" &&
    pedido.estado !== "EN_TRANSITO"
  ) {
    return false;
  }

  return pedido.detalles.every(
    (detalle) => (detalle.cantidadRecibida ?? 0) === 0,
  );
}
