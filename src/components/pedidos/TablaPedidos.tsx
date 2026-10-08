import { FaEye } from "react-icons/fa";
import { Ban, PackageCheck, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency } from "../common/formatters";
import { getOrderStatusLabel } from "../../i18n/statusMap";
import {
  puedeCancelarPedido,
  puedeRecibirPedido,
} from "./recepcionPedido.utils";

import type {
  EstadoPedidoCompra,
  PedidoCompra,
} from "./pedidos.types";

type TablaPedidosProps = {
  pedidos: PedidoCompra[];
  onView: (pedido: PedidoCompra) => void;
  onEdit: (pedido: PedidoCompra) => void;
  onCancel: (pedido: PedidoCompra) => void;
  onReceive: (pedido: PedidoCompra) => void;
};

function getEstadoPedidoVariant(estado: EstadoPedidoCompra) {
  if (estado === "RECIBIDO") return "success" as const;
  if (estado === "EN_TRANSITO") return "warning" as const;
  if (estado === "CANCELADO") return "danger" as const;
  return "neutral" as const;
}

export function puedeEditarPedido(pedido: PedidoCompra): boolean {
  return (
    pedido.estado === "REGISTRADO" ||
    pedido.estado === "EN_TRANSITO"
  );
}

function TablaPedidos({
  pedidos,
  onView,
  onEdit,
  onCancel,
  onReceive,
}: TablaPedidosProps) {
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={pedidos}
      emptyMessage={t("orders.emptyTitle")}
      emptyDescription={t("orders.emptyDesc")}
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "pedido",
          header: t("orders.title"),
          render: (row) => (
            <div>
              <p className="font-bold text-zinc-950">
                #{row.numeroPedido}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{row.origen}</p>
            </div>
          ),
        },
        {
          key: "fecha",
          header: t("orders.date"),
          render: (row) => row.fecha,
        },
        {
          key: "proveedor",
          header: t("orders.supplier"),
          render: (row) => (
            <span className="font-medium text-zinc-800">
              {row.proveedorNombre}
            </span>
          ),
        },
        {
          key: "articulos",
          header: t("products.title"),
          render: (row) => {
            const cantidadArticulos = new Set(
              row.detalles.map((detalle) =>
                detalle.productoNombre.trim().toLowerCase(),
              ),
            ).size;

            return cantidadArticulos;
          },
        },
        {
          key: "lotes",
          header: t("navigation.batches"),
          render: (row) => row.detalles.length,
        },
        {
          key: "unidades",
          header: t("orders.quantity"),
          render: (row) =>
            row.detalles.reduce(
              (total, detalle) => total + Number(detalle.cantidad || 0),
              0,
            ),
        },
        {
          key: "inversion",
          header: t("orders.totalInvestment"),
          render: (row) => (
            <span className="font-semibold text-zinc-950">
              {formatCurrency(row.inversionTotal)}
            </span>
          ),
        },
        {
          key: "estado",
          header: t("common.status"),
          render: (row) => (
            <StatusBadge
              label={getOrderStatusLabel(t, row.estado)}
              variant={getEstadoPedidoVariant(row.estado)}
            />
          ),
        },
      ]}
      actionsHeader={t("dataTable.actions")}
      actions={(row) => (
        <>
          <TableActionButton
            label={t("orders.details")}
            variant="view"
            icon={<FaEye size={17} />}
            onClick={() => onView(row)}
          />

          {puedeRecibirPedido(row) ? (
            <TableActionButton
              label={t("orders.receiveOrder")}
              variant="view"
              icon={<PackageCheck size={17} />}
              onClick={() => onReceive(row)}
            />
          ) : null}

          {puedeEditarPedido(row) ? (
            <TableActionButton
              label={t("orders.editOrder")}
              variant="edit"
              icon={<Pencil size={17} />}
              onClick={() => onEdit(row)}
            />
          ) : null}

          {puedeCancelarPedido(row) ? (
            <TableActionButton
              label={t("orders.cancelOrder")}
              variant="delete"
              icon={<Ban size={17} />}
              onClick={() => onCancel(row)}
            />
          ) : null}
        </>
      )}
    />
  );
}

export default TablaPedidos;
