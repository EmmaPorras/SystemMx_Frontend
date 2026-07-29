import { FaEye, FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";

import type {
  EstadoPedidoCompra,
  PedidoCompra,
} from "./pedidos.types";

type TablaPedidosProps = {
  pedidos: PedidoCompra[];
  onView: (pedido: PedidoCompra) => void;
  onEdit: (pedido: PedidoCompra) => void;
  onDelete: (pedido: PedidoCompra) => void;
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

function TablaPedidos({
  pedidos,
  onView,
  onEdit,
  onDelete,
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
          <button
            type="button"
            onClick={() => onView(row)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white hover:shadow-md"
            title="Ver detalle"
            aria-label={`Ver detalle del pedido ${row.numeroPedido}`}
          >
            <FaEye className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(row)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-md"
            title="Editar pedido"
            aria-label={`Editar pedido ${row.numeroPedido}`}
          >
            <FaRegEdit className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(row)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-600 hover:text-white hover:shadow-md"
            title="Eliminar pedido"
            aria-label={`Eliminar pedido ${row.numeroPedido}`}
          >
            <MdDelete className="h-5 w-5" />
          </button>
        </>
      )}
    />
  );
}

export default TablaPedidos;
