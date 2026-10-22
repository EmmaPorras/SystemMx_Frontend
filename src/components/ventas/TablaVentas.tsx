import { useTranslation } from "react-i18next";
import {
  Ban,
  CircleDollarSign,
  Eye,
  RotateCcw,
  Trash2,
} from "lucide-react";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency, formatDate } from "../common/formatters";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getSaleStatusLabel,
} from "../../i18n/statusMap";

import {
  puedeAnularVenta,
  puedeEnviarPapelera,
  puedeRegistrarPago,
  puedeRestaurarVenta,
} from "./ventas.utils";

import type {
  EstadoPagoVenta,
  EstadoVenta,
  Venta,
} from "./ventas.types";

type TablaVentasProps = {
  ventas: Venta[];
  onView: (venta: Venta) => void;
  onPay: (venta: Venta) => void;
  onTrash: (venta: Venta) => void;
  onRestore: (venta: Venta) => void;
  onVoid: (venta: Venta) => void;
};

function getEstadoPagoVariant(
  estado: EstadoPagoVenta,
):
  | "success"
  | "warning"
  | "danger"
  | "neutral" {
  if (
    estado === "PAGADA"
  ) {
    return "success";
  }

  if (
    estado === "PARCIAL" ||
    estado === "EN_DEUDA"
  ) {
    return "warning";
  }

  return "danger";
}

function getEstadoVentaVariant(
  estado: EstadoVenta,
):
  | "success"
  | "warning"
  | "danger"
  | "neutral" {
  if (
    estado === "REGISTRADA"
  ) {
    return "success";
  }

  return "danger";
}

function TablaVentas({
  ventas,
  onView,
  onPay,
  onTrash,
  onRestore,
  onVoid,
}: TablaVentasProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={ventas}
      emptyMessage={t("sales.emptyTitle", "No hay ventas que coincidan con los filtros.")}
      getRowKey={(row) =>
        String(
          row.id,
        )
      }
      columns={[
        {
          key: "numero",
          header: t("sales.title", "Venta"),
          render: (
            row,
          ) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {t("sales.title", "Venta")} #
                {
                  row.numeroVenta
                }
              </p>

              <p className="text-xs text-zinc-500">
                {
                  row.detalles
                    .length
                }{" "}
                {t("common.details", "detalles")}
              </p>
            </div>
          ),
        },

        {
          key: "fecha",
          header: t("sales.date", "Fecha"),
          render: (
            row,
          ) =>
            formatDate(row.fechaVenta),
        },

        {
          key: "cliente",
          header: t("sales.client", "Cliente"),
          render: (
            row,
          ) =>
            row.clienteNombre ||
            t("sales.clientPlaceholder", "Venta mostrador"),
        },

        {
          key: "medioPago",
          header: t("sales.paymentMethod", "Método"),
          render: (
            row,
          ) =>
            getPaymentMethodLabel(t, row.medioPago),
        },

        {
          key: "total",
          header: t("sales.total", "Total"),
          render: (
            row,
          ) =>
            formatCurrency(
              row.totalVenta,
            ),
        },

        {
          key: "pagado",
          header: t("sales.paid", "Pagado"),
          render: (
            row,
          ) =>
            formatCurrency(
              row.montoPagado,
            ),
        },

        {
          key: "saldo",
          header: t("sales.balance", "Saldo"),
          render: (
            row,
          ) => (
            <span
              className={
                row.saldoPendiente >
                0
                  ? "font-bold text-amber-700"
                  : ""
              }
            >
              {formatCurrency(
                row.saldoPendiente,
              )}
            </span>
          ),
        },

        {
          key: "estadoPago",
          header: t("sales.status", "Pago"),
          render: (
            row,
          ) => (
            <StatusBadge
              label={getPaymentStatusLabel(
                t,
                row.estadoPago,
              )}
              variant={getEstadoPagoVariant(
                row.estadoPago,
              )}
            />
          ),
        },

        {
          key: "estadoVenta",
          header: t("common.status", "Estado"),
          render: (
            row,
          ) => (
            <StatusBadge
              label={getSaleStatusLabel(
                t,
                row.estadoVenta,
              )}
              variant={getEstadoVentaVariant(
                row.estadoVenta,
              )}
            />
          ),
        },
      ]}
      actions={(
        row,
      ) => (
        <div
          className="
            flex
            w-max
            flex-nowrap
            items-center
            justify-end
            gap-1.5
            whitespace-nowrap
          "
        >
          <div className="shrink-0">
            <TableActionButton
              label={t("sales.saleDetails", "Ver detalle")}
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
          </div>

          {puedeRegistrarPago(
            row,
          ) ? (
            <div className="shrink-0">
              <TableActionButton
                label={t("sales.registerPayment", "Registrar pago")}
                variant="edit"
                icon={
                  <CircleDollarSign
                    size={
                      17
                    }
                  />
                }
                onClick={() =>
                  onPay(
                    row,
                  )
                }
              />
            </div>
          ) : null}

          {puedeEnviarPapelera(
            row,
          ) ? (
            <div className="shrink-0">
              <TableActionButton
                label={t("sales.viewTrash", "Enviar a papelera")}
                variant="delete"
                icon={
                  <Trash2
                    size={
                      17
                    }
                  />
                }
                onClick={() =>
                  onTrash(
                    row,
                  )
                }
              />
            </div>
          ) : null}

          {puedeRestaurarVenta(
            row,
          ) ? (
            <div className="shrink-0">
              <TableActionButton
                label={t("sales.restoreSale", "Restaurar venta")}
                variant="edit"
                icon={
                  <RotateCcw
                    size={
                      17
                    }
                  />
                }
                onClick={() =>
                  onRestore(
                    row,
                  )
                }
              />
            </div>
          ) : null}

          {puedeAnularVenta(
            row,
          ) ? (
            <div className="shrink-0">
              <TableActionButton
                label={t("sales.voidSale", "Anular venta")}
                variant="delete"
                icon={
                  <Ban
                    size={
                      17
                    }
                  />
                }
                onClick={() =>
                  onVoid(
                    row,
                  )
                }
              />
            </div>
          ) : null}
        </div>
      )}
    />
  );
}

export default TablaVentas;