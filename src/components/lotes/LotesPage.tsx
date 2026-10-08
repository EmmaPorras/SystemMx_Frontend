import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  Boxes,
  PackageCheck,
  PackageOpen,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PaginationControls from "../common/PaginationControls";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";

import {
  obtenerLotesInventarioApi,
} from "../../services/inventarioApi";

import LoteDetalleModal from "./LoteDetalleModal";
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
  const [
    lotes,
    setLotes,
  ] = useState<LoteInventario[]>([]);

  const [
    filtrosDraft,
    setFiltrosDraft,
  ] = useState<FiltrosLotes>(
    INITIAL_FILTERS,
  );

  const [
    filtros,
    setFiltros,
  ] = useState<FiltrosLotes>(
    INITIAL_FILTERS,
  );

  const [
    pagina,
    setPagina,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPaginas,
    setTotalPaginas,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /*
   * =====================================================
   * LOTE SELECCIONADO PARA VER DETALLE
   * =====================================================
   */

  const [
    loteDetalle,
    setLoteDetalle,
  ] = useState<LoteInventario | null>(
    null,
  );

  function abrirDetalleLote(
    lote: LoteInventario,
  ) {
    setLoteDetalle(
      lote,
    );
  }

  function cerrarDetalleLote() {
    setLoteDetalle(
      null,
    );
  }

  /*
   * =====================================================
   * CARGAR LOTES
   * =====================================================
   */

  const cargarLotes =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const query: LotesQuery = {
          pagina,
          limite: LIMITE,
        };

        const productoId =
          Number(
            filtros.productoId,
          );

        const pedidoId =
          Number(
            filtros.pedidoId,
          );

        if (
          filtros.productoId &&
          Number.isInteger(
            productoId,
          ) &&
          productoId > 0
        ) {
          query.productoId =
            productoId;
        }

        if (
          filtros.pedidoId &&
          Number.isInteger(
            pedidoId,
          ) &&
          pedidoId > 0
        ) {
          query.pedidoId =
            pedidoId;
        }

        if (
          filtros.estadoLote
        ) {
          query.estadoLote =
            filtros.estadoLote;
        }

        try {
          const response =
            await obtenerLotesInventarioApi(
              query,
            );

          setLotes(
            response.items,
          );

          setTotal(
            response.total,
          );

          setTotalPaginas(
            response.totalPaginas,
          );

          if (
            response.totalPaginas >
              0 &&
            pagina >
              response.totalPaginas
          ) {
            setPagina(
              response.totalPaginas,
            );
          }
        } catch (
          requestError
        ) {
          setLotes(
            [],
          );

          setTotal(
            0,
          );

          setTotalPaginas(
            0,
          );

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "No fue posible cargar los lotes.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        pagina,
        filtros,
      ],
    );

  useEffect(
    () => {
      void cargarLotes();
    },
    [
      cargarLotes,
    ],
  );

  /*
   * =====================================================
   * FILTROS
   * =====================================================
   */

  function aplicarFiltros() {
    setPagina(
      1,
    );

    setFiltros(
      filtrosDraft,
    );
  }

  function limpiarFiltros() {
    setFiltrosDraft(
      INITIAL_FILTERS,
    );

    setFiltros(
      INITIAL_FILTERS,
    );

    setPagina(
      1,
    );
  }

  /*
   * =====================================================
   * INDICADORES
   * =====================================================
   */

  const lotesConStock =
    lotes.filter(
      (
        lote,
      ) =>
        lote.cantidadDisponible >
        0,
    ).length;

  const unidadesPagina =
    lotes.reduce(
      (
        sum,
        lote,
      ) =>
        sum +
        lote.cantidadDisponible,
      0,
    );

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* ====================================== */}
      {/* CABECERA */}
      {/* ====================================== */}

      <PageHeader
        title={t("lots.title", "Lotes")}
        description={t("lots.subtitle", "Consultá la trazabilidad y disponibilidad del inventario por lote.")}
        icon={
          Boxes
        }
      />

      {/* ====================================== */}
      {/* INDICADORES */}
      {/* ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("common.details", "Resultados")}
          value={String(
            total,
          )}
          hint={t("lots.subtitle", "Lotes según filtros actuales")}
          icon={
            Boxes
          }
          variant="info"
        />

        <StatCard
          label={t("lots.availableQuantity", "Con stock en página")}
          value={String(
            lotesConStock,
          )}
          hint={t("home.lotsWithStockHint", "{{count}} lotes con stock", { count: lotesConStock })}
          icon={
            PackageCheck
          }
          variant="success"
        />

        <StatCard
          label={t("navigation.inventory", "Unidades en página")}
          value={String(
            unidadesPagina,
          )}
          hint={t("lots.availableQuantity", "Suma disponible de los resultados visibles")}
          icon={
            PackageOpen
          }
          variant="neutral"
        />
      </div>

      {/* ====================================== */}
      {/* INVENTARIO POR LOTE */}
      {/* ====================================== */}

      <SectionCard
        title={t("lots.title", "Inventario por lote")}
        description={t("lots.subtitle", "Los lotes son generados por Pedidos y su stock es administrado exclusivamente por las operaciones del backend.")}
      >
        {/* FILTROS */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputField
            label={`ID ${t("products.title", "Producto")}`}
            type="number"
            value={
              filtrosDraft.productoId
            }
            onChange={(
              value,
            ) =>
              setFiltrosDraft(
                (
                  current,
                ) => ({
                  ...current,

                  productoId:
                    value,
                }),
              )
            }
            min={
              1
            }
            step={
              1
            }
            placeholder="Ej. 10"
          />

          <InputField
            label={`ID ${t("navigation.orders", "Pedido")}`}
            type="number"
            value={
              filtrosDraft.pedidoId
            }
            onChange={(
              value,
            ) =>
              setFiltrosDraft(
                (
                  current,
                ) => ({
                  ...current,

                  pedidoId:
                    value,
                }),
              )
            }
            min={
              1
            }
            step={
              1
            }
            placeholder="Ej. 5"
          />

          <SelectField
            label={t("lots.filterStatus", "Estado del lote")}
            value={
              filtrosDraft.estadoLote
            }
            onChange={(
              value,
            ) =>
              setFiltrosDraft(
                (
                  current,
                ) => ({
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
                value:
                  "",
                label:
                  t("common.all", "Todos"),
              },

              {
                value:
                  "EN_PROCESO",
                label:
                  t("statuses.lots.EN_PROCESO", "En proceso"),
              },

              {
                value:
                  "EN_STOCK",
                label:
                  t("statuses.lots.EN_STOCK", "En stock"),
              },

              {
                value:
                  "VENDIDO_PARCIAL",
                label:
                  t("statuses.lots.VENDIDO_PARCIAL", "Vendido parcial"),
              },

              {
                value:
                  "AGOTADO",
                label:
                  t("statuses.lots.AGOTADO", "Agotado"),
              },
            ]}
          />
        </div>

        {/* BOTONES DE FILTRO */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <PrimaryButton
            onClick={
              aplicarFiltros
            }
          >
            {t("common.filter", "Aplicar filtros")}
          </PrimaryButton>

          <button
            type="button"
            onClick={
              limpiarFiltros
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-4
              text-sm
              font-semibold
              text-zinc-700
              transition
              hover:bg-zinc-50
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-zinc-950
            "
          >
            {t("common.cleanFilters", "Limpiar filtros")}
          </button>
        </div>

        {/* ====================================== */}
        {/* TABLA */}
        {/* ====================================== */}

        {loading ? (
          <LoadingState message={t("common.loading", "Cargando lotes...")} />
        ) : error ? (
          <div className="space-y-4">
            <AlertMessage
              variant="error"
              title={t("common.errorOccurred", "No fue posible cargar los lotes")}
              message={
                error
              }
            />

            <PrimaryButton
              onClick={() => {
                void cargarLotes();
              }}
            >
              {t("common.reload", "Reintentar")}
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-5">
            <TablaLotes
              lotes={
                lotes
              }
              onView={
                abrirDetalleLote
              }
            />

            <PaginationControls
              pagina={
                pagina
              }
              totalPaginas={
                totalPaginas
              }
              total={
                total
              }
              limite={
                LIMITE
              }
              onPageChange={
                setPagina
              }
            />
          </div>
        )}
      </SectionCard>

      {/* ====================================== */}
      {/* MODAL DETALLE DEL LOTE */}
      {/* ====================================== */}

      <LoteDetalleModal
        isOpen={
          loteDetalle !==
          null
        }
        lote={
          loteDetalle
        }
        onClose={
          cerrarDetalleLote
        }
      />
    </div>
  );
}

export default LotesPage;