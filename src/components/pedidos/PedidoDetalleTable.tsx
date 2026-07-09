import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type {
  EstadoLoteProducto,
  MonedaCompra,
  PedidoDetalle,
} from "./pedidos.types";

type PedidoDetalleTableProps = {
  detalles: PedidoDetalle[];
  monedaCompra: MonedaCompra;
};

const monedaSimbolos: Record<MonedaCompra, string> = {
  CRC: "₡",
  USD: "$",
  EUR: "€",
  COP: "COP",
  BRL: "R$",
};

function getMonedaSymbol(moneda: MonedaCompra) {
  return monedaSimbolos[moneda] ?? "";
}

function formatMoneyByMoneda(value: number, moneda: MonedaCompra) {
  const numericValue = Number(value);

  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  const decimals = moneda === "CRC" || moneda === "COP" ? 0 : 2;

  const formattedValue = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);

  const symbol = getMonedaSymbol(moneda);

  if (moneda === "COP") {
    return `${symbol} ${formattedValue}`;
  }

  return `${symbol}${formattedValue}`;
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

function PedidoDetalleTable({
  detalles,
  monedaCompra,
}: PedidoDetalleTableProps) {
  return (
    <DataTableShell
      data={detalles}
      emptyMessage="Este pedido todavía no tiene artículos o lotes registrados."
      getRowKey={(row) => row.idTemporal}
      columns={[
        {
          key: "producto",
          header: "Producto",
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">
                {row.productoNombre}
              </p>
              {row.productoId ? (
                <p className="text-xs text-slate-500">
                  ID producto: {row.productoId}
                </p>
              ) : null}
            </div>
          ),
        },
        {
          key: "lote",
          header: "Lote",
          render: (row) => (
            <p className="font-semibold text-slate-900">{row.loteCodigo}</p>
          ),
        },
        {
          key: "cantidad",
          header: "Cantidad",
          render: (row) => row.cantidad,
        },
        {
          key: "stock",
          header: "Stock actual",
          render: (row) => row.cantidadDisponible,
        },
        {
          key: "costoOrigen",
          header: "Costo origen",
          render: (row) =>
            formatMoneyByMoneda(row.costoUnitarioOrigen, monedaCompra),
        },
        {
          key: "costoReal",
          header: "Costo real CRC",
          render: (row) => formatCurrency(row.costoUnitarioReal),
        },
        {
          key: "precio",
          header: "Precio recom.",
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
  );
}

export default PedidoDetalleTable;