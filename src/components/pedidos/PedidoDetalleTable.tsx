import DataTableShell from "../common/DataTableShell";
import { formatCurrency } from "../common/formatters";
import type { PedidoDetalle } from "./pedidos.types";

type PedidoDetalleTableProps = {
  detalles: PedidoDetalle[];
};

function PedidoDetalleTable({ detalles }: PedidoDetalleTableProps) {
  return (
    <DataTableShell
      data={detalles}
      emptyMessage="Todavía no hay artículos agregados al pedido."
      columns={[
        { key: "producto", header: "Producto", render: (row) => row.productoNombre },
        { key: "cantidad", header: "Cantidad", render: (row) => row.cantidad },
        {
          key: "costo",
          header: "Costo unitario",
          render: (row) => formatCurrency(row.costoUnitario),
        },
        {
          key: "subtotal",
          header: "Subtotal",
          render: (row) => formatCurrency(row.subtotal),
        },
        {
          key: "iva",
          header: "IVA",
          render: (row) => `${row.tarifaPorcentaje}%`,
        },
        {
          key: "total",
          header: "Total",
          render: (row) => formatCurrency(row.total),
        },
      ]}
    />
  );
}

export default PedidoDetalleTable;
