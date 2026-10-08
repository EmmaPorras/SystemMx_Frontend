import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import InputField from "../common/InputField";
import MoneyInputField from "../common/MoneyInputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import { formatCurrency } from "../common/formatters";
import { getPaymentMethodLabel } from "../../i18n/statusMap";

import {
  registrarPagoVentaApi,
} from "../../services/ventasApi";

import type {
  MedioPagoVenta,
  Venta,
} from "./ventas.types";

type ModalRegistrarPagoProps = {
  isOpen: boolean;
  venta: Venta | null;

  onClose: () => void;
  onSuccess: (venta: Venta) => void;
};

function ModalRegistrarPago({
  isOpen,
  venta,
  onClose,
  onSuccess,
}: ModalRegistrarPagoProps) {
  const { t } = useTranslation();

  const [monto, setMonto] =
    useState("");

  const [metodoPago, setMetodoPago] =
    useState<MedioPagoVenta>("EFECTIVO");

  const [referencia, setReferencia] =
    useState("");

  const [observaciones, setObservaciones] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!isOpen || !venta) {
      return;
    }

    setMonto("");
    setMetodoPago(
      venta.medioPago === "MIXTO"
        ? "EFECTIVO"
        : venta.medioPago,
    );
    setReferencia("");
    setObservaciones("");
    setError(null);
  }, [
    isOpen,
    venta,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!venta || submitting) {
      return;
    }

    const montoNumero = Number(monto);

    if (
      !Number.isFinite(montoNumero) ||
      montoNumero <= 0
    ) {
      setError(
        t("validation.positiveNumber", "Ingrese un monto de pago mayor que cero."),
      );

      return;
    }

    if (
      montoNumero >
      venta.saldoPendiente
    ) {
      setError(
        `${t("sales.balance", "Saldo pendiente")}: ${formatCurrency(venta.saldoPendiente)}`,
      );

      return;
    }

    if (referencia.length > 150) {
      setError(
        t("validation.maxLength", { count: 150 }),
      );

      return;
    }

    if (observaciones.length > 1000) {
      setError(
        t("validation.maxLength", { count: 1000 }),
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const actualizada =
        await registrarPagoVentaApi(
          venta.id,
          {
            monto: montoNumero,
            metodoPago,

            referencia:
              referencia.trim() ||
              undefined,

            observaciones:
              observaciones.trim() ||
              undefined,
          },
        );

      onSuccess(actualizada);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("common.errorOccurred", "No fue posible registrar el pago."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      title={t("sales.registerPayment", "Registrar pago")}
      description={
        venta
          ? `${t("sales.title", "Venta")} #${venta.numeroVenta}`
          : t("sales.registerPayment", "Registrar pago")
      }
      onClose={onClose}
      isSubmitting={submitting}
      maxWidthClassName="max-w-xl"
    >
      {venta ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t("sales.balance", "Saldo pendiente")}
            </p>

            <p className="mt-1 text-xl font-bold text-zinc-950">
              {formatCurrency(
                venta.saldoPendiente,
              )}
            </p>
          </div>

          {error ? (
            <AlertMessage
              variant="error"
              title={t("common.errorOccurred", "No fue posible registrar el pago")}
              message={error}
              onClose={() =>
                setError(null)
              }
            />
          ) : null}

          <MoneyInputField
            label={t("sales.paymentAmount", "Monto")}
            value={monto}
            onChange={setMonto}
            required
            disabled={submitting}
            currencySymbol="₡"
            allowDecimals={true}
          />

          <SelectField
            label={t("sales.paymentMethod", "Método de pago")}
            value={metodoPago}
            onChange={(value) =>
              setMetodoPago(
                value as MedioPagoVenta,
              )
            }
            options={[
              {
                value: "EFECTIVO",
                label: getPaymentMethodLabel(t, "EFECTIVO"),
              },
              {
                value: "SINPE",
                label: getPaymentMethodLabel(t, "SINPE"),
              },
              {
                value: "TRANSFERENCIA",
                label: getPaymentMethodLabel(t, "TRANSFERENCIA"),
              },
              {
                value: "TARJETA",
                label: getPaymentMethodLabel(t, "TARJETA"),
              },
              {
                value: "MIXTO",
                label: getPaymentMethodLabel(t, "MIXTO"),
              },
              {
                value: "OTRO",
                label: getPaymentMethodLabel(t, "OTRO"),
              },
            ]}
            disabled={submitting}
          />

          <InputField
            label={t("movements.reference", "Referencia")}
            value={referencia}
            onChange={setReferencia}
            maxLength={150}
            showCharacterCount
            placeholder={t("common.optional", "Opcional")}
            disabled={submitting}
          />

          <InputField
            label={t("orders.observations", "Observaciones")}
            value={observaciones}
            onChange={setObservaciones}
            maxLength={1000}
            showCharacterCount
            placeholder={t("common.optional", "Opcional")}
            disabled={submitting}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              {t("common.cancel", "Cancelar")}
            </button>

            <PrimaryButton
              type="submit"
              loading={submitting}
              loadingText={t("common.processing", "Registrando...")}
              disabled={submitting}
            >
              {t("sales.registerPayment", "Registrar pago")}
            </PrimaryButton>
          </div>
        </form>
      ) : null}
    </AppModal>
  );
}

export default ModalRegistrarPago;
