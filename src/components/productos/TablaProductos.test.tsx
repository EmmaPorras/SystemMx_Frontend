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

import TablaProductos from "./TablaProductos";

describe("TablaProductos", () => {
  it("solo ofrece la acción de consultar detalle", () => {
    render(
      <TablaProductos
        productos={[
          {
            idProducto: 1,
            nombre: "Filtro",
            sku: "FIL-001",
            precioVentaSugeridoSinIva: 5000,
            stockMinimo: 2,
            activo: true,
            stockActual: 8,
            categoria: {
              idCategoria: 1,
              nombre: "Repuestos",
              activo: true,
            },
            tarifaIva: null,
          },
        ]}
        onView={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(
        "Ver detalle",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        /editar producto/i,
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        /eliminar producto/i,
      ),
    ).not.toBeInTheDocument();
  });
});
