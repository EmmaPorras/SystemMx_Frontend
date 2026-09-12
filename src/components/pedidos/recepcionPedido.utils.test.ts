import {
  describe,
  expect,
  it,
} from "vitest";

import {
  obtenerCantidadPendiente,
  puedeCancelarPedido,
  puedeRecibirPedido,
} from "./recepcionPedido.utils";

import type {
  PedidoCompra,
  PedidoDetalle,
} from "./pedidos.types";

function crearDetalle(
  overrides: Partial<PedidoDetalle> = {},
): PedidoDetalle {
  return {
    idTemporal: "tmp-1",
    loteId: 10,
    productoNombre: "Filtro",
    loteCodigo: "L1",
    cantidad: 10,
    cantidadRecibida: 4,
    cantidadDisponible: 4,
    costoUnitarioOrigen: 1000,
    costoUnitarioReal: 1000,
    precioVentaRecomendado: 2000,
    estadoLote: "EN_PROCESO",
    ...overrides,
  };
}

function crearPedido(
  overrides: Partial<PedidoCompra> = {},
): PedidoCompra {
  return {
    id: 1,
    numeroPedido: "25",
    fecha: "2026-09-11",
    origen: "Costa Rica",
    proveedorId: 1,
    proveedorNombre: "Proveedor",
    monedaCompra: "CRC",
    tipoCambio: "1",
    inversionTotal: 10000,
    observaciones: "",
    estado: "EN_TRANSITO",
    detalles: [crearDetalle()],
    ...overrides,
  };
}

describe("recepción de pedidos", () => {
  it("calcula únicamente la cantidad pendiente", () => {
    expect(
      obtenerCantidadPendiente(
        crearDetalle({
          cantidad: 10,
          cantidadRecibida: 4,
        }),
      ),
    ).toBe(6);
  });

  it("permite recepción cuando existe mercancía pendiente", () => {
    expect(
      puedeRecibirPedido(crearPedido()),
    ).toBe(true);
  });

  it("impide recepción de pedidos recibidos o cancelados", () => {
    expect(
      puedeRecibirPedido(
        crearPedido({
          estado: "RECIBIDO",
        }),
      ),
    ).toBe(false);

    expect(
      puedeRecibirPedido(
        crearPedido({
          estado: "CANCELADO",
        }),
      ),
    ).toBe(false);
  });

  it("permite cancelar un pedido sin mercancía recibida", () => {
    expect(
      puedeCancelarPedido(
        crearPedido({
          estado: "REGISTRADO",
          detalles: [
            crearDetalle({
              cantidadRecibida: 0,
            }),
          ],
        }),
      ),
    ).toBe(true);
  });

  it("impide cancelar si ya existe mercancía recibida", () => {
    expect(
      puedeCancelarPedido(
        crearPedido({
          estado: "EN_TRANSITO",
          detalles: [
            crearDetalle({
              cantidadRecibida: 1,
            }),
          ],
        }),
      ),
    ).toBe(false);
  });

  it("impide cancelar pedidos recibidos o ya cancelados", () => {
    expect(
      puedeCancelarPedido(
        crearPedido({
          estado: "RECIBIDO",
        }),
      ),
    ).toBe(false);

    expect(
      puedeCancelarPedido(
        crearPedido({
          estado: "CANCELADO",
        }),
      ),
    ).toBe(false);
  });
});
