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

function esCostaRica(pais: string) {
  return pais
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() === "costa rica";
}

function FormularioPedido({
  pedido,
  proveedores,
  errors,
  alertMessage,
  onChange,
  onSubmit,
  onCancel,
}: FormularioPedidoProps) {
  const proveedorSeleccionado = proveedores.find(
    (item) => item.id === pedido.proveedorId,
  );

  const compraLocal =
    Boolean(proveedorSeleccionado) &&
    esCostaRica(proveedorSeleccionado?.pais ?? pedido.origen);

  return (
    <div className="space-y-5">
      {alertMessage ? (
        <AlertMessage
          variant="error"
          title="Revisá la información"
          message={alertMessage}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Número de pedido
          </p>

          <div className="flex min-h-[42px] items-center rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 text-sm">
            <span className="font-semibold text-zinc-900">
              {pedido.numeroPedido
                ? `Pedido #${pedido.numeroPedido}`
                : "Calculando número..."}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-zinc-500">
            El número se asigna automáticamente y no se puede editar.
          </p>
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
          <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
            País de origen<span className="ml-1 text-red-500" aria-hidden="true">*</span>
          </label>

          <div
            className={`flex min-h-[42px] items-center rounded-xl border px-3.5 py-2.5 text-sm ${
              errors.origen
                ? "border-red-400 bg-red-50/50 text-red-700"
                : pedido.origen
                  ? "border-zinc-300 bg-zinc-50 font-semibold text-zinc-800"
                  : "border-zinc-300 bg-zinc-50 text-zinc-400"
            }`}
          >
            {pedido.origen || "Se completará al seleccionar el proveedor"}
          </div>

          {errors.origen ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.origen}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-400">
              Este dato se toma automáticamente del proveedor.
            </p>
          )}
        </div>

        <SelectField
          label="Moneda"
          value={pedido.monedaCompra}
          onChange={(value) => onChange("monedaCompra", value)}
          required
          disabled={compraLocal}
          error={errors.monedaCompra}
          options={monedas}
        />

        <InputField
          label="Tipo de cambio"
          type="text"
          value={pedido.tipoCambio}
          onChange={(value) => onChange("tipoCambio", value)}
          placeholder={compraLocal ? "1.00" : "Ejemplo: 445.00"}
          required={!compraLocal && Boolean(pedido.proveedorId)}
          disabled={!pedido.proveedorId || compraLocal}
          error={errors.tipoCambio}
          maxLength={6}
          helperText={
            !pedido.proveedorId
              ? "Seleccioná un proveedor para definir el tipo de cambio."
              : compraLocal
                ? "Compra nacional: se utiliza automáticamente 1 CRC = 1 CRC."
                : "Obligatorio para proveedores fuera de Costa Rica."
          }
          showCharacterCount={!compraLocal && Boolean(pedido.proveedorId)}
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
          ]}
        />

        <div className="sm:col-span-2">
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

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          Cancelar
        </button>

        <PrimaryButton onClick={onSubmit}>Siguiente</PrimaryButton>
      </div>
    </div>
  );
}

export default FormularioPedido;
