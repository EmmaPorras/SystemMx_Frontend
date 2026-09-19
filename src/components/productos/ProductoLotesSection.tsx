import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import PaginationControls from "../common/PaginationControls";
import PrimaryButton from "../common/PrimaryButton";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";

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

function getEstadoLabel(
  estado: EstadoLoteInventario,
): string {
  switch (estado) {
    case "EN_PROCESO":
      return "EN PROCESO";

    case "EN_STOCK":
      return "EN STOCK";

    case "VENDIDO_PARCIAL":
      return "VENDIDO PARCIAL";

    case "AGOTADO":
      return "AGOTADO";
  }
}

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
        setTotalPaginas(
          response.totalPaginas,
        );
      } catch (requestError) {
        setLotes([]);
        setTotal(0);
        setTotalPaginas(0);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar los lotes del producto.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      productoId,
      pagina,
    ],
  );

  useEffect(() => {
    setPagina(1);
  }, [productoId]);

  useEffect(() => {
    void cargarLotes();
  }, [cargarLotes]);

  return (
    <div className="space-y-4 border-t border-zinc-200 pt-6">
      <div>
        <h3 className="text-base font-bold text-zinc-950">
          Lotes del producto
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Trazabilidad de inventario asociada a este producto.
        </p>
      </div>

      {loading ? (
        <div className="grid min-h-[150px] place-items-center">
          <div className="text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />

            <p className="mt-3 text-sm font-semibold text-zinc-600">
              Cargando lotes...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-3">
          <AlertMessage
            variant="error"
            title="No fue posible cargar los lotes"
            message={error}
          />

          <PrimaryButton
            onClick={() => {
              void cargarLotes();
            }}
          >
            Reintentar
          </PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4">
          <DataTableShell
            data={lotes}
            emptyMessage="Este producto todavía no tiene lotes asociados."
            getRowKey={(row) => row.idLote}
            columns={[
              {
                key: "lote",
                header: "Lote",
                render: (row) =>
                  row.codigoLote,
              },
              {
                key: "pedido",
                header: "Pedido",
                render: (row) =>
                  row.pedido
                    ? `#${row.pedido.numeroPedido}`
                    : `ID ${row.idPedido}`,
              },
              {
                key: "recibido",
                header: "Recibido",
                render: (row) =>
                  String(
                    row.cantidadRecibida,
                  ),
              },
              {
                key: "disponible",
                header: "Disponible",
                render: (row) => (
                  <span className="font-semibold">
                    {
                      row.cantidadDisponible
                    }
                  </span>
                ),
              },
              {
                key: "vendido",
                header: "Vendido",
                render: (row) =>
                  String(
                    row.cantidadVendida,
                  ),
              },
              {
                key: "costo",
                header: "Costo",
                render: (row) =>
                  formatCurrency(
                    row.costoUnitarioReal,
                  ),
              },
              {
                key: "estado",
                header: "Estado",
                render: (row) => (
                  <StatusBadge
                    label={getEstadoLabel(
                      row.estadoLote,
                    )}
                    variant={getEstadoVariant(
                      row.estadoLote,
                    )}
                  />
                ),
              },
            ]}
          />

          <PaginationControls
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            limite={LIMITE}
            onPageChange={setPagina}
          />
        </div>
      )}
    </div>
  );
}

export default ProductoLotesSection;
