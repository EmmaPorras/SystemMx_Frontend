import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import LoadingState from "../common/LoadingState";
import PaginationControls from "../common/PaginationControls";
import PrimaryButton from "../common/PrimaryButton";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import { getLotStatusLabel } from "../../i18n/statusMap";

import {
  obtenerLotesPorProductoApi,
} from "../../services/inventarioApi";

import type {
  EstadoLoteInventario,
  LoteInventario,
} from "../lotes/lotes.types";

type ProductoLotesSectionProps = {
  productoId: number;
};

const LIMITE = 5;

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
      return "warning";

    case "AGOTADO":
      return "neutral";
  }
}

function ProductoLotesSection({
  productoId,
}: ProductoLotesSectionProps) {
  const { t } = useTranslation();
  const [lotes, setLotes] =
    useState<LoteInventario[]>([]);

  const [pagina, setPagina] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPaginas, setTotalPaginas] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const cargarLotes = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await obtenerLotesPorProductoApi(
            productoId,
            {
              pagina,
              limite: LIMITE,
            },
          );

        setLotes(response.items);
        setTotal(response.total);
        setTotalPaginas(response.totalPaginas);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("errors.generic"),
        );
      } finally {
        setLoading(false);
      }
    },
    [productoId, pagina, t],
  );

  useEffect(() => {
    void cargarLotes();
  }, [cargarLotes]);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-zinc-950">
          {t("products.batchesSection")}
        </h4>
        <p className="text-xs text-zinc-500">
          {t("lots.subtitle")}
        </p>
      </div>

      {loading ? (
        <LoadingState message={t("common.loadingInfo")} />
      ) : error ? (
        <div className="space-y-3">
          <AlertMessage
            variant="error"
            title={t("common.errorOccurred")}
            message={error}
          />

          <PrimaryButton
            onClick={() => {
              void cargarLotes();
            }}
          >
            {t("common.reload")}
          </PrimaryButton>
        </div>
      ) : (
        <div className="space-y-3">
          <DataTableShell
            data={lotes}
            emptyMessage={t("products.noBatches")}
            getRowKey={(row) => row.idLote}
            columns={[
              {
                key: "codigoLote",
                header: t("orders.lotCode"),
                render: (row) => (
                  <span className="font-semibold text-zinc-950">
                    {row.codigoLote}
                  </span>
                ),
              },
              {
                key: "numeroPedido",
                header: t("orders.orderNumber"),
                render: (row) =>
                  `#${row.pedido?.numeroPedido ?? row.idPedido}`,
              },
              {
                key: "cantidadRecibida",
                header: t("lots.receivedQuantity"),
                render: (row) =>
                  row.cantidadRecibida,
              },
              {
                key: "cantidadDisponible",
                header: t("lots.availableQuantity"),
                render: (row) => (
                  <span className="font-semibold text-zinc-950">
                    {row.cantidadDisponible}
                  </span>
                ),
              },
              {
                key: "costoUnitario",
                header: t("lots.costReal"),
                render: (row) =>
                  formatCurrency(
                    row.costoUnitarioReal,
                  ),
              },
              {
                key: "estado",
                header: t("common.status"),
                render: (row) => (
                  <StatusBadge
                    label={getLotStatusLabel(t, row.estadoLote)}
                    variant={getEstadoVariant(
                      row.estadoLote,
                    )}
                  />
                ),
              },
            ]}
          />

          {total > 0 ? (
            <PaginationControls
              pagina={pagina}
              totalPaginas={totalPaginas}
              total={total}
              limite={LIMITE}
              onPageChange={setPagina}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default ProductoLotesSection;
