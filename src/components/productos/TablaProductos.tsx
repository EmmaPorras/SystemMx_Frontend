import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { Producto } from "./productos.types";

type TablaProductosProps = {
  productos: Producto[];
};

function TablaProductos({ productos }: TablaProductosProps) {
  return (
    <DataTableShell
      data={productos}
      emptyMessage="Todavía no hay productos registrados."
      columns={[
        { key: "id", header: "ID", render: (row) => row.id },
        { key: "nombre", header: "Nombre", render: (row) => row.nombre },
        { key: "categoria", header: "Categoría", render: (row) => row.categoria },
        {
          key: "precio",
          header: "Precio de referencia",
          render: (row) => formatCurrency(row.precioReferencia),
        },
        { key: "stock", header: "Stock total", render: (row) => row.stockTotal },
        { key: "proveedor", header: "Proveedor", render: (row) => row.proveedorNombre },
        { key: "iva", header: "Tarifa IVA", render: (row) => row.tarifaIvaDescripcion },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={row.estado === "ACTIVO" ? "success" : "warning"}
            />
          ),
        },
      ]}
    />
  );
}

export default TablaProductos;
