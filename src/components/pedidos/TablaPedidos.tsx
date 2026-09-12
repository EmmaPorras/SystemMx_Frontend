import { FaEye } from "react-icons/fa";
import { Ban, PackageCheck, Pencil } from "lucide-react";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency } from "../common/formatters";
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

function getEstadoPedidoLabel(estado: EstadoPedidoCompra) {
  const labels: Record<EstadoPedidoCompra, string> = {
    REGISTRADO: "Registrado",
    EN_TRANSITO: "En tránsito",
    RECIBIDO: "Recibido",
    CANCELADO: "Cancelado",
  };

  return labels[estado];
}

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
  return (
    <DataTableShell
      data={pedidos}
      emptyMessage="No hay pedidos que coincidan con los filtros seleccionados."
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "pedido",
          header: "Pedido",
          render: (row) => (
            <div>
              <p className="font-bold text-zinc-950">
                Pedido {row.numeroPedido}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{row.origen}</p>
            </div>
          ),
        },
        {
          key: "fecha",
          header: "Fecha",
          render: (row) => row.fecha,
        },
        {
          key: "proveedor",
          header: "Proveedor",
          render: (row) => (
            <span className="font-medium text-zinc-800">
              {row.proveedorNombre}
            </span>
          ),
        },
        {
          key: "articulos",
          header: "Artículos",
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
          header: "Lotes",
          render: (row) => row.detalles.length,
        },
        {
          key: "unidades",
          header: "Unidades",
          render: (row) =>
            row.detalles.reduce(
              (total, detalle) => total + Number(detalle.cantidad || 0),
              0,
            ),
        },
        {
          key: "inversion",
          header: "Inversión total",
          render: (row) => (
            <span className="font-semibold text-zinc-950">
              {formatCurrency(row.inversionTotal)}
            </span>
          ),
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={getEstadoPedidoLabel(row.estado)}
              variant={getEstadoPedidoVariant(row.estado)}
            />
          ),
        },
      ]}
      actionsHeader="Acciones"
      actions={(row) => (
        <>
          <TableActionButton
            label="Ver detalle"
            variant="view"
            icon={<FaEye size={17} />}
            onClick={() => onView(row)}
          />

          {puedeRecibirPedido(row) ? (
            <TableActionButton
              label="Recibir mercancía"
              variant="view"
              icon={<PackageCheck size={17} />}
              onClick={() => onReceive(row)}
            />
          ) : null}

          {puedeEditarPedido(row) ? (
            <TableActionButton
              label="Editar pedido"
              variant="edit"
              icon={<Pencil size={17} />}
              onClick={() => onEdit(row)}
            />
          ) : null}

          {puedeCancelarPedido(row) ? (
            <TableActionButton
              label="Cancelar pedido"
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
