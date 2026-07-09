import { Pencil, Trash2 } from "lucide-react";
import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import { formatCurrency } from "../common/formatters";
import type {
  PedidoCompra,
  PedidoDetalle,
  PedidoDetalleForm,
  PedidoDetalleFormErrors,
} from "./pedidos.types";

type FormularioDetallePedidoProps = {
  pedido: PedidoCompra;
  detalleForm: PedidoDetalleForm;
  errors: PedidoDetalleFormErrors;
  alertMessage?: string | null;
  isEditingDetail: boolean;
  onDetalleChange: (field: keyof PedidoDetalleForm, value: string) => void;
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

function FormularioDetallePedido({
  pedido,
  detalleForm,
  errors,
  alertMessage,
  isEditingDetail,
  onDetalleChange,
  onAgregarDetalle,
  onEditarDetalle,
  onCancelarEdicionDetalle,
  onEliminarDetalle,
  onBack,
  onSave,
  onCancel,
}: FormularioDetallePedidoProps) {
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
          <div className="xl:col-span-2">
            <InputField
              label="Nombre del artículo"
              value={detalleForm.productoNombre}
              onChange={(value) => onDetalleChange("productoNombre", value)}
              placeholder="Careta blanca, led blanco/amarillo..."
              required
              error={errors.productoNombre}
              maxLength={50}
              showCharacterCount
            />
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
            required
            error={errors.costoUnitarioOrigen}
            maxLength={8}
            showCharacterCount
          />

          <InputField
            label="Precio de venta recomendado"
            type="text"
            value={detalleForm.precioVentaRecomendado}
            onChange={(value) =>
              onDetalleChange("precioVentaRecomendado", value)
            }
            required
            error={errors.precioVentaRecomendado}
            maxLength={8}
            showCharacterCount
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
            {isEditingDetail ? "Actualizar artículo/lote" : "+ Agregar artículo/lote"}
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
              render: (row: PedidoDetalle) => row.productoNombre,
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
                formatCurrency(row.costoUnitarioOrigen),
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