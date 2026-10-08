import {
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency } from "../common/formatters";
import { getLotStatusLabel } from "../../i18n/statusMap";

import type {
  EstadoLoteInventario,
  LoteInventario,
} from "./lotes.types";

type TablaLotesProps = {
  lotes: LoteInventario[];
  onView: (
    lote: LoteInventario,
  ) => void;
};

function getEstadoVariant(
  estado: EstadoLoteInventario,
):
  | "success"
  | "warning"
  | "neutral"
  | "danger" {
  switch (estado) {
    case "EN_STOCK":
      return "success";

    case "EN_PROCESO":
      return "warning";

    case "VENDIDO_PARCIAL":
      return "neutral";

    case "AGOTADO":
      return "danger";
  }
}

function TablaLotes({
  lotes,
  onView,
}: TablaLotesProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={lotes}
      emptyMessage={t("lots.emptyTitle", "No hay lotes que coincidan con los filtros.")}
      getRowKey={(
        row,
      ) =>
        row.idLote
      }
      columns={[
        {
          key: "lote",
          header: t("lots.lotCode", "Lote"),
          render: (
            row,
          ) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {
                  row.codigoLote
                }
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                ID{" "}
                {
                  row.idLote
                }
              </p>
            </div>
          ),
        },

        {
          key: "producto",
          header: t("lots.product", "Producto"),
          render: (
            row,
          ) =>
            row.producto
              ?.nombre ??
            `Producto #${row.idProducto}`,
        },

        {
          key: "pedido",
          header: t("navigation.orders", "Pedido"),
          render: (
            row,
          ) =>
            row.pedido
              ? `#${row.pedido.numeroPedido}`
              : `ID ${row.idPedido}`,
        },

        {
          key: "cantidades",
          header: t("navigation.inventory", "Inventario"),
          render: (
            row,
          ) => (
            <div className="space-y-0.5 text-sm">
              <p>
                {t("lots.availableQuantity", "Disponible")}:{" "}
                <span className="font-semibold">
                  {
                    row.cantidadDisponible
                  }
                </span>
              </p>

              <p className="text-xs text-zinc-500">
                {t("lots.receivedQuantity", "Recibida")}:{" "}
                {
                  row.cantidadRecibida
                }
              </p>

              <p className="text-xs text-zinc-500">
                {t("sales.title", "Vendida")}:{" "}
                {
                  row.cantidadVendida
                }
              </p>
            </div>
          ),
        },

        {
          key: "pendiente",
          header: t("orders.pending", "Pendiente recepción"),
          render: (
            row,
          ) =>
            String(
              row.cantidadPendienteRecepcion,
            ),
        },

        {
          key: "costo",
          header: t("lots.costReal", "Costo unitario"),
          render: (
            row,
          ) =>
            formatCurrency(
              row.costoUnitarioReal,
            ),
        },

        {
          key: "precio",
          header: t("lots.salePrice", "Precio recomendado"),
          render: (
            row,
          ) =>
            formatCurrency(
              row.precioVentaRecomendado,
            ),
        },

        {
          key: "estado",
          header: t("lots.status", "Estado"),
          render: (
            row,
          ) => (
            <StatusBadge
              label={getLotStatusLabel(
                t,
                row.estadoLote,
              )}
              variant={getEstadoVariant(
                row.estadoLote,
              )}
            />
          ),
        },
      ]}
      actions={(
        row,
      ) => (
        <TableActionButton
          label={t("lots.details")}
          variant="view"
          icon={
            <Eye
              size={
                17
              }
            />
          }
          onClick={() =>
            onView(
              row,
            )
          }
        />
      )}
    />
  );
}

export default TablaLotes;