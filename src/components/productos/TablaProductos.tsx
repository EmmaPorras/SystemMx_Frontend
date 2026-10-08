import {
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency } from "../common/formatters";
import { getCatalogStatusLabel } from "../../i18n/statusMap";

import type { Producto } from "./productos.types";

type TablaProductosProps = {
  productos: Producto[];
  onView: (producto: Producto) => void;
};

function TablaProductos({
  productos,
  onView,
}: TablaProductosProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={productos}
      emptyMessage={t("products.emptyTitle")}
      emptyDescription={t("products.emptyDesc")}
      getRowKey={(row) => row.idProducto}
      columns={[
        {
          key: "producto",
          header: t("products.title"),
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {row.nombre}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {row.sku?.trim() || "—"}
              </p>
            </div>
          ),
        },
        {
          key: "categoria",
          header: t("products.category"),
          render: (row) =>
            row.categoria?.nombre ?? "—",
        },
        {
          key: "marca",
          header: t("products.brand"),
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
          header: t("products.suggestedPrice"),
          render: (row) =>
            formatCurrency(
              row.precioVentaSugeridoSinIva,
            ),
        },
        {
          key: "stock",
          header: t("products.stock"),
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {row.stockActual}
              </p>

              <p className="text-xs text-zinc-500">
                Min: {row.stockMinimo}
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
          header: t("common.status"),
          render: (row) => (
            <StatusBadge
              label={getCatalogStatusLabel(t, row.activo)}
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
          label={t("products.details")}
          variant="view"
          icon={<Eye size={17} />}
          onClick={() => onView(row)}
        />
      )}
    />
  );
}

export default TablaProductos;