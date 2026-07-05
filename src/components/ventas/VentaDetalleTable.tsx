import DataTableShell from "../common/DataTableShell";
import { formatCurrency } from "../common/formatters";
import type { VentaDetalle } from "./ventas.types";

type VentaDetalleTableProps = {
  detalles: VentaDetalle[];
};

function VentaDetalleTable({ detalles }: VentaDetalleTableProps) {
  return (
    <DataTableShell
      data={detalles}
      emptyMessage="Todavía no hay productos agregados a la venta."
      columns={[
        { key: "producto", header: "Producto", render: (row) => row.productoNombre },
        { key: "cantidad", header: "Cantidad", render: (row) => row.cantidad },
        {
          key: "precio",
          header: "Precio sin IVA",
          render: (row) => formatCurrency(row.precioUnitarioSinIva),
        },
        { key: "iva", header: "IVA", render: (row) => `${row.tarifaPorcentaje}%` },
        {
          key: "subtotal",
          header: "Subtotal",
          render: (row) => formatCurrency(row.subtotal),
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

export default VentaDetalleTable;
