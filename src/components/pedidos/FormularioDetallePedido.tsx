import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import MoneyInputField from "../common/MoneyInputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import TableActionButton from "../common/TableActionButton";
import { formatCurrency, getActiveLocale } from "../common/formatters";
import { buscarProductosSugeridosApi } from "../../services/pedidosApi";
import type {
  CategoriaPedidoOption,
  MonedaCompra,
  PedidoCompra,
  PedidoDetalle,
  PedidoDetalleForm,
  PedidoDetalleFormErrors,
  ProductoSugerido,
} from "./pedidos.types";

type FormularioDetallePedidoProps = {
  pedido: PedidoCompra;
  detalleForm: PedidoDetalleForm;
  categorias: CategoriaPedidoOption[];
  canCreateCategory: boolean;
  errors: PedidoDetalleFormErrors;
  alertMessage?: string | null;
  isEditingDetail: boolean;
  onDetalleChange: (field: keyof PedidoDetalleForm, value: string) => void;
  onSeleccionarProducto: (producto: ProductoSugerido) => void;
  onCreateCategory: () => void;
  onAgregarDetalle: () => void;
  onEditarDetalle: (detalle: PedidoDetalle) => void;
  onCancelarEdicionDetalle: () => void;
  onEliminarDetalle: (idTemporal: string) => void;
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
};

const loteOptions = Array.from({ length: 10 }, (_, index) => {
  const lote = `L${index + 1}`;
  return {
    value: lote,
    label: lote,
  };
});

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

function getCantidadRecibidaTotal(row: PedidoDetalle) {
  return getNumber(row.cantidadRecibida ?? row.cantidadDisponible);
}

function getCantidadPendiente(row: PedidoDetalle) {
  return getNumber(
    row.cantidadPendiente,
    Math.max(row.cantidad - getCantidadRecibidaTotal(row), 0),
  );
}

