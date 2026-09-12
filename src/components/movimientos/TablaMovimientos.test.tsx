import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

import TablaMovimientos from "./TablaMovimientos";

describe("TablaMovimientos", () => {
  it("muestra movimientos sin acciones de modificación", () => {
    render(
      <TablaMovimientos
        movimientos={[
          {
            idMovimiento: 1,
            fechaMovimiento:
              "2026-09-11T12:00:00.000Z",

            tipoMovimiento:
              "ENTRADA_COMPRA",

            cantidad: 5,

            referenciaTipo:
              "PEDIDO",

            referenciaId: 20,

            idUsuario: 1,
            usuario: "admin",

            motivo:
              "Recepción de pedido",

            observaciones: null,

            costoUnitario: 1000,
            totalMovimiento: 5000,

            producto: {
              idProducto: 10,
              nombre: "Filtro",
            },

            lote: {
              idLote: 8,
              codigoLote: "L1",
            },
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Filtro"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "ENTRADA COMPRA",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Recepción de pedido",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        /editar movimiento/i,
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        /eliminar movimiento/i,
      ),
    ).not.toBeInTheDocument();
  });
});
