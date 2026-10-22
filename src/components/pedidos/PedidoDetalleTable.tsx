import { useTranslation } from "react-i18next";
import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency, getActiveLocale } from "../common/formatters";
import { getLotStatusLabel } from "../../i18n/statusMap";
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
  COP: "COP ",
  BRL: "R$",
};

function getMonedaSymbol(moneda: MonedaCompra) {
  return monedaSimbolos[moneda] ?? "";
}

function formatMoneyByMoneda(value: number, moneda: MonedaCompra) {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const decimals = moneda === "CRC" || moneda === "COP" ? 0 : 2;

  const formattedValue = new Intl.NumberFormat(getActiveLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);

  const symbol = getMonedaSymbol(moneda);

  if (moneda === "COP") {
    return `${symbol} ${formattedValue}`;
  }

  return `${symbol}${formattedValue}`;
}

function getNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getCantidadRecibida(row: PedidoDetalle) {
  return getNumber(row.cantidadRecibida ?? row.cantidadDisponible);
}

function getCantidadPendiente(row: PedidoDetalle) {
  return getNumber(
    row.cantidadPendiente,
    Math.max(row.cantidad - getCantidadRecibida(row), 0),
  );
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
  const { t } = useTranslation();

  return (
    <DataTableShell
      data={detalles}
      emptyMessage={t("orders.emptyTitle")}
      emptyDescription={t("orders.emptyDesc")}
      getRowKey={(row) => row.idTemporal}
      columns={[
        {
          key: "producto",
          header: t("products.title"),
          render: (row) => (
            <div>
              <p className="font-semibold text-slate-900">
                {row.productoNombre}
              </p>
              {row.productoId ? (
                <p className="text-xs text-slate-500">
                  ID: {row.productoId}
                </p>
              ) : null}
            </div>
          ),
        },
        {
          key: "categoria",
          header: t("products.category"),
          render: (row) => row.categoriaNombre || "—",
        },
        {
          key: "marca",
          header: t("products.brand"),
          render: (row) => row.marca || "—",
        },
        {
          key: "lote",
          header: t("orders.lotCode"),
          render: (row) => (
            <p className="font-semibold text-slate-900">{row.loteCodigo}</p>
          ),
        },
        {
          key: "cantidad",
          header: t("orders.quantity"),
          render: (row) => row.cantidad,
        },
        {
          key: "recibida",
          header: t("orders.quantityReceived"),
          render: (row) => getCantidadRecibida(row),
        },
        {
          key: "pendiente",
          header: t("orders.pending"),
          render: (row) => getCantidadPendiente(row),
        },
        {
          key: "stock",
          header: t("products.stock"),
          render: (row) => row.cantidadDisponible,
        },
        {
          key: "costoOrigen",
          header: t("orders.costOrigin"),
          render: (row) =>
            formatMoneyByMoneda(row.costoUnitarioOrigen, monedaCompra),
        },
        {
          key: "costoReal",
          header: t("lots.costReal"),
          render: (row) => formatCurrency(row.costoUnitarioReal),
        },
        {
          key: "precio",
          header: t("orders.recommendedPrice"),
          render: (row) => formatCurrency(row.precioVentaRecomendado),
        },
        {
          key: "estado",
          header: t("common.status"),
          render: (row) => (
            <StatusBadge
              label={getLotStatusLabel(t, row.estadoLote)}
              variant={getEstadoLoteVariant(row.estadoLote)}
            />
          ),
        },
      ]}
    />
  );
}

export default PedidoDetalleTable;