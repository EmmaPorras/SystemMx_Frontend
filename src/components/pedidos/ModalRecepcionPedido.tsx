import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import AlertMessage from "../common/AlertMessage";
import AppModal from "../common/AppModal";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PrimaryButton from "../common/PrimaryButton";
import { useTranslation } from "react-i18next";

import {
  obtenerPedidoApi,
  registrarRecepcionPedidoApi,
} from "../../services/pedidosApi";

import {
  obtenerCantidadPendiente,
  puedeRecibirPedido,
} from "./recepcionPedido.utils";

import type {
  PedidoCompra,
  RecepcionPedidoDetallePayload,
} from "./pedidos.types";

type ModalRecepcionPedidoProps = {
  isOpen: boolean;
  pedidoId: number | null;
  onClose: () => void;
  onSuccess: (pedido: PedidoCompra) => void;
};

type CantidadesPorLote = Record<number, string>;
type ErroresPorLote = Record<number, string>;

function obtenerFechaLocalActual(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ModalRecepcionPedido({
  isOpen,
  pedidoId,
  onClose,
  onSuccess,
}: ModalRecepcionPedidoProps) {
  const { t } = useTranslation();
  const [pedido, setPedido] = useState<PedidoCompra | null>(null);
  const [fechaRecepcion, setFechaRecepcion] = useState("");
  const [cantidades, setCantidades] = useState<CantidadesPorLote>({});
  const [erroresPorLote, setErroresPorLote] = useState<ErroresPorLote>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPedido = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setPedido(null);
    setCantidades({});
    setErroresPorLote({});
    setFechaRecepcion(obtenerFechaLocalActual());

    try {
      const data = await obtenerPedidoApi(id);
      setPedido(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar el pedido.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || pedidoId === null) return;
    void cargarPedido(pedidoId);
  }, [isOpen, pedidoId, cargarPedido]);

  const detalles = useMemo(() => pedido?.detalles ?? [], [pedido]);

  function cambiarCantidad(idLote: number, value: string) {
    setCantidades((current) => ({
      ...current,
      [idLote]: value,
    }));

    setErroresPorLote((current) => ({
      ...current,
      [idLote]: "",
    }));

    setError(null);
  }

  function construirDetallesRecepcion():
    | RecepcionPedidoDetallePayload[]
    | null {
    const payload: RecepcionPedidoDetallePayload[] = [];
    const nuevosErrores: ErroresPorLote = {};

    for (const detalle of detalles) {
      if (detalle.loteId === undefined) continue;

      const raw = cantidades[detalle.loteId]?.trim() ?? "";
      if (!raw || raw === "0") continue;

      const cantidad = Number(raw);
      const pendiente = obtenerCantidadPendiente(detalle);

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        nuevosErrores[detalle.loteId] =
          "Ingrese un número entero mayor que cero.";
        continue;
      }

      if (cantidad > pendiente) {
        nuevosErrores[detalle.loteId] = `Máximo pendiente: ${pendiente}.`;
        continue;
      }

      payload.push({
        idLote: detalle.loteId,
        cantidadRecibida: cantidad,
      });
    }

    setErroresPorLote(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return null;
    }

    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !pedido || pedidoId === null) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaRecepcion)) {
      setError("Seleccione una fecha de recepción válida.");
      return;
    }

    const detallesRecepcion = construirDetallesRecepcion();
    if (!detallesRecepcion) {
      setError("Revise las cantidades indicadas.");
      return;
    }

    if (detallesRecepcion.length === 0) {
      setError("Ingrese al menos una cantidad para recibir.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const actualizado = await registrarRecepcionPedidoApi(pedidoId, {
        fechaRecepcion,
        detalles: detallesRecepcion,
      });

      onSuccess(actualizado);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible registrar la recepción.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      title={
        pedido
          ? t("orders.receiveModalTitle", { number: pedido.numeroPedido })
          : t("orders.receiveOrder")
      }
      description={t("orders.subtitle")}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      isSubmitting={isSubmitting}
      maxWidthClassName="max-w-6xl"
    >
      {loading ? (
        <LoadingState message={t("common.loading")} />
      ) : error && !pedido ? (
        <div className="space-y-4">
          <AlertMessage
            variant="error"
            title="No fue posible cargar el pedido"
            message={error}
          />

          {pedidoId !== null ? (
            <PrimaryButton
              onClick={() => {
                void cargarPedido(pedidoId);
              }}
            >
              Reintentar
            </PrimaryButton>
          ) : null}
        </div>
      ) : pedido ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <AlertMessage
              variant="error"
              title="No fue posible registrar la recepción"
              message={error}
              onClose={() => setError(null)}
            />
          ) : null}

          {!puedeRecibirPedido(pedido) ? (
            <AlertMessage
              variant="info"
              title="Sin mercancía pendiente"
              message="Este pedido no tiene lotes pendientes que puedan recibirse."
            />
          ) : null}

          <div className="max-w-xs">
            <InputField
              label={t("orders.receptionDateLabel")}
              type="date"
              value={fechaRecepcion}
              onChange={(value) => {
                setFechaRecepcion(value);
                setError(null);
              }}
              required
            />
          </div>

          <DataTableShell
            data={detalles}
            emptyMessage="El pedido no contiene detalles."
            getRowKey={(row) =>
              `${row.loteId ?? "sin-lote"}-${row.loteCodigo}`
            }
            columns={[
              {
                key: "producto",
                header: t("products.title"),
                render: (row) => row.productoNombre,
              },
              {
                key: "lote",
                header: t("orders.lotCode"),
                render: (row) => row.loteCodigo,
              },
              {
                key: "pedido",
                header: t("orders.title"),
                render: (row) => String(row.cantidad),
              },
              {
                key: "recibido",
                header: t("orders.quantityReceived"),
                render: (row) => String(row.cantidadRecibida ?? 0),
              },
              {
                key: "pendiente",
                header: t("orders.pending"),
                render: (row) => String(obtenerCantidadPendiente(row)),
              },
              {
                key: "recibir",
                header: t("orders.receiveOrder"),
                render: (row) => {
                  const pendiente = obtenerCantidadPendiente(row);

                  if (row.loteId === undefined) {
                    return (
                      <span className="text-sm text-zinc-500">
                        Lote sin identificar
                      </span>
                    );
                  }

                  if (pendiente === 0) {
                    return (
                      <span className="text-sm font-semibold text-zinc-500">
                        Completo
                      </span>
                    );
                  }

                  return (
                    <div className="min-w-36">
                      <InputField
                        label="Cantidad"
                        type="number"
                        value={cantidades[row.loteId] ?? ""}
                        onChange={(value) =>
                          cambiarCantidad(row.loteId!, value)
                        }
                        min={0}
                        max={pendiente}
                        step={1}
                        error={erroresPorLote[row.loteId]}
                        disabled={isSubmitting}
                      />
                    </div>
                  );
                },
              },
            ]}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>

            {puedeRecibirPedido(pedido) ? (
              <PrimaryButton
                type="submit"
                loading={isSubmitting}
                loadingText={t("common.processing")}
              >
                {t("orders.confirmReception")}
              </PrimaryButton>
            ) : null}
          </div>
        </form>
      ) : null}
    </AppModal>
  );
}

export default ModalRecepcionPedido;
