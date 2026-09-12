import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
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

  tipoMovimiento:
    | ""
    | TipoMovimientoInventario;

  referenciaTipo:
    | ""
    | ReferenciaMovimientoInventario;

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
  const [movimientos, setMovimientos] =
    useState<MovimientoInventario[]>([]);

  const [filtrosDraft, setFiltrosDraft] =
    useState<FiltrosMovimientos>(
      INITIAL_FILTERS,
    );

  const [filtros, setFiltros] =
    useState<FiltrosMovimientos>(
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

  const cargarMovimientos =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      const query: MovimientosQuery = {
        pagina,
        limite: LIMITE,
      };

      const productoId =
        Number(filtros.productoId);

      const loteId =
        Number(filtros.loteId);

      const referenciaId =
        Number(filtros.referenciaId);

      const usuarioId =
        Number(filtros.usuarioId);

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
        query.tipoMovimiento =
          filtros.tipoMovimiento;
      }

      if (filtros.referenciaTipo) {
        query.referenciaTipo =
          filtros.referenciaTipo;
      }

      if (
        filtros.referenciaId &&
        Number.isInteger(referenciaId) &&
        referenciaId > 0
      ) {
        query.referenciaId =
          referenciaId;
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
        const response =
          await obtenerMovimientosInventarioApi(
            query,
          );

        setMovimientos(
          response.items,
        );

        setTotal(
          response.total,
        );

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
    }, [
      pagina,
      filtros,
    ]);

  useEffect(() => {
    void cargarMovimientos();
  }, [cargarMovimientos]);

  function aplicarFiltros() {
    if (
      filtrosDraft.desde &&
      filtrosDraft.hasta &&
      filtrosDraft.desde >
        filtrosDraft.hasta
    ) {
      setError(
        "La fecha desde no puede ser posterior a la fecha hasta.",
      );

      return;
    }

    setError(null);
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
    setError(null);
  }

  const entradasPagina =
    movimientos.filter(
      (movimiento) =>
        movimiento.tipoMovimiento ===
          "ENTRADA_COMPRA" ||
        movimiento.tipoMovimiento ===
          "REINGRESO_ANULACION_VENTA",
    ).length;

  const salidasPagina =
    movimientos.filter(
      (movimiento) =>
        movimiento.tipoMovimiento ===
        "SALIDA_VENTA",
    ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos de inventario"
        description="Consultá el historial generado automáticamente por compras, ventas y anulaciones."
        icon={History}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Resultados"
          value={String(total)}
          hint="Movimientos según filtros actuales"
          icon={History}
          variant="info"
        />

        <StatCard
          label="Entradas en página"
          value={String(entradasPagina)}
          hint="Compras y reingresos visibles"
          icon={ArrowDownToLine}
          variant="success"
        />

        <StatCard
          label="Salidas en página"
          value={String(salidasPagina)}
          hint="Ventas visibles"
          icon={ArrowUpFromLine}
          variant="warning"
        />
      </div>

      <SectionCard
        title="Historial de movimientos"
        description="Los movimientos son registros de auditoría generados por el backend y no pueden editarse."
      >
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField
            label="ID producto"
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
          />

          <InputField
            label="ID lote"
            type="number"
            value={
              filtrosDraft.loteId
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  loteId: value,
                }),
              )
            }
            min={1}
            step={1}
          />

          <SelectField
            label="Tipo de movimiento"
            value={
              filtrosDraft.tipoMovimiento
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  tipoMovimiento:
                    value as
                      | ""
                      | TipoMovimientoInventario,
                }),
              )
            }
            options={[
              {
                value: "",
                label: "Todos",
              },
              {
                value: "ENTRADA_COMPRA",
                label: "Entrada por compra",
              },
              {
                value: "SALIDA_VENTA",
                label: "Salida por venta",
              },
              {
                value:
                  "REINGRESO_ANULACION_VENTA",
                label:
                  "Reingreso por anulación",
              },
            ]}
          />

          <SelectField
            label="Tipo de referencia"
            value={
              filtrosDraft.referenciaTipo
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  referenciaTipo:
                    value as
                      | ""
                      | ReferenciaMovimientoInventario,
                }),
              )
            }
            options={[
              {
                value: "",
                label: "Todas",
              },
              {
                value: "PEDIDO",
                label: "Pedido",
              },
              {
                value: "VENTA",
                label: "Venta",
              },
            ]}
          />

          <InputField
            label="ID referencia"
            type="number"
            value={
              filtrosDraft.referenciaId
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  referenciaId: value,
                }),
              )
            }
            min={1}
            step={1}
          />

          <InputField
            label="Desde"
            type="date"
            value={filtrosDraft.desde}
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  desde: value,
                }),
              )
            }
          />

          <InputField
            label="Hasta"
            type="date"
            value={filtrosDraft.hasta}
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  hasta: value,
                }),
              )
            }
          />

          <InputField
            label="ID usuario"
            type="number"
            value={
              filtrosDraft.usuarioId
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  usuarioId: value,
                }),
              )
            }
            min={1}
            step={1}
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
                Cargando movimientos...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <AlertMessage
              variant="error"
              title="No fue posible cargar los movimientos"
              message={error}
            />

            <PrimaryButton
              onClick={() => {
                void cargarMovimientos();
              }}
            >
              Reintentar
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-5">
            <TablaMovimientos
              movimientos={movimientos}
            />

            <PaginationControls
              pagina={pagina}
              totalPaginas={
                totalPaginas
              }
              total={total}
              limite={LIMITE}
              onPageChange={
                setPagina
              }
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default MovimientosPage;
