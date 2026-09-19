import AppModal from "../common/AppModal";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";

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
  return (
    <AppModal
      isOpen={isOpen}
      title="Detalle del producto"
      description={
        producto
          ? producto.nombre
          : "Información del producto."
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
                {producto.sku?.trim() || "Sin SKU"}
              </p>
            </div>

            <StatusBadge
              label={
                producto.activo
                  ? "ACTIVO"
                  : "INACTIVO"
              }
              variant={
                producto.activo
                  ? "success"
                  : "neutral"
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Categoría"
              value={
                producto.categoria?.nombre ??
                "Sin categoría"
              }
            />

            <DetailItem
              label="Marca"
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
              label="Stock actual"
              value={producto.stockActual}
            />

            <DetailItem
              label="Stock mínimo"
              value={producto.stockMinimo}
            />

            <DetailItem
              label="Precio sugerido sin IVA"
              value={formatCurrency(
                producto.precioVentaSugeridoSinIva,
              )}
            />

            <DetailItem
              label="Precio estándar con IVA"
              value={
                producto.precioVentaEstandarConIva !==
                null &&
                producto.precioVentaEstandarConIva !==
                undefined
                  ? formatCurrency(
                      producto.precioVentaEstandarConIva,
                    )
                  : "—"
              }
            />

            <DetailItem
              label="Costo de referencia"
              value={
                producto.costoReferencia !== null &&
                producto.costoReferencia !== undefined
                  ? formatCurrency(
                      producto.costoReferencia,
                    )
                  : "—"
              }
            />

            <DetailItem
              label="Tarifa IVA"
              value={
                producto.tarifaIva
                  ? `${producto.tarifaIva.codigo} · ${producto.tarifaIva.porcentaje}%`
                  : "Sin tarifa"
              }
            />
          </div>

          {producto.descripcion?.trim() ? (
            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Descripción
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {producto.descripcion}
              </p>
            </div>
          ) : null}

          {producto.observaciones?.trim() ? (
            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Observaciones
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {producto.observaciones}
              </p>
            </div>
          ) : null}

          <ProductoLotesSection
            productoId={producto.idProducto}
          />
        </div>
      ) : null}
    </AppModal>
  );
}

export default ProductoDetalleModal;