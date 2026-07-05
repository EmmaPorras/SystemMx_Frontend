import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { LoteInventario } from "./lotes.types";

type TablaLotesProps = {
  lotes: LoteInventario[];
};

function TablaLotes({ lotes }: TablaLotesProps) {
  return (
    <DataTableShell
      data={lotes}
      emptyMessage="Todavía no hay lotes registrados."
      columns={[
        { key: "id", header: "ID", render: (row) => row.id },
        { key: "pedido", header: "Pedido", render: (row) => row.pedidoNumero },
        { key: "producto", header: "Producto", render: (row) => row.productoNombre },
        { key: "cantidad", header: "Cantidad inicial", render: (row) => row.cantidadInicial },
        { key: "stock", header: "Stock restante", render: (row) => row.stockRestante },
        {
          key: "costo",
          header: "Costo unitario",
          render: (row) => formatCurrency(row.costoUnitario),
        },
        { key: "fecha", header: "Fecha ingreso", render: (row) => row.fechaIngreso },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={
                row.estado === "ACTIVO"
                  ? "success"
                  : row.estado === "PENDIENTE"
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

export default TablaLotes;
