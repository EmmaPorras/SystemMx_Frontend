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
import { formatCurrency } from "../common/formatters";

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

function getEstadoPagoLabel(
  estado: EstadoPagoVenta,
) {
  const labels: Record<
    EstadoPagoVenta,
    string
  > = {
    PAGADA: "Pagada",
    PARCIAL: "Parcial",
    EN_DEUDA: "En deuda",
    ANULADA: "Anulada",
  };

  return labels[estado];
}

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

function getEstadoVentaLabel(
  estado: EstadoVenta,
) {
  const labels: Record<
    EstadoVenta,
    string
  > = {
    REGISTRADA: "Registrada",
    ANULADA: "Anulada",
  };

  return labels[estado];
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
  return (
    <DataTableShell
      data={ventas}
      emptyMessage="No hay ventas que coincidan con los filtros."
      getRowKey={(row) =>
        String(
          row.id,
        )
      }
      columns={[
        {
          key: "numero",
          header: "Venta",
          render: (
            row,
          ) => (
            <div>
              <p className="font-semibold text-zinc-950">
                Venta #
                {
                  row.numeroVenta
                }
              </p>

              <p className="text-xs text-zinc-500">
                {
                  row.detalles
                    .length
                }{" "}
                detalle(s)
              </p>
            </div>
          ),
        },

        {
          key: "fecha",
          header: "Fecha",
          render: (
            row,
          ) =>
            row.fechaVenta,
        },

        {
          key: "cliente",
          header: "Cliente",
          render: (
            row,
          ) =>
            row.clienteNombre ||
            "Venta mostrador",
        },

        {
          key: "medioPago",
          header: "Método",
          render: (
            row,
          ) =>
            row.medioPago,
        },

        {
          key: "total",
          header: "Total",
          render: (
            row,
          ) =>
            formatCurrency(
              row.totalVenta,
            ),
        },

        {
          key: "pagado",
          header: "Pagado",
          render: (
            row,
          ) =>
            formatCurrency(
              row.montoPagado,
            ),
        },

        {
          key: "saldo",
          header: "Saldo",
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
          header: "Pago",
          render: (
            row,
          ) => (
            <StatusBadge
              label={getEstadoPagoLabel(
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
          header: "Estado",
          render: (
            row,
          ) => (
            <StatusBadge
              label={getEstadoVentaLabel(
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
              label="Ver detalle"
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
                label="Registrar pago"
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
                label="Enviar a papelera"
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
                label="Restaurar venta"
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
                label="Anular venta"
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