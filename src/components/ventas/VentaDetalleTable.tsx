import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { VentaDetalle } from "./ventas.types";

type VentaDetalleTableProps = {
  detalles: VentaDetalle[];
};

function getTarifaLabel(row: VentaDetalle) {
  if (row.tipoTarifa === "EXENTO") return "Exento 0%";
  if (row.tipoTarifa === "ESPECIAL") return `Especial ${row.porcentajeIva}%`;
  return `IVA ${row.porcentajeIva}%`;
}

function VentaDetalleTable({ detalles }: VentaDetalleTableProps) {
  return (
    <DataTableShell
      data={detalles}
      emptyMessage="Esta venta no tiene detalles registrados."
      getRowKey={(row) => String(row.id)}
      columns={[
        {
          key: "producto",
          header: "Producto",
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">
                {row.productoNombre}
              </p>
              <p className="text-xs text-slate-500">
                ID producto: {row.productoId}
              </p>
            </div>
          ),
        },
        {
          key: "lote",
          header: "Lote",
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">{row.loteCodigo}</p>
              <p className="text-xs text-slate-500">
                Pedido {row.pedidoId ?? "-"} · {row.modoDescuentoLote}
              </p>
            </div>
          ),
        },
        {
          key: "cantidad",
          header: "Cant.",
          render: (row) => row.cantidad,
        },
        {
          key: "precio",
          header: "Precio",
          render: (row) => formatCurrency(row.precioUnitario),
        },
        {
          key: "descuento",
          header: "Desc.",
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">
                {row.porcentajeDescuento}%
              </p>
              <p className="text-xs text-slate-500">
                {formatCurrency(row.descuento)}
              </p>
            </div>
          ),
        },
        {
          key: "tarifa",
          header: "Tarifa",
          render: (row) => (
            <StatusBadge
              label={getTarifaLabel(row)}
              variant={row.tipoTarifa === "EXENTO" ? "neutral" : "warning"}
            />
          ),
        },
        {
          key: "iva",
          header: "IVA",
          render: (row) => formatCurrency(row.iva),
        },
        {
          key: "total",
          header: "Total línea",
          render: (row) => formatCurrency(row.totalLinea),
        },
        {
          key: "costo",
          header: "Costo",
          render: (row) => formatCurrency(row.costoTotal),
        },
        {
          key: "ganancia",
          header: "Ganancia",
          render: (row) => formatCurrency(row.gananciaBruta),
        },
      ]}
    />
  );
}

export default VentaDetalleTable;
