import { useTranslation } from "react-i18next";
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
  { value: "CRC", label: "CRC - Colones costarricenses (₡)" },
  { value: "USD", label: "USD - Dólares estadounidenses ($)" },
  { value: "EUR", label: "EUR - Euros (€)" },
  { value: "COP", label: "COP - Pesos colombianos" },
  { value: "BRL", label: "BRL - Reales brasileños (R$)" },
];

function esCostaRica(pais: string) {
  return (
    pais
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase() === "costa rica"
  );
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
  const { t } = useTranslation();
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
          title={t("common.errorOccurred")}
          message={alertMessage}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 block text-sm font-semibold text-zinc-700">
            {t("orders.orderNumber")}
          </p>

          <div className="flex min-h-[42px] items-center rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 text-sm">
            <span className="font-semibold text-zinc-950">
              {pedido.numeroPedido ? `#${pedido.numeroPedido}` : "—"}
            </span>
          </div>
        </div>

        <InputField
          label={t("orders.date")}
          type="date"
          value={pedido.fecha}
          onChange={(value) => onChange("fecha", value)}
          required
          error={errors.fecha}
        />

        <SelectField
          label={t("orders.supplier")}
          value={pedido.proveedorId ? String(pedido.proveedorId) : ""}
          onChange={(value) => onChange("proveedorId", value)}
          placeholder={t("orders.supplierPlaceholder")}
          required
          error={errors.proveedorId}
          options={proveedores.map((item) => ({
            value: String(item.id),
            label: item.nombre,
          }))}
        />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
            {t("orders.origin")}
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
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
            {pedido.origen || "—"}
          </div>

          {errors.origen ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.origen}
            </p>
          ) : null}
        </div>

        <SelectField
          label={t("orders.currency")}
          value={pedido.monedaCompra}
          onChange={(value) => onChange("monedaCompra", value)}
          required
          disabled={compraLocal}
          error={errors.monedaCompra}
          options={monedas}
        />

        <div>
          <InputField
            label={t("orders.exchangeRate")}
            type="text"
            value={pedido.tipoCambio}
            onChange={(value) => onChange("tipoCambio", value)}
            placeholder={compraLocal ? "1.00" : "520.00"}
            required={!compraLocal && Boolean(pedido.proveedorId)}
            disabled={!pedido.proveedorId || compraLocal}
            error={errors.tipoCambio}
            maxLength={6}
            showCharacterCount={!compraLocal && Boolean(pedido.proveedorId)}
          />
          {!compraLocal && pedido.monedaCompra && pedido.monedaCompra !== "CRC" ? (
            <p className="mt-1 text-xs text-zinc-500">
              1 {pedido.monedaCompra} equivale a{" "}
              <span className="font-semibold text-zinc-700">
                {pedido.tipoCambio ? `₡ ${pedido.tipoCambio}` : "X CRC"}
              </span>
            </p>
          ) : null}
        </div>

        <SelectField
          label={t("common.status")}
          value={pedido.estado}
          onChange={(value) => onChange("estado", value)}
          required
          error={errors.estado}
          options={[
            { value: "REGISTRADO", label: t("statuses.orders.REGISTRADO") },
            { value: "EN_TRANSITO", label: t("statuses.orders.EN_TRANSITO") },
          ]}
        />

        <div className="sm:col-span-2">
          <InputField
            label={t("orders.observations")}
            value={pedido.observaciones}
            onChange={(value) => onChange("observaciones", value)}
            placeholder={t("orders.observationsPlaceholder")}
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
          {t("common.cancel")}
        </button>

        <PrimaryButton onClick={onSubmit}>{t("common.confirm")}</PrimaryButton>
      </div>
    </div>
  );
}

export default FormularioPedido;
