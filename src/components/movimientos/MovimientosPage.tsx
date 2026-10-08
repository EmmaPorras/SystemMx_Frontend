import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
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
  obtenerMovimientosInventarioApi,
} from "../../services/inventarioApi";

import TablaMovimientos from "./TablaMovimientos";

import type {
  MovimientoInventario,
  MovimientosQuery,
  ReferenciaMovimientoInventario,
  TipoMovimientoInventario,
} from "./movimientos.types";

type FiltrosMovimientos = {
  productoId: string;
  loteId: string;
  tipoMovimiento: "" | TipoMovimientoInventario;
  referenciaTipo: "" | ReferenciaMovimientoInventario;
  referenciaId: string;
  desde: string;
  hasta: string;
  usuarioId: string;
};

const INITIAL_FILTERS: FiltrosMovimientos = {
  productoId: "",
  loteId: "",
  tipoMovimiento: "",
  referenciaTipo: "",
  referenciaId: "",
  desde: "",
  hasta: "",
  usuarioId: "",
};

const LIMITE = 20;

function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [filtrosDraft, setFiltrosDraft] = useState<FiltrosMovimientos>(INITIAL_FILTERS);
  const [filtros, setFiltros] = useState<FiltrosMovimientos>(INITIAL_FILTERS);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarMovimientos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query: MovimientosQuery = {
      pagina,
      limite: LIMITE,
    };

    const productoId = Number(filtros.productoId);
    const loteId = Number(filtros.loteId);
    const referenciaId = Number(filtros.referenciaId);
    const usuarioId = Number(filtros.usuarioId);

    if (
      filtros.productoId &&
      Number.isInteger(productoId) &&
      productoId > 0
    ) {
      query.productoId = productoId;
    }

    if (
      filtros.loteId &&
      Number.isInteger(loteId) &&
      loteId > 0
    ) {
      query.loteId = loteId;
    }

    if (filtros.tipoMovimiento) {
      query.tipoMovimiento = filtros.tipoMovimiento;
    }

    if (filtros.referenciaTipo) {
      query.referenciaTipo = filtros.referenciaTipo;
    }

    if (
      filtros.referenciaId &&
      Number.isInteger(referenciaId) &&
      referenciaId > 0
    ) {
      query.referenciaId = referenciaId;
    }

    if (filtros.desde) {
      query.desde = filtros.desde;
    }

    if (filtros.hasta) {
      query.hasta = filtros.hasta;
    }

    if (
      filtros.usuarioId &&
      Number.isInteger(usuarioId) &&
      usuarioId > 0
    ) {
      query.usuarioId = usuarioId;
    }

    try {
      const response = await obtenerMovimientosInventarioApi(query);

      setMovimientos(response.items);
      setTotal(response.total);
      setTotalPaginas(response.totalPaginas);

      if (
        response.totalPaginas > 0 &&
        pagina > response.totalPaginas
      ) {
        setPagina(response.totalPaginas);
      }
    } catch (requestError) {
      setMovimientos([]);
      setTotal(0);
      setTotalPaginas(0);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar los movimientos.",
      );
    } finally {
      setLoading(false);
    }
  }, [pagina, filtros]);

  useEffect(() => {
    void cargarMovimientos();
  }, [cargarMovimientos]);

  function aplicarFiltros() {
    if (
      filtrosDraft.desde &&
      filtrosDraft.hasta &&
      filtrosDraft.desde > filtrosDraft.hasta
    ) {
      setError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }

    setError(null);
    setPagina(1);
    setFiltros(filtrosDraft);
  }

  function limpiarFiltros() {
    setFiltrosDraft(INITIAL_FILTERS);
    setFiltros(INITIAL_FILTERS);
    setPagina(1);
    setError(null);
  }

  const entradasPagina = movimientos.filter(
    (movimiento) =>
      movimiento.tipoMovimiento === "ENTRADA_COMPRA" ||
      movimiento.tipoMovimiento === "REINGRESO_ANULACION_VENTA",
  ).length;

  const salidasPagina = movimientos.filter(
    (movimiento) => movimiento.tipoMovimiento === "SALIDA_VENTA",
  ).length;

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("movements.title", "Movimientos")}
        description={t("movements.subtitle", "Registro histórico y bitácora de entradas y salidas de stock.")}
        icon={History}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("common.details", "Resultados")}
          value={String(total)}
          hint={t("movements.subtitle", "Movimientos según filtros actuales")}
          icon={History}
          variant="info"
        />

        <StatCard
          label={t("movements.inbound", "Entradas en página")}
          value={String(entradasPagina)}
          hint={t("movements.inboundHint", "Compras y reingresos visibles")}
          icon={ArrowDownToLine}
          variant="success"
        />

        <StatCard
          label={t("movements.outbound", "Salidas en página")}
          value={String(salidasPagina)}
          hint={t("movements.outboundHint", "Ventas visibles")}
          icon={ArrowUpFromLine}
          variant="warning"
        />
      </div>

      <SectionCard
        title={t("movements.history", "Historial de movimientos")}
        description={t("movements.historyDesc", "Los movimientos son registros de auditoría generados por el backend y no pueden editarse.")}
      >
        <div className="mb-6 flex flex-wrap items-end gap-3.5">
          <div className="w-full sm:w-36">
            <InputField
              label={`ID ${t("products.title", "Producto")}`}
              type="number"
              value={filtrosDraft.productoId}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  productoId: value,
                }))
              }
              min={1}
              step={1}
            />
          </div>

          <div className="w-full sm:w-36">
            <InputField
              label={`ID ${t("lots.title", "Lote")}`}
              type="number"
              value={filtrosDraft.loteId}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  loteId: value,
                }))
              }
              min={1}
              step={1}
            />
          </div>

          <div className="w-full sm:w-48">
            <SelectField
              label={t("movements.filterType", "Tipo de movimiento")}
              value={filtrosDraft.tipoMovimiento}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  tipoMovimiento: value as "" | TipoMovimientoInventario,
                }))
              }
              options={[
                {
                  value: "",
                  label: t("common.all", "Todos"),
                },
                {
                  value: "ENTRADA_COMPRA",
                  label: t("statuses.movements.ENTRADA_COMPRA", "Entrada por compra"),
                },
                {
                  value: "SALIDA_VENTA",
                  label: t("statuses.movements.SALIDA_VENTA", "Salida por venta"),
                },
                {
                  value: "REINGRESO_ANULACION_VENTA",
                  label: t("statuses.movements.REINGRESO_ANULACION_VENTA", "Reingreso por anulación"),
                },
              ]}
            />
          </div>

          <div className="w-full sm:w-44">
            <SelectField
              label={t("movements.referenceType", "Tipo de referencia")}
              value={filtrosDraft.referenciaTipo}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  referenciaTipo: value as "" | ReferenciaMovimientoInventario,
                }))
              }
              options={[
                {
                  value: "",
                  label: t("movements.allReferences", "Todas"),
                },
                {
                  value: "PEDIDO",
                  label: t("movements.orderRef", "Pedido"),
                },
                {
                  value: "VENTA",
                  label: t("movements.saleRef", "Venta"),
                },
              ]}
            />
          </div>

          <div className="w-full sm:w-36">
            <InputField
              label={t("movements.referenceId", "ID referencia")}
              type="number"
              value={filtrosDraft.referenciaId}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  referenciaId: value,
                }))
              }
              min={1}
              step={1}
            />
          </div>

          <div className="w-full sm:w-40">
            <InputField
              label={t("movements.from", "Desde")}
              type="date"
              value={filtrosDraft.desde}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  desde: value,
                }))
              }
            />
          </div>

          <div className="w-full sm:w-40">
            <InputField
              label={t("movements.to", "Hasta")}
              type="date"
              value={filtrosDraft.hasta}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  hasta: value,
                }))
              }
            />
          </div>

          <div className="w-full sm:w-36">
            <InputField
              label={t("movements.userId", "ID usuario")}
              type="number"
              value={filtrosDraft.usuarioId}
              onChange={(value) =>
                setFiltrosDraft((current) => ({
                  ...current,
                  usuarioId: value,
                }))
              }
              min={1}
              step={1}
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <PrimaryButton onClick={aplicarFiltros} className="h-[38px] flex-1 sm:flex-initial">
              {t("common.filter", "Aplicar filtros")}
            </PrimaryButton>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex h-[38px] flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white px-3.5 text-xs sm:text-sm font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 sm:flex-initial"
            >
              {t("common.cleanFilters", "Limpiar filtros")}
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState message={t("common.loading", "Cargando movimientos...")} />
        ) : error ? (
          <div className="space-y-4">
            <AlertMessage
              variant="error"
              title={t("common.errorOccurred", "No fue posible cargar los movimientos")}
              message={error}
            />

            <PrimaryButton
              onClick={() => {
                void cargarMovimientos();
              }}
            >
              {t("common.reload", "Reintentar")}
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-5">
            <TablaMovimientos movimientos={movimientos} />

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

export default MovimientosPage;
