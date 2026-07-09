import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { Fragment, useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import PedidoDetalleTable from "./PedidoDetalleTable";
import type { EstadoPedidoCompra, PedidoCompra } from "./pedidos.types";

type TablaPedidosProps = {
  pedidos: PedidoCompra[];
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
  if (estado === "RECIBIDO") return "success";
  if (estado === "EN_TRANSITO") return "warning";
  return "neutral";
}

function TablaPedidos({ pedidos, onEdit, onDelete }: TablaPedidosProps) {
  const [pedidoExpandidoId, setPedidoExpandidoId] = useState<number | null>(
    null,
  );

  function alternarDetalle(id: number) {
    setPedidoExpandidoId((prev) => (prev === id ? null : id));
  }

  if (pedidos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-500">
          Todavía no hay pedidos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Pedido
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Fecha
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Proveedor
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Artículos
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Unidades
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Inversión total
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Estado
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pedidos.map((pedido) => {
              const estaExpandido = pedidoExpandidoId === pedido.id;
              const cantidadArticulos = new Set(
                pedido.detalles.map((detalle) => detalle.productoNombre),
              ).size;
              const totalUnidades = pedido.detalles.reduce(
                (acc, detalle) => acc + detalle.cantidad,
                0,
              );

              return (
                <Fragment key={pedido.id}>
                  <tr className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3 align-middle text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {pedido.numeroPedido}
                        </p>
                        <p className="text-xs text-slate-500">
                          {pedido.origen}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle text-slate-700">
                      {pedido.fecha}
                    </td>

                    <td className="px-4 py-3 align-middle text-slate-700">
                      {pedido.proveedorNombre}
                    </td>

                    <td className="px-4 py-3 align-middle text-slate-700">
                      {cantidadArticulos}
                    </td>

                    <td className="px-4 py-3 align-middle text-slate-700">
                      {totalUnidades}
                    </td>

                    <td className="px-4 py-3 align-middle text-slate-700">
                      {formatCurrency(pedido.inversionTotal)}
                    </td>

                    <td className="px-4 py-3 align-middle text-slate-700">
                      <StatusBadge
                        label={getEstadoPedidoLabel(pedido.estado)}
                        variant={getEstadoPedidoVariant(pedido.estado)}
                      />
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => alternarDetalle(pedido.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                        >
                          {estaExpandido ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {estaExpandido ? "Ocultar" : "Ver detalle"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(pedido)}
                          className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="Editar pedido"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(pedido)}
                          className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                          aria-label="Eliminar pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {estaExpandido ? (
                    <tr>
                      <td colSpan={8} className="bg-slate-50 px-4 py-5">
                        <div className="mb-4 grid gap-3 md:grid-cols-4">
                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Moneda
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-950">
                              {pedido.monedaCompra}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Tipo de cambio
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-950">
                              {pedido.tipoCambio}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Lotes
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-950">
                              {pedido.detalles.length}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Observaciones
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {pedido.observaciones || "Sin observaciones"}
                            </p>
                          </div>
                        </div>

                        <PedidoDetalleTable
                          detalles={pedido.detalles}
                          monedaCompra={pedido.monedaCompra}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaPedidos;