import {
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import {
  Boxes,
  CalendarDays,
  Hash,
  PackageCheck,
  ReceiptText,
  Tag,
  WalletCards,
  X,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";
import {
  formatCurrency,
  formatDate,
} from "../common/formatters";
import {
  getLotStatusLabel,
  getOrderStatusLabel,
} from "../../i18n/statusMap";

import type {
  EstadoLoteInventario,
  LoteInventario,
} from "./lotes.types";

type LoteDetalleModalProps = {
  isOpen: boolean;

  lote:
    | LoteInventario
    | null;

  onClose: () => void;
};

function getEstadoVariant(
  estado: EstadoLoteInventario,
):
  | "success"
  | "warning"
  | "neutral"
  | "danger" {
  switch (estado) {
    case "EN_STOCK":
      return "success";

    case "EN_PROCESO":
      return "warning";

    case "VENDIDO_PARCIAL":
      return "neutral";

    case "AGOTADO":
      return "danger";
  }
}

function formatearFecha(
  fecha:
    | string
    | null
    | undefined,
) {
  if (!fecha) {
    return "—";
  }
  return formatDate(fecha);
}

function formatearMonedaNullable(
  valor:
    | number
    | null
    | undefined,
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "—";
  }

  return formatCurrency(
    valor,
  );
}

type DetailItemProps = {
  label: string;

  value:
    | string
    | number
    | null
    | undefined;
};

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  const valorMostrar =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : value;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-zinc-950">
        {valorMostrar}
      </p>
    </div>
  );
}

function LoteDetalleModal({
  isOpen,
  lote,
  onClose,
}: LoteDetalleModalProps) {
  const { t } = useTranslation();

  /*
   * ==========================================
   * CERRAR CON ESC
   * ==========================================
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    onClose,
  ]);

  if (
    !isOpen ||
    !lote
  ) {
    return null;
  }

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-60
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-[2px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="lote-detalle-title"
      onPointerDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-2xl
          border
          border-zinc-200
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white shadow-sm">
              <Boxes
                size={21}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                {t("lots.details", "Información del lote")}
              </p>

              <h2
                id="lote-detalle-title"
                className="mt-1 truncate text-xl font-black text-zinc-950"
              >
                {
                  lote.codigoLote
                }
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {t("lots.subtitle", "Consulta de trazabilidad e inventario.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label={t("common.close", "Cerrar")}
            className="
              grid
              h-9
              w-9
              shrink-0
              place-items-center
              rounded-xl
              border
              border-zinc-200
              bg-white
              text-zinc-500
              transition
              hover:bg-zinc-100
              hover:text-zinc-950
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-zinc-950
            "
          >
            <X
              size={18}
            />
          </button>
        </div>

        {/* CONTENIDO */}

        <div className="space-y-6 p-5 sm:p-6">
          {/* ESTADO */}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {t("lots.status", "Estado actual")}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {t("lots.subtitle", "Situación actual del lote dentro del inventario.")}
              </p>
            </div>

            <StatusBadge
              label={getLotStatusLabel(
                t,
                lote.estadoLote,
              )}
              variant={getEstadoVariant(
                lote.estadoLote,
              )}
            />
          </div>

          {/* IDENTIFICACIÓN */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash
                size={17}
                className="text-zinc-500"
              />

              <h3 className="text-sm font-bold text-zinc-950">
                {t("common.details", "Identificación")}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label={`ID ${t("lots.title", "Lote")}`}
                value={
                  lote.idLote
                }
              />

              <DetailItem
                label={t("lots.lotCode", "Código del lote")}
                value={
                  lote.codigoLote
                }
              />

              <DetailItem
                label={`ID ${t("orders.details", "Detalle pedido")}`}
                value={
                  lote.idDetallePedido
                }
              />
            </div>
          </section>

          {/* PRODUCTO */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag
                size={17}
                className="text-zinc-500"
              />

              <h3 className="text-sm font-bold text-zinc-950">
                {t("products.title", "Producto")}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                label={t("products.name", "Producto")}
                value={
                  lote.producto
                    ?.nombre ??
                  `Producto #${lote.idProducto}`
                }
              />

              <DetailItem
                label={`ID ${t("products.title", "Producto")}`}
                value={
                  lote.idProducto
                }
              />
            </div>
          </section>

          {/* PEDIDO */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ReceiptText
                size={17}
                className="text-zinc-500"
              />

              <h3 className="text-sm font-bold text-zinc-950">
                {t("orders.title", "Pedido de origen")}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label={t("orders.orderNumber", "Número de pedido")}
                value={
                  lote.pedido
                    ? `#${lote.pedido.numeroPedido}`
                    : "—"
                }
              />

              <DetailItem
                label={`ID ${t("navigation.orders", "Pedido")}`}
                value={
                  lote.idPedido
                }
              />

              <DetailItem
                label={t("orders.status", "Estado del pedido")}
                value={getOrderStatusLabel(
                  t,
                  lote.pedido?.estado,
                )}
              />
            </div>
          </section>

          {/* INVENTARIO */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <PackageCheck
                size={17}
                className="text-zinc-500"
              />

              <h3 className="text-sm font-bold text-zinc-950">
                {t("navigation.inventory", "Inventario")}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label={t("lots.initialQuantity", "Cantidad inicial")}
                value={
                  lote.cantidadInicial
                }
              />

              <DetailItem
                label={t("lots.receivedQuantity", "Cantidad recibida")}
                value={
                  lote.cantidadRecibida
                }
              />

              <DetailItem
                label={t("lots.availableQuantity", "Cantidad disponible")}
                value={
                  lote.cantidadDisponible
                }
              />

              <DetailItem
                label={t("home.unitsSold", "Cantidad vendida")}
                value={
                  lote.cantidadVendida
                }
              />

              <DetailItem
                label={t("orders.pending", "Pendiente recepción")}
                value={
                  lote.cantidadPendienteRecepcion
                }
              />
            </div>
          </section>

          {/* INFORMACIÓN ECONÓMICA */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <WalletCards
                size={17}
                className="text-zinc-500"
              />

              <h3 className="text-sm font-bold text-zinc-950">
                {t("orders.totalInvestment", "Información económica")}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                label={t("lots.costReal", "Costo unitario real")}
                value={formatearMonedaNullable(
                  lote.costoUnitarioReal,
                )}
              />

              <DetailItem
                label={t("lots.salePrice", "Precio recomendado")}
                value={formatearMonedaNullable(
                  lote.precioVentaRecomendado,
                )}
              />
            </div>
          </section>

          {/* TRAZABILIDAD */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays
                size={17}
                className="text-zinc-500"
              />

              <h3 className="text-sm font-bold text-zinc-950">
                {t("navigation.batchesDesc", "Trazabilidad")}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                label={t("orders.receptionDate", "Fecha de entrada")}
                value={formatearFecha(
                  lote.fechaEntrada,
                )}
              />

              <DetailItem
                label={t("lots.status", "Estado del lote")}
                value={getLotStatusLabel(
                  t,
                  lote.estadoLote,
                )}
              />
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex justify-end border-t border-zinc-200 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={
              onClose
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              rounded-xl
              bg-zinc-950
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-zinc-800
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-zinc-950
              focus-visible:ring-offset-2
            "
          >
            {t("common.close", "Cerrar")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default LoteDetalleModal;