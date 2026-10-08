import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { VentaDetalle } from "./ventas.types";

type VentaDetalleTableProps = {
  detalles: VentaDetalle[];
};

function VentaDetalleTable({ detalles }: VentaDetalleTableProps) {
  const { t } = useTranslation();

  function getTarifaLabel(row: VentaDetalle) {
    if (row.tipoTarifa === "EXENTO") return `${t("vatRates.title", "Exento")} 0%`;
    if (row.tipoTarifa === "ESPECIAL") return `${t("vatRates.title", "Especial")} ${row.porcentajeIva}%`;
    return `${t("sales.tax", "IVA")} ${row.porcentajeIva}%`;
  }

  return (
    <DataTableShell
      data={detalles}
      emptyMessage={t("sales.emptyDesc", "Esta venta no tiene detalles registrados.")}
      getRowKey={(row) => String(row.id)}
      columns={[
        {
          key: "producto",
          header: t("products.title", "Producto"),
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">
                {row.productoNombre}
              </p>
              <p className="text-xs text-slate-500">
                ID {t("products.title", "producto")}: {row.productoId}
              </p>
            </div>
          ),
        },
        {
          key: "lote",
          header: t("lots.title", "Lote"),
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">{row.loteCodigo}</p>
              <p className="text-xs text-slate-500">
                {t("navigation.orders", "Pedido")} {row.pedidoId ?? "-"} · {row.modoDescuentoLote}
              </p>
            </div>
          ),
        },
        {
          key: "cantidad",
          header: t("common.quantity", "Cant."),
          render: (row) => row.cantidad,
        },
        {
          key: "precio",
          header: t("common.price", "Precio"),
          render: (row) => formatCurrency(row.precioUnitario),
        },
        {
          key: "descuento",
          header: t("sales.discount", "Desc."),
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
          header: t("vatRates.title", "Tarifa"),
          render: (row) => (
            <StatusBadge
              label={getTarifaLabel(row)}
              variant={row.tipoTarifa === "EXENTO" ? "neutral" : "warning"}
            />
          ),
        },
        {
          key: "iva",
          header: t("sales.tax", "IVA"),
          render: (row) => formatCurrency(row.iva),
        },
        {
          key: "total",
          header: t("common.total", "Total línea"),
          render: (row) => formatCurrency(row.totalLinea),
        },
        {
          key: "costo",
          header: t("common.cost", "Costo"),
          render: (row) => formatCurrency(row.costoTotal),
        },
        {
          key: "ganancia",
          header: t("home.grossProfit", "Ganancia"),
          render: (row) => formatCurrency(row.gananciaBruta),
        },
      ]}
    />
  );
}

export default VentaDetalleTable;
