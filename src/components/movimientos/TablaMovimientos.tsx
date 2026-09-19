import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";

import type {
  MovimientoInventario,
  TipoMovimientoInventario,
} from "./movimientos.types";

type TablaMovimientosProps = {
  movimientos: MovimientoInventario[];
};

function getTipoLabel(
  tipo: TipoMovimientoInventario,
): string {
  switch (tipo) {
    case "ENTRADA_COMPRA":
      return "ENTRADA COMPRA";

    case "SALIDA_VENTA":
      return "SALIDA VENTA";

    case "REINGRESO_ANULACION_VENTA":
      return "REINGRESO ANULACIÓN";
  }
}

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

function formatFechaMovimiento(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function TablaMovimientos({
  movimientos,
}: TablaMovimientosProps) {
  return (
    <DataTableShell
      data={movimientos}
      emptyMessage="No hay movimientos que coincidan con los filtros."
      getRowKey={(row) => row.idMovimiento}
      columns={[
        {
          key: "fecha",
          header: "Fecha",
          render: (row) =>
            formatFechaMovimiento(
              row.fechaMovimiento,
            ),
        },
        {
          key: "tipo",
          header: "Tipo",
          render: (row) => (
            <StatusBadge
              label={getTipoLabel(
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
          header: "Producto",
          render: (row) =>
            row.producto?.nombre ?? "—",
        },
        {
          key: "lote",
          header: "Lote",
          render: (row) =>
            row.lote?.codigoLote ?? "—",
        },
        {
          key: "cantidad",
          header: "Cantidad",
          render: (row) => (
            <span className="font-semibold">
              {row.cantidad}
            </span>
          ),
        },
        {
          key: "referencia",
          header: "Referencia",
          render: (row) => (
            <div>
              <p className="font-semibold text-zinc-900">
                {row.referenciaTipo}
              </p>

              <p className="text-xs text-zinc-500">
                ID {row.referenciaId}
              </p>
            </div>
          ),
        },
        {
          key: "usuario",
          header: "Usuario",
          render: (row) =>
            row.usuario ??
            (row.idUsuario
              ? `Usuario #${row.idUsuario}`
              : "Sistema"),
        },
        {
          key: "costo",
          header: "Costo unitario",
          render: (row) =>
            formatCurrency(
              row.costoUnitario,
            ),
        },
        {
          key: "total",
          header: "Total movimiento",
          render: (row) =>
            formatCurrency(
              row.totalMovimiento,
            ),
        },
        {
          key: "motivo",
          header: "Motivo",
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
