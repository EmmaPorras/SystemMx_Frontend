import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import type {
  MonedaCompra,
  PedidoCabeceraFormErrors,
  PedidoCompra,
} from "./pedidos.types";

type ProveedorPedidoOption = {
  id: number;
  nombre: string;
  pais: string;
};

type FormularioPedidoProps = {
  pedido: PedidoCompra;
  proveedores: ProveedorPedidoOption[];
  errors: PedidoCabeceraFormErrors;
  alertMessage?: string | null;
  onChange: (field: keyof PedidoCompra, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const monedas: Array<{ value: MonedaCompra; label: string }> = [
  { value: "CRC", label: "₡ CRC - Colones" },
  { value: "USD", label: "$ USD - Dólares" },
  { value: "EUR", label: "€ EUR - Euros" },
  { value: "COP", label: "COP - Pesos colombianos" },
  { value: "BRL", label: "R$ BRL - Reales brasileños" },
];

function FormularioPedido({
  pedido,
  proveedores,
  errors,
  alertMessage,
  onChange,
  onSubmit,
  onCancel,
}: FormularioPedidoProps) {
  return (
    <div className="space-y-5">
      {alertMessage ? (
        <AlertMessage
          variant="error"
          title="Revisá la información"
          message={alertMessage}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Número de pedido<span className="ml-1 text-red-500">*</span>
          </label>

          <div
            className={`flex overflow-hidden rounded-2xl border ${
              errors.numeroPedido
                ? "border-red-400 bg-red-50"
                : "border-slate-300 bg-white"
            }`}
          >
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
              Pedido N°
            </span>

            <input
              value={pedido.numeroPedido}
              onChange={(event) =>
                onChange("numeroPedido", event.target.value)
              }
              maxLength={3}
              inputMode="numeric"
              placeholder="1"
              className="w-full bg-transparent px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="mt-1 flex justify-between gap-3">
            {errors.numeroPedido ? (
              <p className="text-xs font-medium text-red-600">
                {errors.numeroPedido}
              </p>
            ) : null}

            <p className="ml-auto text-xs text-slate-400">
              {pedido.numeroPedido.length}/3
            </p>
          </div>
        </div>

        <InputField
          label="Fecha"
          type="date"
          value={pedido.fecha}
          onChange={(value) => onChange("fecha", value)}
          required
          error={errors.fecha}
        />

        <SelectField
          label="Proveedor"
          value={pedido.proveedorId ? String(pedido.proveedorId) : ""}
          onChange={(value) => onChange("proveedorId", value)}
          placeholder="Seleccione un proveedor"
          required
          error={errors.proveedorId}
          options={proveedores.map((item) => ({
            value: String(item.id),
            label: item.nombre,
          }))}
        />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            País de origen<span className="ml-1 text-red-500">*</span>
          </label>

          <div
            className={`flex min-h-[42px] items-center rounded-2xl border px-4 py-2.5 text-sm ${
              errors.origen
                ? "border-red-400 bg-red-50 text-red-700"
                : pedido.origen
                  ? "border-slate-300 bg-slate-50 font-semibold text-slate-800"
                  : "border-slate-300 bg-slate-50 text-slate-400"
            }`}
          >
            {pedido.origen || "Se completará al seleccionar el proveedor"}
          </div>

          {errors.origen ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.origen}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Este dato se toma automáticamente del proveedor.
            </p>
          )}
        </div>

        <SelectField
          label="Moneda"
          value={pedido.monedaCompra}
          onChange={(value) => onChange("monedaCompra", value)}
          required
          error={errors.monedaCompra}
          options={monedas}
        />

        <InputField
          label="Tipo de cambio"
          type="text"
          value={pedido.tipoCambio}
          onChange={(value) => onChange("tipoCambio", value)}
          placeholder="506.25"
          required
          error={errors.tipoCambio}
          maxLength={6}
          helperText="Ejemplo: 445.00"
          showCharacterCount
        />

        <SelectField
          label="Estado"
          value={pedido.estado}
          onChange={(value) => onChange("estado", value)}
          required
          error={errors.estado}
          options={[
            { value: "REGISTRADO", label: "Registrado" },
            { value: "EN_TRANSITO", label: "En tránsito" },
            { value: "RECIBIDO", label: "Recibido" },
            { value: "CANCELADO", label: "Cancelado" },
          ]}
        />

        <div className="md:col-span-2">
          <InputField
            label="Observaciones"
            value={pedido.observaciones}
            onChange={(value) => onChange("observaciones", value)}
            placeholder="Notas del pedido"
            error={errors.observaciones}
            maxLength={150}
            showCharacterCount
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancelar
        </button>

        <PrimaryButton onClick={onSubmit}>Siguiente</PrimaryButton>
      </div>
    </div>
  );
}

export default FormularioPedido;
