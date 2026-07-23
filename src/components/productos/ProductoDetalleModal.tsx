import AppModal from "../common/AppModal";
import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type {
  EstadoLoteProducto,
  MonedaCompra,
} from "../pedidos/pedidos.types";
import type { EstadoProducto, Producto } from "./productos.types";

type ProductoDetalleModalProps = {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
};

const monedaSimbolos: Record<MonedaCompra, string> = {
  CRC: "₡",
  USD: "$",
  EUR: "€",
  COP: "COP",
  BRL: "R$",
};

function getNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function formatMoneyByMoneda(value: number, moneda: MonedaCompra) {
  const numericValue = getNumber(value);

  const decimals = moneda === "CRC" || moneda === "COP" ? 0 : 2;

  const formattedValue = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);

  const symbol = monedaSimbolos[moneda] ?? "";

  if (moneda === "COP") {
    return `${symbol} ${formattedValue}`;
  }

  return `${symbol}${formattedValue}`;
}

function getEstadoProductoLabel(estado: EstadoProducto) {
  if (estado === "DISPONIBLE" || estado === "ACTIVO") {
    return "Disponible";
  }

  if (estado === "EN_PROCESO") {
    return "En proceso";
  }

  return "Agotado";
}

function getEstadoProductoVariant(estado: EstadoProducto) {
  if (estado === "DISPONIBLE" || estado === "ACTIVO") {
    return "success";
  }

  if (estado === "EN_PROCESO") {
    return "warning";
  }

  return "neutral";
}

function getEstadoLoteLabel(estado: EstadoLoteProducto) {
  const labels: Record<EstadoLoteProducto, string> = {
    EN_PROCESO: "En proceso",
    EN_STOCK: "En stock",
    VENDIDO_PARCIAL: "Vendido parcial",
    AGOTADO: "Agotado",
  };

  return labels[estado];
}

function getEstadoLoteVariant(estado: EstadoLoteProducto) {
  if (estado === "EN_STOCK") return "success";
  if (estado === "EN_PROCESO") return "warning";
  return "neutral";
}

function ProductoDetalleModal({
  producto,
  isOpen,
  onClose,
}: ProductoDetalleModalProps) {
  if (!producto) return null;

  const lotes = producto.lotes ?? [];
  const stockActual = getNumber(producto.stockActual);
  const stockEnProceso = getNumber(producto.stockEnProceso);
 
  const precioVenta = getNumber(producto.precioVenta ?? producto.precioReferencia);
  const proveedores =
    producto.proveedores && producto.proveedores.length > 0
      ? producto.proveedores.join(", ")
      : producto.proveedorNombre || "—";

  return (
  <AppModal
    isOpen={isOpen}
    onClose={onClose}
    title={producto.nombre}
    description="Detalle del producto generado desde pedidos y lotes."
    maxWidthClassName="max-w-6xl"
  >
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Estado
          </p>

          <div className="mt-2">
            <StatusBadge
              label={getEstadoProductoLabel(producto.estado)}
              variant={getEstadoProductoVariant(producto.estado)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Stock disponible
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {stockActual}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            En proceso
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {stockEnProceso}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Precio de venta
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {formatCurrency(precioVenta)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Proveedor(es)
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {proveedores}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Última compra
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {producto.ultimaCompra || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Rango de costo real
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatCurrency(getNumber(producto.costoMinimoReal))} -{" "}
            {formatCurrency(getNumber(producto.costoMaximoReal))}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-950">
          Historial por pedido y lote
        </h3>

        <DataTableShell
          data={lotes}
          emptyMessage="Este producto todavía no tiene lotes asociados."
          getRowKey={(row) =>
            `${row.pedidoId}-${row.idTemporal}-${row.loteCodigo}`
          }
          columns={[
            {
              key: "pedido",
              header: "Pedido",
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-900">
                    Pedido {row.numeroPedido}
                  </p>
                  <p className="text-xs text-slate-500">{row.fecha}</p>
                </div>
              ),
            },
            {
              key: "lote",
              header: "Lote",
              render: (row) => (
                <p className="font-semibold text-slate-900">
                  {row.loteCodigo}
                </p>
              ),
            },
            {
              key: "proveedor",
              header: "Proveedor",
              render: (row) => row.proveedorNombre,
            },
            {
              key: "origen",
              header: "Origen",
              render: (row) => row.origen,
            },
            {
              key: "cantidad",
              header: "Cant.",
              render: (row) => row.cantidad,
            },
            {
              key: "disponible",
              header: "Disp.",
              render: (row) => row.cantidadDisponible,
            },
            {
              key: "costoOrigen",
              header: "Costo origen",
              render: (row) =>
                formatMoneyByMoneda(
                  row.costoUnitarioOrigen,
                  row.monedaCompra,
                ),
            },
            {
              key: "costoReal",
              header: "Costo real CRC",
              render: (row) => formatCurrency(row.costoUnitarioReal),
            },
            {
              key: "precio",
              header: "Precio venta",
              render: (row) => formatCurrency(row.precioVentaRecomendado),
            },
            {
              key: "estado",
              header: "Estado lote",
              render: (row) => (
                <StatusBadge
                  label={getEstadoLoteLabel(row.estadoLote)}
                  variant={getEstadoLoteVariant(row.estadoLote)}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  </AppModal>
);
}

export default ProductoDetalleModal;