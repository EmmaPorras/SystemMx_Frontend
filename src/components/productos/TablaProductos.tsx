import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { EstadoProducto, Producto } from "./productos.types";

type TablaProductosProps = {
  productos: Producto[];
  onSelect: (producto: Producto) => void;
};

function getEstadoProductoLabel(estado: EstadoProducto) {
  if (estado === "DISPONIBLE" || estado === "ACTIVO") {
    return "Disponible";
  }

  if (estado === "EN_PROCESO") {
    return "En proceso";
  }

  return "Agotado";
}

function getEstadoProductoVariant(estado: EstadoProducto) {
  if (estado === "DISPONIBLE" || estado === "ACTIVO") {
    return "success";
  }

  if (estado === "EN_PROCESO") {
    return "warning";
  }

  return "neutral";
}

function TablaProductos({ productos, onSelect }: TablaProductosProps) {
  return (
    <DataTableShell
      data={productos}
      emptyMessage="Todavía no hay productos registrados desde pedidos."
      getRowKey={(row) => row.productoKey ?? `${row.id}-${row.nombre}`}
      columns={[
        {
          key: "id",
          header: "ID",
          render: (row) => row.displayId ?? "—",
        },
        {
          key: "nombre",
          header: "Nombre",
          render: (row) => (
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="text-left font-semibold text-slate-900 underline-offset-4 transition hover:text-slate-600 hover:underline"
            >
              {row.nombre}
            </button>
          ),
        },
        {
          key: "precio",
          header: "Precio de venta",
          render: (row) =>
            formatCurrency(row.precioVenta ?? row.precioReferencia ?? 0),
        },
        {
          key: "stock",
          header: "Stock disponible",
          render: (row) => row.stockActual ?? 0,
        },
        {
          key: "proveedor",
          header: "Proveedor",
          render: (row) => row.proveedorNombre || "—",
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={getEstadoProductoLabel(row.estado)}
              variant={getEstadoProductoVariant(row.estado)}
            />
          ),
        },
      ]}
    />
  );
}

export default TablaProductos;