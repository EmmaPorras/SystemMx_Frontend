import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency, formatDate } from "../common/formatters";
import { getMovementTypeLabel } from "../../i18n/statusMap";

import type {
  MovimientoInventario,
  TipoMovimientoInventario,
} from "./movimientos.types";

type TablaMovimientosProps = {
  movimientos: MovimientoInventario[];
};

function getTipoVariant(
  tipo: TipoMovimientoInventario,
): "success" | "warning" | "neutral" | "danger" {
  switch (tipo) {
    case "ENTRADA_COMPRA":
      return "success";

    case "SALIDA_VENTA":
      return "warning";

    case "REINGRESO_ANULACION_VENTA":
      return "neutral";
  }
}

function TablaMovimientos({
  movimientos,
}: TablaMovimientosProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={movimientos}
      emptyMessage={t("movements.emptyTitle", "No hay movimientos que coincidan con los filtros.")}
      getRowKey={(row) => row.idMovimiento}
      columns={[
        {
          key: "fecha",
          header: t("movements.date", "Fecha"),
          render: (row) =>
            formatDate(
              row.fechaMovimiento,
            ),
        },
        {
          key: "tipo",
          header: t("movements.type", "Tipo"),
          render: (row) => (
            <StatusBadge
              label={getMovementTypeLabel(
                t,
                row.tipoMovimiento,
              )}
              variant={getTipoVariant(
                row.tipoMovimiento,
              )}
            />
          ),
        },
        {
          key: "producto",
          header: t("movements.product", "Producto"),
          render: (row) =>
            row.producto?.nombre ?? "—",
        },
        {
          key: "lote",
          header: t("movements.lot", "Lote"),
          render: (row) =>
            row.lote?.codigoLote ?? "—",
        },
        {
          key: "cantidad",
          header: t("movements.quantity", "Cantidad"),
          render: (row) => (
            <span className="font-semibold">
              {row.cantidad}
            </span>
          ),
        },
        {
          key: "referencia",
          header: t("movements.reference", "Referencia"),
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-900">
                {row.referenciaTipo === "PEDIDO"
                  ? t("movements.orderRef", "Pedido")
                  : row.referenciaTipo === "VENTA"
                  ? t("movements.saleRef", "Venta")
                  : row.referenciaTipo}
              </p>

              <p className="text-xs text-zinc-500">
                ID {row.referenciaId}
              </p>
            </div>
          ),
        },
        {
          key: "usuario",
          header: t("movements.user", "Usuario"),
          render: (row) =>
            row.usuario ??
            (row.idUsuario
              ? `${t("movements.user", "Usuario")} #${row.idUsuario}`
              : t("movements.system", "Sistema")),
        },
        {
          key: "costo",
          header: t("movements.unitCost", "Costo unitario"),
          render: (row) =>
            formatCurrency(
              row.costoUnitario,
            ),
        },
        {
          key: "total",
          header: t("movements.totalMovement", "Total movimiento"),
          render: (row) =>
            formatCurrency(
              row.totalMovimiento,
            ),
        },
        {
          key: "motivo",
          header: t("movements.reason", "Motivo"),
          render: (row) => (
            <div className="max-w-xs">
              <p className="text-sm text-zinc-700">
                {row.motivo}
              </p>

              {row.observaciones?.trim() ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {row.observaciones}
                </p>
              ) : null}
            </div>
          ),
        },
      ]}
    />
  );
}

export default TablaMovimientos;
