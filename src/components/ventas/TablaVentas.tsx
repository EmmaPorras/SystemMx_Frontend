import { Ban, CheckCircle2, Eye, RotateCcw, Trash2 } from "lucide-react";
import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { EstadoPagoVenta, EstadoVenta, Venta } from "./ventas.types";

type TablaVentasProps = {
  ventas: Venta[];
  vistaPapelera: boolean;
  onVerDetalle: (venta: Venta) => void;
  onEnviarPapelera: (venta: Venta) => void;
  onRestaurar: (venta: Venta) => void;
  onAnular: (venta: Venta) => void;
  onMarcarPagada: (venta: Venta) => void;
};

function getEstadoPagoLabel(estado: EstadoPagoVenta) {
  const labels: Record<EstadoPagoVenta, string> = {
    PAGADA: "Pagada",
    PARCIAL: "Parcial",
    EN_DEUDA: "En deuda",
    ANULADA: "Anulada",
  };

  return labels[estado];
}

function getEstadoPagoVariant(estado: EstadoPagoVenta) {
  if (estado === "PAGADA") return "success";
  if (estado === "PARCIAL" || estado === "EN_DEUDA") return "warning";
  return "danger";
}

function getEstadoVentaLabel(estado: EstadoVenta) {
  const labels: Record<EstadoVenta, string> = {
    REGISTRADA: "Registrada",
    ANULADA: "Anulada",
  };

  return labels[estado];
}

function getEstadoVentaVariant(estado: EstadoVenta) {
  if (estado === "REGISTRADA") return "success";
  return "danger";
}

function IconActionButton({
  label,
  onClick,
  children,
  variant = "neutral",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "neutral" | "success" | "danger";
}) {
  const variantClassName = {
    neutral:
      "border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    success:
      "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
    danger: "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-full border p-2 transition ${variantClassName}`}
    >
      {children}
    </button>
  );
}

function TablaVentas({
  ventas,
  vistaPapelera,
  onVerDetalle,
  onEnviarPapelera,
  onRestaurar,
  onAnular,
  onMarcarPagada,
}: TablaVentasProps) {
  return (
    <DataTableShell
      data={ventas}
      emptyMessage="Todavía no hay ventas registradas."
      getRowKey={(row) => String(row.id)}
      columns={[
        {
          key: "numero",
          header: "Venta",
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">
                Venta {row.numeroVenta}
              </p>
              <p className="text-xs text-slate-500">
                {row.detalles.length} detalle(s)
              </p>
            </div>
          ),
        },
        {
          key: "fecha",
          header: "Fecha",
          render: (row) => row.fechaVenta,
        },
        {
          key: "cliente",
          header: "Cliente",
          render: (row) => row.clienteNombre || "Venta mostrador",
        },
        {
          key: "total",
          header: "Total",
          render: (row) => formatCurrency(row.totalVenta),
        },
        {
          key: "ganancia",
          header: "Ganancia",
          render: (row) => formatCurrency(row.gananciaBruta),
        },
        {
          key: "saldo",
          header: "Saldo",
          render: (row) => formatCurrency(row.saldoPendiente),
        },
        {
          key: "estadoPago",
          header: "Pago",
          render: (row) => (
            <StatusBadge
              label={getEstadoPagoLabel(row.estadoPago)}
              variant={getEstadoPagoVariant(row.estadoPago)}
            />
          ),
        },
        {
          key: "estadoVenta",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={getEstadoVentaLabel(row.estadoVenta)}
              variant={getEstadoVentaVariant(row.estadoVenta)}
            />
          ),
        },
      ]}
      actions={(row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <IconActionButton label="Ver detalle" onClick={() => onVerDetalle(row)}>
            <Eye className="h-4 w-4" />
          </IconActionButton>

          {row.saldoPendiente > 0 && row.estadoVenta !== "ANULADA" ? (
            <IconActionButton
              label="Marcar como pagada"
              onClick={() => onMarcarPagada(row)}
              variant="success"
            >
              <CheckCircle2 className="h-4 w-4" />
            </IconActionButton>
          ) : null}

          {row.estadoVenta !== "ANULADA" ? (
            <IconActionButton
              label="Anular venta"
              onClick={() => onAnular(row)}
              variant="danger"
            >
              <Ban className="h-4 w-4" />
            </IconActionButton>
          ) : null}

          {vistaPapelera ? (
            <IconActionButton
              label="Restaurar venta"
              onClick={() => onRestaurar(row)}
            >
              <RotateCcw className="h-4 w-4" />
            </IconActionButton>
          ) : (
            <IconActionButton
              label="Enviar a papelera"
              onClick={() => onEnviarPapelera(row)}
            >
              <Trash2 className="h-4 w-4" />
            </IconActionButton>
          )}
        </div>
      )}
    />
  );
}

export default TablaVentas;