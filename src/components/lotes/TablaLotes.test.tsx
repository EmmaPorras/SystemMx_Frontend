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

import TablaLotes from "./TablaLotes";

describe(
  "TablaLotes",
  () => {
    it(
      "muestra los datos del lote y permite consultar el detalle",
      () => {
        const onView =
          vi.fn();

        render(
          <TablaLotes
            lotes={[
              {
                idLote:
                  1,

                codigoLote:
                  "L1",

                idProducto:
                  10,

                idPedido:
                  5,

                idDetallePedido:
                  7,

                cantidadInicial:
                  10,

                cantidadRecibida:
                  10,

                cantidadDisponible:
                  6,

                cantidadVendida:
                  4,

                cantidadPendienteRecepcion:
                  0,

                estadoLote:
                  "VENDIDO_PARCIAL",

                fechaEntrada:
                  "2026-09-11",

                costoUnitarioReal:
                  1000,

                precioVentaRecomendado:
                  2000,

                producto: {
                  idProducto:
                    10,

                  nombre:
                    "Filtro",

                  activo:
                    true,
                },

                pedido: {
                  idPedido:
                    5,

                  numeroPedido:
                    25,

                  estado:
                    "RECIBIDO",
                },
              },
            ]}
            onView={
              onView
            }
          />,
        );

        expect(
          screen.getByText(
            "Filtro",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "VENDIDO PARCIAL",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            "Ver detalle",
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /editar lote/i,
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /eliminar lote/i,
          ),
        ).not.toBeInTheDocument();
      },
    );
  },
);