function FormularioDetallePedido({
  pedido,
  detalleForm,
  categorias,
  canCreateCategory,
  errors,
  alertMessage,
  isEditingDetail,
  onDetalleChange,
  onSeleccionarProducto,
  onCreateCategory,
  onAgregarDetalle,
  onEditarDetalle,
  onCancelarEdicionDetalle,
  onEliminarDetalle,
  onBack,
  onSave,
  onCancel,
}: FormularioDetallePedidoProps) {
  const { t } = useTranslation();
  const simboloMoneda = getMonedaSymbol(pedido.monedaCompra);

  const [sugerencias, setSugerencias] = useState<ProductoSugerido[]>([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const categoriaOptions = [
    ...categorias.map((categoria) => ({
      value: String(categoria.id),
      label: categoria.nombre,
    })),
    ...(canCreateCategory
      ? [
          {
            value: "__CREAR_CATEGORIA__",
            label: `+ ${t("categories.newCategory")}`,
          },
        ]
      : []),
  ];

  useEffect(() => {
    const busqueda = detalleForm.productoNombre.trim();

    if (detalleForm.productoId || busqueda.length < 2) {
      setSugerencias([]);
      setCargandoSugerencias(false);
      return;
    }

    let cancelado = false;
    setCargandoSugerencias(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await buscarProductosSugeridosApi(busqueda);
        if (!cancelado) {
          setSugerencias(data);
        }
      } catch {
        if (!cancelado) {
          setSugerencias([]);
        }
      } finally {
        if (!cancelado) {
          setCargandoSugerencias(false);
        }
      }
    }, 250);

    return () => {
      cancelado = true;
      window.clearTimeout(timeoutId);
    };
  }, [detalleForm.productoNombre, detalleForm.productoId]);

  function seleccionarSugerencia(producto: ProductoSugerido) {
    onSeleccionarProducto(producto);
    setMostrarSugerencias(false);
    setSugerencias([]);
  }

  const debeMostrarListaSugerencias =
    mostrarSugerencias &&
    !detalleForm.productoId &&
    detalleForm.productoNombre.trim().length >= 2 &&
    (cargandoSugerencias || sugerencias.length > 0);

  return (
    <div className="space-y-5">
      {alertMessage ? (
        <AlertMessage
          variant="error"
          title={t("common.errorOccurred")}
          message={alertMessage}
        />
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-semibold text-zinc-900">
          {pedido.numeroPedido ? `#${pedido.numeroPedido}` : t("orders.newOrder")}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          {pedido.proveedorNombre || "—"} · {pedido.fecha} · {pedido.monedaCompra}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-zinc-950">
            {isEditingDetail
              ? t("orders.editOrder")
              : t("orders.addDetail")}
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <label
              htmlFor="articulo-nombre-input"
              className="mb-1.5 block text-sm font-semibold text-zinc-700"
            >
              {t("products.name")}
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            </label>

            <input
              id="articulo-nombre-input"
              type="text"
              value={detalleForm.productoNombre}
              onChange={(event) => {
                onDetalleChange("productoNombre", event.target.value);
                setMostrarSugerencias(true);
              }}
              onFocus={() => setMostrarSugerencias(true)}
              onBlur={() => {
                window.setTimeout(() => {
                  setMostrarSugerencias(false);
                }, 150);
              }}
              placeholder={t("orders.productPlaceholder")}
              maxLength={150}
              aria-invalid={Boolean(errors.productoNombre)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                errors.productoNombre
                  ? "border-red-400 bg-red-50/50 text-zinc-900 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200"
                  : "border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-200"
              }`}
            />

            <div className="mt-1.5 flex items-start justify-between gap-3">
              <div>
                {errors.productoNombre ? (
                  <p role="alert" className="text-xs font-medium text-red-600">
                    {errors.productoNombre}
                  </p>
                ) : null}
              </div>

              <p
                className={`shrink-0 text-xs font-medium ${
                  detalleForm.productoNombre.length >= 150
                    ? "text-red-500"
                    : "text-zinc-400"
                }`}
              >
                {detalleForm.productoNombre.length}/150
              </p>
            </div>

            {debeMostrarListaSugerencias ? (
              <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
                {cargandoSugerencias ? (
                  <p className="px-3.5 py-3 text-sm text-zinc-500">
                    {t("common.loading")}
                  </p>
                ) : null}

                {!cargandoSugerencias && sugerencias.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {sugerencias.map((producto) => (
                      <button
                        key={producto.id}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          seleccionarSugerencia(producto);
                        }}
                        className="block w-full border-b border-zinc-100 px-3.5 py-2.5 text-left transition last:border-b-0 hover:bg-zinc-50"
                      >
                        <p className="text-sm font-semibold text-zinc-900">
                          {producto.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          ID {producto.id}
                          {producto.categoriaNombre
                            ? ` · ${producto.categoriaNombre}`
                            : ""}
                          {producto.marca
                            ? ` · ${producto.marca}`
                            : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <SelectField
            label={t("products.category")}
            value={detalleForm.categoriaId}
            onChange={(value) => {
              if (value === "__CREAR_CATEGORIA__") {
                onCreateCategory();
                return;
              }

              onDetalleChange("categoriaId", value);
            }}
            placeholder={t("products.categoryPlaceholder")}
            required
            error={errors.categoriaId}
            options={categoriaOptions}
          />

          <InputField
            label={t("products.brand")}
            type="text"
            value={detalleForm.marca}
            onChange={(value) => onDetalleChange("marca", value)}
            placeholder={t("products.brandPlaceholder")}
            error={errors.marca}
            maxLength={100}
            showCharacterCount
          />

          <SelectField
            label={t("orders.lotCode")}
            value={detalleForm.loteCodigo}
            onChange={(value) => onDetalleChange("loteCodigo", value)}
            placeholder={t("orders.lotCode")}
            required
            error={errors.loteCodigo}
            options={loteOptions}
          />

          <InputField
            label={t("orders.quantity")}
            type="text"
            value={detalleForm.cantidad}
            onChange={(value) => onDetalleChange("cantidad", value)}
            required
            error={errors.cantidad}
            maxLength={5}
            showCharacterCount
          />

          <MoneyInputField
            label={t("orders.costOrigin")}
            value={detalleForm.costoUnitarioOrigen}
            onChange={(value) => onDetalleChange("costoUnitarioOrigen", value)}
            placeholder="0.00"
            required
            error={errors.costoUnitarioOrigen}
            currencySymbol={simboloMoneda}
            allowDecimals={pedido.monedaCompra !== "CRC"}
          />

          <MoneyInputField
            label={t("orders.recommendedPrice")}
            value={detalleForm.precioVentaRecomendado}
            onChange={(value) =>
              onDetalleChange("precioVentaRecomendado", value)
            }
            placeholder="0"
            required
            error={errors.precioVentaRecomendado}
            currencySymbol="₡"
            allowDecimals={false}
          />

          {isEditingDetail && Number(detalleForm.cantidadRecibidaPrevia) > 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {t("orders.quantityReceived")}
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-900">
                {detalleForm.cantidadRecibidaPrevia}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryButton onClick={onAgregarDetalle}>
            {isEditingDetail
              ? t("common.saveChanges")
              : `+ ${t("orders.addDetail")}`}
          </PrimaryButton>

          {isEditingDetail ? (
            <button
              type="button"
              onClick={onCancelarEdicionDetalle}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              {t("common.cancel")}
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-zinc-950">
          {t("orders.details")}
        </h3>

        <DataTableShell
          data={pedido.detalles}
          emptyMessage={t("orders.emptyTitle")}
          emptyDescription={t("orders.emptyDesc")}
          getRowKey={(row) => row.idTemporal}
          columns={[
            {
              key: "producto",
              header: t("products.title"),
              render: (row: PedidoDetalle) => (
                <div>
                  <p className="font-semibold text-zinc-900">
                    {row.productoNombre}
                  </p>
                  {row.productoId ? (
                    <p className="text-xs text-zinc-500">
                      ID: {row.productoId}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "categoria",
              header: t("products.category"),
              render: (row: PedidoDetalle) =>
                row.categoriaNombre || "—",
            },
            {
              key: "marca",
              header: t("products.brand"),
              render: (row: PedidoDetalle) => row.marca || "—",
            },
            {
              key: "lote",
              header: t("orders.lotCode"),
              render: (row: PedidoDetalle) => row.loteCodigo,
            },
            {
              key: "cantidad",
              header: t("orders.quantity"),
              render: (row: PedidoDetalle) => row.cantidad,
            },
            {
              key: "recibida",
              header: t("orders.quantityReceived"),
              render: (row: PedidoDetalle) => getCantidadRecibidaTotal(row),
            },
            {
              key: "pendiente",
              header: t("orders.pending"),
              render: (row: PedidoDetalle) => getCantidadPendiente(row),
            },
            {
              key: "stock",
              header: t("products.stock"),
              render: (row: PedidoDetalle) => row.cantidadDisponible,
            },
            {
              key: "costo",
              header: t("orders.costOrigin"),
              render: (row: PedidoDetalle) =>
                formatMoneyByMoneda(
                  row.costoUnitarioOrigen,
                  pedido.monedaCompra,
                ),
            },
            {
              key: "precio",
              header: t("orders.recommendedPrice"),
              render: (row: PedidoDetalle) =>
                formatCurrency(row.precioVentaRecomendado),
            },
          ]}
          actions={(row) => (
            <>
              <TableActionButton
                label={t("common.edit")}
                variant="edit"
                icon={<Pencil size={16} />}
                onClick={() => onEditarDetalle(row)}
              />

              <TableActionButton
                label={t("common.delete")}
                variant="delete"
                icon={<Trash2 size={16} />}
                onClick={() => onEliminarDetalle(row.idTemporal)}
              />
            </>
          )}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          {t("common.back")}
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            {t("common.cancel")}
          </button>

          <PrimaryButton onClick={onSave}>{t("common.save")}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default FormularioDetallePedido;
