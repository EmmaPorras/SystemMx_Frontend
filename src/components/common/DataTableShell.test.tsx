import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DataTableShell, { type DataTableColumn } from "./DataTableShell";

type SampleItem = {
  id: number;
  nombre: string;
  precio: number;
};

const columns: DataTableColumn<SampleItem>[] = [
  {
    key: "nombre",
    header: "Nombre",
    render: (row) => row.nombre,
  },
  {
    key: "precio",
    header: "Precio",
    render: (row) => `₡${row.precio}`,
  },
];

describe("DataTableShell", () => {
  it("renderiza empty state cuando no hay datos", () => {
    render(
      <DataTableShell
        data={[]}
        columns={columns}
        emptyMessage="No hay productos registrados"
      />
    );

    expect(
      screen.getByText("No hay productos registrados")
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renderiza la tabla con encabezados y filas de datos", () => {
    const data: SampleItem[] = [
      { id: 1, nombre: "Producto A", precio: 1000 },
      { id: 2, nombre: "Producto B", precio: 2500 },
    ];

    render(
      <DataTableShell
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Precio")).toBeInTheDocument();
    expect(screen.getByText("Producto A")).toBeInTheDocument();
    expect(screen.getByText("₡1000")).toBeInTheDocument();
    expect(screen.getByText("Producto B")).toBeInTheDocument();
    expect(screen.getByText("₡2500")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
