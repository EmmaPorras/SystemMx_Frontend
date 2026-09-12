import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";

import type {
  EstadoLoteInventario,
  LoteInventario,
} from "./lotes.types";

type TablaLotesProps = {
  lotes: LoteInventario[];
};

function getEstadoVariant(
  estado: EstadoLoteInventario,
): "success" | "warning" | "neutral" | "danger" {
  switch (estado) {
    case "EN_STOCK":
      return "success";

    case "EN_PROCESO":
      return "warning";

    case "VENDIDO_PARCIAL":
      return "neutral";

    case "AGOTADO":
      return "neutral";
  }
}

function getEstadoLabel(
  estado: EstadoLoteInventario,
): string {
  switch (estado) {
    case "EN_PROCESO":
      return "EN PROCESO";

    case "EN_STOCK":
      return "EN STOCK";

    case "VENDIDO_PARCIAL":
      return "VENDIDO PARCIAL";

    case "AGOTADO":
      return "AGOTADO";
  }
}

function TablaLotes({
  lotes,
}: TablaLotesProps) {
  return (
    <DataTableShell
      data={lotes}
      emptyMessage="No hay lotes que coincidan con los filtros."
      getRowKey={(row) => row.idLote}
      columns={[
        {
          key: "lote",
          header: "Lote",
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-950">
                {row.codigoLote}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                ID {row.idLote}
              </p>
            </div>
          ),
        },
        {
          key: "producto",
          header: "Producto",
          render: (row) =>
            row.producto?.nombre ??
            `Producto #${row.idProducto}`,
        },
        {
          key: "pedido",
          header: "Pedido",
          render: (row) =>
            row.pedido
              ? `#${row.pedido.numeroPedido}`
              : `ID ${row.idPedido}`,
        },
        {
          key: "cantidades",
          header: "Inventario",
          render: (row) => (
            <div className="space-y-0.5 text-sm">
              <p>
                Disponible:{" "}
                <span className="font-semibold">
                  {row.cantidadDisponible}
                </span>
              </p>

              <p className="text-xs text-zinc-500">
                Recibida: {row.cantidadRecibida}
              </p>

              <p className="text-xs text-zinc-500">
                Vendida: {row.cantidadVendida}
              </p>
            </div>
          ),
        },
        {
          key: "pendiente",
          header: "Pendiente recepción",
          render: (row) =>
            String(
              row.cantidadPendienteRecepcion,
            ),
        },
        {
          key: "costo",
          header: "Costo unitario",
          render: (row) =>
            formatCurrency(
              row.costoUnitarioReal,
            ),
        },
        {
          key: "precio",
          header: "Precio recomendado",
          render: (row) =>
            formatCurrency(
              row.precioVentaRecomendado,
            ),
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={getEstadoLabel(
                row.estadoLote,
              )}
              variant={getEstadoVariant(
                row.estadoLote,
              )}
            />
          ),
        },
      ]}
    />
  );
}

export default TablaLotes;
