import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import { formatCurrency } from "../common/formatters";
import { buscarProductosSugeridosApi } from "../../services/pedidosApi";
import type {
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
  errors: PedidoDetalleFormErrors;
  alertMessage?: string | null;
  isEditingDetail: boolean;
  onDetalleChange: (field: keyof PedidoDetalleForm, value: string) => void;
  onSeleccionarProducto: (producto: ProductoSugerido) => void;
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

function FormularioDetallePedido({
  pedido,
  detalleForm,
  errors,
  alertMessage,
  isEditingDetail,
  onDetalleChange,
  onSeleccionarProducto,
  onAgregarDetalle,
  onEditarDetalle,
  onCancelarEdicionDetalle,
  onEliminarDetalle,
  onBack,
  onSave,
  onCancel,
}: FormularioDetallePedidoProps) {
  const simboloMoneda = getMonedaSymbol(pedido.monedaCompra);

  const [sugerencias, setSugerencias] = useState<ProductoSugerido[]>([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

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
          title="Revisá la información"
          message={alertMessage}
        />
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">
          {pedido.numeroPedido || "Nuevo pedido"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {pedido.proveedorNombre || "Proveedor no seleccionado"} ·{" "}
          {pedido.fecha} · {pedido.monedaCompra}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-950">
            {isEditingDetail
              ? "Editar artículo del pedido"
              : "Agregar artículo al pedido"}
          </h3>
          <p className="text-sm text-slate-600">
            Cada línea representa un artículo asociado a un lote específico.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nombre del artículo
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
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
              placeholder="Careta blanca, led blanco/amarillo..."
              maxLength={50}
              aria-invalid={Boolean(errors.productoNombre)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition ${
                errors.productoNombre
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-300 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              }`}
            />

            <div className="mt-1 flex items-start justify-between gap-3">
              <div>
                {errors.productoNombre ? (
                  <p className="text-xs font-medium text-red-600">
                    {errors.productoNombre}
                  </p>
                ) : detalleForm.productoId ? (
                  <p className="text-xs font-medium text-emerald-700">
                    Producto existente seleccionado · ID{" "}
                    {detalleForm.productoId}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Escribí al menos 2 letras para buscar productos ya
                    registrados.
                  </p>
                )}
              </div>

              <p
                className={`shrink-0 text-xs ${
                  detalleForm.productoNombre.length >= 50
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                {detalleForm.productoNombre.length}/50
              </p>
            </div>

            {debeMostrarListaSugerencias ? (
              <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {cargandoSugerencias ? (
                  <p className="px-4 py-3 text-sm text-slate-500">
                    Buscando productos...
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
                        className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {producto.nombre}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          ID {producto.id}
                          {producto.precioVentaSugerido > 0
                            ? ` · Precio sugerido ${formatCurrency(
                                producto.precioVentaSugerido,
                              )}`
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
            label="Lote"
            value={detalleForm.loteCodigo}
            onChange={(value) => onDetalleChange("loteCodigo", value)}
            placeholder="Seleccione lote"
            required
            error={errors.loteCodigo}
            options={loteOptions}
          />

          <InputField
            label="Cantidad"
            type="text"
            value={detalleForm.cantidad}
            onChange={(value) => onDetalleChange("cantidad", value)}
            required
            error={errors.cantidad}
            maxLength={5}
            showCharacterCount
          />

          <InputField
            label="Precio de costo"
            type="text"
            value={detalleForm.costoUnitarioOrigen}
            onChange={(value) => onDetalleChange("costoUnitarioOrigen", value)}
            placeholder="0.00"
            required
            error={errors.costoUnitarioOrigen}
            maxLength={8}
            showCharacterCount
            prefix={simboloMoneda}
          />

          <InputField
            label="Precio de venta recomendado"
            type="text"
            value={detalleForm.precioVentaRecomendado}
            onChange={(value) =>
              onDetalleChange("precioVentaRecomendado", value)
            }
            placeholder="0"
            required
            error={errors.precioVentaRecomendado}
            maxLength={8}
            showCharacterCount
            prefix="₡"
          />

          <SelectField
            label="Estado del lote"
            value={detalleForm.estadoLote}
            onChange={(value) => onDetalleChange("estadoLote", value)}
            required
            error={errors.estadoLote}
            options={[
              { value: "EN_PROCESO", label: "En proceso" },
              { value: "EN_STOCK", label: "En stock" },
              { value: "VENDIDO_PARCIAL", label: "Vendido parcial" },
              { value: "AGOTADO", label: "Agotado" },
            ]}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryButton onClick={onAgregarDetalle}>
            {isEditingDetail
              ? "Actualizar artículo/lote"
              : "+ Agregar artículo/lote"}
          </PrimaryButton>

          {isEditingDetail ? (
            <button
              type="button"
              onClick={onCancelarEdicionDetalle}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar edición
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-950">
          Artículos agregados
        </h3>

        <DataTableShell
          data={pedido.detalles}
          emptyMessage="Todavía no has agregado artículos a este pedido."
          getRowKey={(row) => row.idTemporal}
          columns={[
            {
              key: "producto",
              header: "Artículo",
              render: (row: PedidoDetalle) => (
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
              render: (row: PedidoDetalle) => row.loteCodigo,
            },
            {
              key: "cantidad",
              header: "Cantidad",
              render: (row: PedidoDetalle) => row.cantidad,
            },
            {
              key: "costo",
              header: "Costo",
              render: (row: PedidoDetalle) =>
                formatMoneyByMoneda(
                  row.costoUnitarioOrigen,
                  pedido.monedaCompra,
                ),
            },
            {
              key: "precio",
              header: "Precio venta",
              render: (row: PedidoDetalle) =>
                formatCurrency(row.precioVentaRecomendado),
            },
          ]}
          actions={(row) => (
            <>
              <button
                type="button"
                onClick={() => onEditarDetalle(row)}
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Editar artículo"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onEliminarDetalle(row.idTemporal)}
                className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                aria-label="Eliminar artículo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
      </div>

      <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Atrás
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

          <PrimaryButton onClick={onSave}>Guardar pedido</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default FormularioDetallePedido;