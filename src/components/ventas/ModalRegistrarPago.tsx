import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";
import { formatCurrency } from "../common/formatters";

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
        "Ingrese un monto de pago mayor que cero.",
      );

      return;
    }

    if (
      montoNumero >
      venta.saldoPendiente
    ) {
      setError(
        `El pago no puede superar el saldo pendiente de ${formatCurrency(
          venta.saldoPendiente,
        )}.`,
      );

      return;
    }

    if (referencia.length > 150) {
      setError(
        "La referencia no puede superar 150 caracteres.",
      );

      return;
    }

    if (observaciones.length > 1000) {
      setError(
        "Las observaciones no pueden superar 1000 caracteres.",
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
          : "No fue posible registrar el pago.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      title="Registrar pago"
      description={
        venta
          ? `Venta #${venta.numeroVenta}`
          : "Registrar pago de venta"
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
              Saldo pendiente
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
              title="No fue posible registrar el pago"
              message={error}
              onClose={() =>
                setError(null)
              }
            />
          ) : null}

          <InputField
            label="Monto"
            type="number"
            value={monto}
            onChange={setMonto}
            min={0.01}
            step={0.01}
            required
            disabled={submitting}
          />

          <SelectField
            label="Método de pago"
            value={metodoPago}
            onChange={(value) =>
              setMetodoPago(
                value as MedioPagoVenta,
              )
            }
            options={[
              {
                value: "EFECTIVO",
                label: "Efectivo",
              },
              {
                value: "SINPE",
                label: "SINPE",
              },
              {
                value: "TRANSFERENCIA",
                label: "Transferencia",
              },
              {
                value: "TARJETA",
                label: "Tarjeta",
              },
              {
                value: "MIXTO",
                label: "Mixto",
              },
              {
                value: "OTRO",
                label: "Otro",
              },
            ]}
            disabled={submitting}
          />

          <InputField
            label="Referencia"
            value={referencia}
            onChange={setReferencia}
            maxLength={150}
            showCharacterCount
            placeholder="Opcional"
            disabled={submitting}
          />

          <InputField
            label="Observaciones"
            value={observaciones}
            onChange={setObservaciones}
            maxLength={1000}
            showCharacterCount
            placeholder="Opcional"
            disabled={submitting}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            <PrimaryButton
              type="submit"
              loading={submitting}
              loadingText="Registrando..."
              disabled={submitting}
            >
              Registrar pago
            </PrimaryButton>
          </div>
        </form>
      ) : null}
    </AppModal>
  );
}

export default ModalRegistrarPago;
