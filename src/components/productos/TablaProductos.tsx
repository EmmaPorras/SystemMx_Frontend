import {
  Eye,
} from "lucide-react";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency } from "../common/formatters";

import type { Producto } from "./productos.types";

type TablaProductosProps = {
  productos: Producto[];
  onView: (producto: Producto) => void;
};

function TablaProductos({
  productos,
  onView,
}: TablaProductosProps) {
  return (
    <DataTableShell
      data={productos}
      emptyMessage="No hay productos registrados."
      getRowKey={(row) => row.idProducto}
      columns={[
        {
          key: "producto",
          header: "Producto",
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {row.nombre}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {row.sku?.trim() || "Sin SKU"}
              </p>
            </div>
          ),
        },
        {
          key: "categoria",
          header: "Categoría",
          render: (row) =>
            row.categoria?.nombre ?? "—",
        },
        {
          key: "marca",
          header: "Marca / variante",
          render: (row) => (
            <div>
              <p>
                {row.marca?.trim() || "—"}
              </p>

              {row.variante?.trim() ? (
                <p className="text-xs text-zinc-500">
                  {row.variante}
                </p>
              ) : null}
            </div>
          ),
        },
        {
          key: "precio",
          header: "Precio sugerido",
          render: (row) =>
            formatCurrency(
              row.precioVentaSugeridoSinIva,
            ),
        },
        {
          key: "stock",
          header: "Stock",
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {row.stockActual}
              </p>

              <p className="text-xs text-zinc-500">
                Mínimo: {row.stockMinimo}
              </p>
            </div>
          ),
        },
        {
          key: "iva",
          header: "IVA",
          render: (row) =>
            row.tarifaIva
              ? `${row.tarifaIva.codigo} · ${row.tarifaIva.porcentaje}%`
              : "—",
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={
                row.activo
                  ? "ACTIVO"
                  : "INACTIVO"
              }
              variant={
                row.activo
                  ? "success"
                  : "neutral"
              }
            />
          ),
        },
      ]}
      actions={(row) => (
        <TableActionButton
          label="Ver detalle"
          variant="view"
          icon={<Eye size={17} />}
          onClick={() => onView(row)}
        />
      )}
    />
  );
}

export default TablaProductos;