import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Boxes,
  PackageCheck,
  PackageOpen,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PaginationControls from "../common/PaginationControls";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";

import {
  obtenerLotesInventarioApi,
} from "../../services/inventarioApi";

import TablaLotes from "./TablaLotes";

import type {
  EstadoLoteInventario,
  LoteInventario,
  LotesQuery,
} from "./lotes.types";

type FiltrosLotes = {
  productoId: string;
  pedidoId: string;
  estadoLote: "" | EstadoLoteInventario;
};

const INITIAL_FILTERS: FiltrosLotes = {
  productoId: "",
  pedidoId: "",
  estadoLote: "",
};

const LIMITE = 20;

function LotesPage() {
  const [lotes, setLotes] =
    useState<LoteInventario[]>([]);

  const [filtrosDraft, setFiltrosDraft] =
    useState<FiltrosLotes>(
      INITIAL_FILTERS,
    );

  const [filtros, setFiltros] =
    useState<FiltrosLotes>(
      INITIAL_FILTERS,
    );

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

      const query: LotesQuery = {
        pagina,
        limite: LIMITE,
      };

      const productoId =
        Number(filtros.productoId);

      const pedidoId =
        Number(filtros.pedidoId);

      if (
        filtros.productoId &&
        Number.isInteger(productoId) &&
        productoId > 0
      ) {
        query.productoId = productoId;
      }

      if (
        filtros.pedidoId &&
        Number.isInteger(pedidoId) &&
        pedidoId > 0
      ) {
        query.pedidoId = pedidoId;
      }

      if (filtros.estadoLote) {
        query.estadoLote =
          filtros.estadoLote;
      }

      try {
        const response =
          await obtenerLotesInventarioApi(
            query,
          );

        setLotes(response.items);
        setTotal(response.total);
        setTotalPaginas(
          response.totalPaginas,
        );

        if (
          response.totalPaginas > 0 &&
          pagina > response.totalPaginas
        ) {
          setPagina(
            response.totalPaginas,
          );
        }
      } catch (requestError) {
        setLotes([]);
        setTotal(0);
        setTotalPaginas(0);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar los lotes.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      pagina,
      filtros,
    ],
  );

  useEffect(() => {
    void cargarLotes();
  }, [cargarLotes]);

  function aplicarFiltros() {
    setPagina(1);
    setFiltros(filtrosDraft);
  }

  function limpiarFiltros() {
    setFiltrosDraft(
      INITIAL_FILTERS,
    );

    setFiltros(
      INITIAL_FILTERS,
    );

    setPagina(1);
  }

  const lotesConStock =
    lotes.filter(
      (lote) =>
        lote.cantidadDisponible > 0,
    ).length;

  const unidadesPagina =
    lotes.reduce(
      (sum, lote) =>
        sum +
        lote.cantidadDisponible,
      0,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lotes"
        description="Consultá la trazabilidad y disponibilidad del inventario por lote."
        icon={Boxes}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Resultados"
          value={String(total)}
          hint="Lotes según filtros actuales"
          icon={Boxes}
          variant="info"
        />

        <StatCard
          label="Con stock en página"
          value={String(lotesConStock)}
          hint="Lotes visibles con disponibilidad"
          icon={PackageCheck}
          variant="success"
        />

        <StatCard
          label="Unidades en página"
          value={String(unidadesPagina)}
          hint="Suma disponible de los resultados visibles"
          icon={PackageOpen}
          variant="neutral"
        />
      </div>

      <SectionCard
        title="Inventario por lote"
        description="Los lotes son generados por Pedidos y su stock es administrado exclusivamente por las operaciones del backend."
      >
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <InputField
            label="ID de producto"
            type="number"
            value={
              filtrosDraft.productoId
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  productoId: value,
                }),
              )
            }
            min={1}
            step={1}
            placeholder="Ej. 10"
          />

          <InputField
            label="ID de pedido"
            type="number"
            value={
              filtrosDraft.pedidoId
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  pedidoId: value,
                }),
              )
            }
            min={1}
            step={1}
            placeholder="Ej. 5"
          />

          <SelectField
            label="Estado del lote"
            value={
              filtrosDraft.estadoLote
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  estadoLote:
                    value as
                      | ""
                      | EstadoLoteInventario,
                }),
              )
            }
            options={[
              {
                value: "",
                label: "Todos",
              },
              {
                value: "EN_PROCESO",
                label: "En proceso",
              },
              {
                value: "EN_STOCK",
                label: "En stock",
              },
              {
                value: "VENDIDO_PARCIAL",
                label: "Vendido parcial",
              },
              {
                value: "AGOTADO",
                label: "Agotado",
              },
            ]}
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <PrimaryButton
            onClick={aplicarFiltros}
          >
            Aplicar filtros
          </PrimaryButton>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Limpiar filtros
          </button>
        </div>

        {loading ? (
          <div className="grid min-h-[240px] place-items-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />

              <p className="mt-4 text-sm font-semibold text-zinc-600">
                Cargando lotes...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
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
          <div className="space-y-5">
            <TablaLotes
              lotes={lotes}
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
      </SectionCard>
    </div>
  );
}

export default LotesPage;
