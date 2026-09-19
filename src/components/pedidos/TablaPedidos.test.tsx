import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import TablaPedidos from "./TablaPedidos";

import type {
  PedidoCompra,
} from "./pedidos.types";

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
    inversionTotal: 5000,
    observaciones: "",
    estado: "REGISTRADO",
    detalles: [
      {
        idTemporal: "tmp-1",
        loteId: 10,
        productoNombre: "Filtro",
        loteCodigo: "L1",
        cantidad: 5,
        cantidadRecibida: 0,
        cantidadDisponible: 0,
        costoUnitarioOrigen: 1000,
        costoUnitarioReal: 1000,
        precioVentaRecomendado: 2000,
        estadoLote: "EN_PROCESO",
      },
    ],
    ...overrides,
  };
}

function renderTabla(
  pedido: PedidoCompra,
) {
  render(
    <TablaPedidos
      pedidos={[pedido]}
      onView={vi.fn()}
      onEdit={vi.fn()}
      onReceive={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
}

describe("TablaPedidos", () => {
  it("permite editar, recibir y cancelar un pedido registrado sin recepción", () => {
    renderTabla(
      crearPedido({
        estado: "REGISTRADO",
      }),
    );

    expect(
      screen.getByLabelText(
        "Editar pedido",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Recibir mercancía",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Cancelar pedido",
      ),
    ).toBeInTheDocument();
  });

  it("permite recibir pero no cancelar si ya existe recepción parcial", () => {
    renderTabla(
      crearPedido({
        estado: "EN_TRANSITO",
        detalles: [
          {
            idTemporal: "tmp-1",
            loteId: 10,
            productoNombre: "Filtro",
            loteCodigo: "L1",
            cantidad: 5,
            cantidadRecibida: 2,
            cantidadDisponible: 2,
            costoUnitarioOrigen: 1000,
            costoUnitarioReal: 1000,
            precioVentaRecomendado: 2000,
            estadoLote: "EN_STOCK",
          },
        ],
      }),
    );

    expect(
      screen.getByLabelText(
        "Editar pedido",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Recibir mercancía",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        "Cancelar pedido",
      ),
    ).not.toBeInTheDocument();
  });

  it("no muestra acciones de modificación para un pedido recibido", () => {
    renderTabla(
      crearPedido({
        estado: "RECIBIDO",
      }),
    );

    expect(
      screen.queryByLabelText(
        "Editar pedido",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        "Recibir mercancía",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        "Cancelar pedido",
      ),
    ).not.toBeInTheDocument();
  });

  it("no muestra acciones de modificación para un pedido cancelado", () => {
    renderTabla(
      crearPedido({
        estado: "CANCELADO",
      }),
    );

    expect(
      screen.queryByLabelText(
        "Editar pedido",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        "Recibir mercancía",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        "Cancelar pedido",
      ),
    ).not.toBeInTheDocument();
  });
});
