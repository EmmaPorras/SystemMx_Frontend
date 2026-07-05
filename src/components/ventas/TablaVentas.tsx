import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { Venta } from "./ventas.types";

type TablaVentasProps = {
  ventas: Venta[];
};

function TablaVentas({ ventas }: TablaVentasProps) {
  return (
    <DataTableShell
      data={ventas}
      emptyMessage="Todavía no hay ventas registradas."
      columns={[
        { key: "consecutivo", header: "Consecutivo", render: (row) => row.consecutivo },
        { key: "fecha", header: "Fecha", render: (row) => row.fecha },
        { key: "cliente", header: "Cliente", render: (row) => row.cliente },
        { key: "subtotal", header: "Subtotal", render: (row) => formatCurrency(row.subtotal) },
        { key: "impuesto", header: "Impuesto", render: (row) => formatCurrency(row.impuesto) },
        { key: "total", header: "Total", render: (row) => formatCurrency(row.total) },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={
                row.estado === "COMPLETADA"
                  ? "success"
                  : row.estado === "BORRADOR"
                    ? "warning"
                    : "danger"
              }
            />
          ),
        },
      ]}
    />
  );
}

export default TablaVentas;
