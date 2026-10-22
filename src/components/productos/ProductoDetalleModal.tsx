import { useTranslation } from "react-i18next";
import AppModal from "../common/AppModal";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import { getCatalogStatusLabel } from "../../i18n/statusMap";

import ProductoLotesSection from "./ProductoLotesSection";

import type { Producto } from "./productos.types";

type ProductoDetalleModalProps = {
  isOpen: boolean;
  producto: Producto | null;
  onClose: () => void;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function ProductoDetalleModal({
  isOpen,
  producto,
  onClose,
}: ProductoDetalleModalProps) {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      title={t("products.details")}
      description={
        producto
          ? producto.nombre
          : t("products.subtitle")
      }
      onClose={onClose}
      maxWidthClassName="max-w-4xl"
    >
      {producto ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xl font-bold text-zinc-950">
                {producto.nombre}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {producto.sku?.trim() || "—"}
              </p>
            </div>

            <StatusBadge
              label={getCatalogStatusLabel(t, producto.activo)}
              variant={
                producto.activo
                  ? "success"
                  : "neutral"
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label={t("products.category")}
              value={
                producto.categoria?.nombre ??
                "—"
              }
            />

            <DetailItem
              label={t("products.brand")}
              value={
                producto.marca?.trim() || "—"
              }
            />

            <DetailItem
              label="Variante"
              value={
                producto.variante?.trim() || "—"
              }
            />

            <DetailItem
              label={t("products.suggestedPrice")}
              value={formatCurrency(
                producto.precioVentaSugeridoSinIva,
              )}
            />

            <DetailItem
              label={t("products.stock")}
              value={producto.stockActual}
            />

            <DetailItem
              label="Stock mínimo"
              value={producto.stockMinimo}
            />

            <DetailItem
              label="IVA"
              value={
                producto.tarifaIva
                  ? `${producto.tarifaIva.codigo} · ${producto.tarifaIva.porcentaje}%`
                  : "—"
              }
            />

            <DetailItem
              label={t("common.status")}
              value={getCatalogStatusLabel(t, producto.activo)}
            />
          </div>

          <div className="border-t border-zinc-200 pt-6">
            <ProductoLotesSection
              productoId={producto.idProducto}
            />
          </div>
        </div>
      ) : null}
    </AppModal>
  );
}

export default ProductoDetalleModal;