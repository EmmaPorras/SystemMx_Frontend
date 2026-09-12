import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Banknote,
  Database,
  History,
  ShieldCheck,
  Users,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import DataTableShell from "../common/DataTableShell";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";
import {
  formatCurrency,
} from "../common/formatters";

import {
  obtenerReporteAuditoriaLegacyApi,
  obtenerReporteAuditoriaMovimientosApi,
  obtenerReporteAuditoriaPagosApi,
  obtenerReporteAuditoriaResumenApi,
  obtenerReporteAuditoriaUsuariosApi,
} from "../../services/reportesApi";

import {
  AUDITORIA_FILTROS_INICIALES,
  crearConsultaAuditoria,
  crearConsultaMovimientosAuditoria,
  validarFiltrosAuditoria,
  type AuditoriaFiltros,
} from "./auditoria.utils";

import type {
  ReporteAuditoriaLegacy,
  ReporteAuditoriaMovimientoItem,
  ReporteAuditoriaPagoItem,
  ReporteAuditoriaResumen,
  ReporteAuditoriaUsuarioItem,
} from "../reportes/reportes.types";

type AuditoriaVista =
  | "RESUMEN"
  | "USUARIOS"
  | "MOVIMIENTOS"
  | "PAGOS"
  | "LEGACY";

function formatearFecha(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function varianteMovimiento(
  tipo: string,
):
  | "success"
  | "warning"
  | "neutral"
  | "danger" {
  switch (tipo) {
    case "ENTRADA_COMPRA":
      return "success";

    case "SALIDA_VENTA":
      return "warning";

    case "REINGRESO_ANULACION_VENTA":
      return "neutral";

    default:
      return "neutral";
  }
}

function AuditoriaPage() {
  const [vista, setVista] =
    useState<AuditoriaVista>(
      "RESUMEN",
    );

  const [resumen, setResumen] =
    useState<ReporteAuditoriaResumen | null>(
      null,
    );

  const [legacy, setLegacy] =
    useState<ReporteAuditoriaLegacy | null>(
      null,
    );

  const [usuarios, setUsuarios] =
    useState<
      ReporteAuditoriaUsuarioItem[]
    >([]);

  const [
    movimientos,
    setMovimientos,
  ] = useState<
    ReporteAuditoriaMovimientoItem[]
  >([]);

  const [pagos, setPagos] =
    useState<
      ReporteAuditoriaPagoItem[]
    >([]);

  const [
    filtrosDraft,
    setFiltrosDraft,
  ] = useState<AuditoriaFiltros>(
    AUDITORIA_FILTROS_INICIALES,
  );

  const [loading, setLoading] =
    useState(true);

  const [loadingDetalle, setLoadingDetalle] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const cargarResumen =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          resumenResponse,
          legacyResponse,
        ] = await Promise.all([
          obtenerReporteAuditoriaResumenApi(),
          obtenerReporteAuditoriaLegacyApi(),
        ]);

        setResumen(
          resumenResponse,
        );

        setLegacy(
          legacyResponse,
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar la auditoría.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  async function consultarDetalle() {
    const validationError =
      validarFiltrosAuditoria(
        filtrosDraft,
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoadingDetalle(true);
    setError(null);

    try {
      switch (vista) {
        case "USUARIOS":
          setUsuarios(
            await obtenerReporteAuditoriaUsuariosApi(
              crearConsultaAuditoria(
                filtrosDraft,
              ),
            ),
          );
          break;

        case "MOVIMIENTOS":
          setMovimientos(
            await obtenerReporteAuditoriaMovimientosApi(
              crearConsultaMovimientosAuditoria(
                filtrosDraft,
              ),
            ),
          );
          break;

        case "PAGOS":
          setPagos(
            await obtenerReporteAuditoriaPagosApi(
              crearConsultaAuditoria(
                filtrosDraft,
              ),
            ),
          );
          break;

        default:
          break;
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible consultar la auditoría.",
      );
    } finally {
      setLoadingDetalle(false);
    }
  }

  function cambiarVista(
    next: AuditoriaVista,
  ) {
    setVista(next);
    setError(null);
  }

  function renderFiltros() {
    if (
      vista !== "USUARIOS" &&
      vista !== "MOVIMIENTOS" &&
      vista !== "PAGOS"
    ) {
      return null;
    }

    return (
      <SectionCard
        title="Filtros"
        description="Filtrá el historial sin modificar los registros."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField
            label="Fecha desde"
            type="date"
            value={
              filtrosDraft.fechaDesde
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  fechaDesde: value,
                }),
              )
            }
          />

          <InputField
            label="Fecha hasta"
            type="date"
            value={
              filtrosDraft.fechaHasta
            }
            onChange={(value) =>
              setFiltrosDraft(
                (current) => ({
                  ...current,
                  fechaHasta: value,
                }),
              )
            }
          />

          <InputField
            label="ID usuario"
            type="number"
            min={1}
            step={1}
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
            placeholder="Todos"
          />

          {vista === "MOVIMIENTOS" ? (
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
                      value,
                  }),
                )
              }
              options={[
                {
                  value: "",
                  label: "Todos",
                },
                {
                  value:
                    "ENTRADA_COMPRA",
                  label:
                    "Entrada por compra",
                },
                {
                  value:
                    "SALIDA_VENTA",
                  label:
                    "Salida por venta",
                },
                {
                  value:
                    "REINGRESO_ANULACION_VENTA",
                  label:
                    "Reingreso por anulación",
                },
              ]}
            />
          ) : null}
        </div>

        <div className="mt-5">
          <PrimaryButton
            onClick={() => {
              void consultarDetalle();
            }}
          >
            {loadingDetalle
              ? "Consultando..."
              : "Consultar"}
          </PrimaryButton>
        </div>
      </SectionCard>
    );
  }

  function renderResultado() {
    if (loadingDetalle) {
      return (
        <div className="grid min-h-[200px] place-items-center">
          <p className="text-sm font-semibold text-zinc-500">
            Consultando auditoría...
          </p>
        </div>
      );
    }

    if (vista === "USUARIOS") {
      return (
        <DataTableShell
          data={usuarios}
          emptyMessage="No existen registros de actividad para los filtros seleccionados."
          getRowKey={(row) =>
            row.idUsuario
          }
          columns={[
            {
              key: "usuario",
              header: "Usuario",
              render: (row) => (
                <div>
                  <p className="font-semibold text-zinc-950">
                    {row.nombre}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {row.username}
                  </p>
                </div>
              ),
            },
            {
              key: "rol",
              header: "Rol registrado",
              render: (row) =>
                row.rol,
            },
            {
              key: "movimientos",
              header: "Movimientos",
              render: (row) =>
                String(
                  row.movimientos,
                ),
            },
            {
              key: "entradas",
              header: "Entradas",
              render: (row) =>
                String(row.entradas),
            },
            {
              key: "salidas",
              header: "Salidas",
              render: (row) =>
                String(row.salidas),
            },
            {
              key: "reingresos",
              header: "Reingresos",
              render: (row) =>
                String(
                  row.reingresos,
                ),
            },
            {
              key: "unidades",
              header: "Unidades movidas",
              render: (row) =>
                String(
                  row.unidadesMovidas,
                ),
            },
            {
              key: "pagos",
              header: "Pagos procesados",
              render: (row) =>
                String(
                  row.pagosProcesados,
                ),
            },
            {
              key: "monto",
              header: "Monto procesado",
              render: (row) =>
                formatCurrency(
                  row.montoPagosProcesado,
                ),
            },
          ]}
        />
      );
    }

    if (vista === "MOVIMIENTOS") {
      return (
        <DataTableShell
          data={movimientos}
          emptyMessage="No existen movimientos para los filtros seleccionados."
          getRowKey={(row) =>
            row.idMovimiento
          }
          columns={[
            {
              key: "fecha",
              header: "Fecha",
              render: (row) =>
                formatearFecha(
                  row.fechaMovimiento,
                ),
            },
            {
              key: "tipo",
              header: "Tipo",
              render: (row) => (
                <StatusBadge
                  label={
                    row.tipoMovimiento
                  }
                  variant={varianteMovimiento(
                    row.tipoMovimiento,
                  )}
                />
              ),
            },
            {
              key: "producto",
              header: "Producto / lote",
              render: (row) =>
                `#${row.idProducto} / Lote #${row.idLote}`,
            },
            {
              key: "cantidad",
              header: "Cantidad",
              render: (row) =>
                String(
                  row.cantidad,
                ),
            },
            {
              key: "usuario",
              header: "Usuario",
              render: (row) =>
                row.usuarioActual ??
                row.usuarioSnapshot ??
                (row.idUsuario
                  ? `Usuario #${row.idUsuario}`
                  : "Sin usuario"),
            },
            {
              key: "referencia",
              header: "Referencia",
              render: (row) =>
                `${row.referenciaTipo} #${row.referenciaId}`,
            },
            {
              key: "costo",
              header: "Costo unitario",
              render: (row) =>
                formatCurrency(
                  row.costoUnitario,
                ),
            },
            {
              key: "total",
              header: "Total",
              render: (row) =>
                formatCurrency(
                  row.totalMovimiento,
                ),
            },
            {
              key: "motivo",
              header: "Motivo",
              render: (row) =>
                row.motivo,
            },
          ]}
        />
      );
    }

    if (vista === "PAGOS") {
      return (
        <DataTableShell
          data={pagos}
          emptyMessage="No existen pagos para los filtros seleccionados."
          getRowKey={(row) =>
            row.idPagoVenta
          }
          columns={[
            {
              key: "fecha",
              header: "Fecha",
              render: (row) =>
                formatearFecha(
                  row.fecha,
                ),
            },
            {
              key: "venta",
              header: "Venta",
              render: (row) =>
                `#${row.numeroVenta}`,
            },
            {
              key: "estado",
              header: "Estado venta",
              render: (row) =>
                row.estadoVenta,
            },
            {
              key: "metodo",
              header: "Método",
              render: (row) =>
                row.metodoPago,
            },
            {
              key: "monto",
              header: "Monto",
              render: (row) =>
                formatCurrency(
                  row.monto,
                ),
            },
            {
              key: "usuario",
              header: "Usuario",
              render: (row) =>
                row.usuarioActual ??
                row.usuarioSnapshot ??
                (row.idUsuario
                  ? `Usuario #${row.idUsuario}`
                  : "Sin usuario"),
            },
            {
              key: "referencia",
              header: "Referencia",
              render: (row) =>
                row.referencia ?? "—",
            },
            {
              key: "observaciones",
              header: "Observaciones",
              render: (row) =>
                row.observaciones ??
                "—",
            },
          ]}
        />
      );
    }

    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría"
        description="Trazabilidad administrativa de movimientos de inventario y pagos."
        icon={ShieldCheck}
      />

      {loading ? (
        <div className="grid min-h-[260px] place-items-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />

            <p className="mt-4 text-sm font-semibold text-zinc-500">
              Cargando auditoría...
            </p>
          </div>
        </div>
      ) : error && !resumen ? (
        <div className="space-y-4">
          <AlertMessage
            variant="error"
            title="No fue posible cargar la auditoría"
            message={error}
          />

          <PrimaryButton
            onClick={() => {
              void cargarResumen();
            }}
          >
            Reintentar
          </PrimaryButton>
        </div>
      ) : (
        <>
          {resumen ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Movimientos"
                value={String(
                  resumen.movimientos
                    .total,
                )}
                hint="Registros auditados"
                icon={History}
                variant="info"
              />

              <StatCard
                label="Cobertura movimientos"
                value={`${resumen.movimientos.coberturaPorcentaje}%`}
                hint={`${resumen.movimientos.conUsuario} con usuario`}
                icon={ShieldCheck}
                variant={
                  resumen.movimientos
                    .sinUsuario === 0
                    ? "success"
                    : "warning"
                }
              />

              <StatCard
                label="Pagos"
                value={String(
                  resumen.pagos.total,
                )}
                hint="Pagos auditados"
                icon={Banknote}
                variant="info"
              />

              <StatCard
                label="Cobertura pagos"
                value={`${resumen.pagos.coberturaPorcentaje}%`}
                hint={`${resumen.pagos.conUsuario} con usuario`}
                icon={ShieldCheck}
                variant={
                  resumen.pagos
                    .sinUsuario === 0
                    ? "success"
                    : "warning"
                }
              />
            </div>
          ) : null}

          {error ? (
            <AlertMessage
              variant="error"
              title="No fue posible completar la consulta"
              message={error}
              onClose={() =>
                setError(null)
              }
            />
          ) : null}

          <SectionCard
            title="Vista de auditoría"
            description="Seleccioná el tipo de información a consultar."
          >
            <div className="flex flex-wrap gap-2">
              {[
                {
                  value:
                    "RESUMEN" as const,
                  label: "Resumen",
                  icon: ShieldCheck,
                },
                {
                  value:
                    "USUARIOS" as const,
                  label: "Actividad",
                  icon: Users,
                },
                {
                  value:
                    "MOVIMIENTOS" as const,
                  label: "Movimientos",
                  icon: History,
                },
                {
                  value:
                    "PAGOS" as const,
                  label: "Pagos",
                  icon: Banknote,
                },
                {
                  value:
                    "LEGACY" as const,
                  label: "Legacy",
                  icon: Database,
                },
              ].map((item) => {
                const Icon =
                  item.icon;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      cambiarVista(
                        item.value,
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      vista ===
                      item.value
                        ? "bg-zinc-950 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {renderFiltros()}

          {vista === "RESUMEN" &&
          resumen ? (
            <SectionCard
              title="Cobertura de auditoría"
              description="Cobertura oficial registrada por el backend."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 p-5">
                  <p className="font-bold text-zinc-950">
                    Movimientos
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <p>
                      Total:{" "}
                      {resumen.movimientos.total}
                    </p>
                    <p>
                      Con usuario:{" "}
                      {
                        resumen.movimientos
                          .conUsuario
                      }
                    </p>
                    <p>
                      Sin usuario:{" "}
                      {
                        resumen.movimientos
                          .sinUsuario
                      }
                    </p>
                    <p>
                      Cobertura:{" "}
                      {
                        resumen.movimientos
                          .coberturaPorcentaje
                      }
                      %
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-5">
                  <p className="font-bold text-zinc-950">
                    Pagos
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <p>
                      Total:{" "}
                      {resumen.pagos.total}
                    </p>
                    <p>
                      Con usuario:{" "}
                      {
                        resumen.pagos
                          .conUsuario
                      }
                    </p>
                    <p>
                      Sin usuario:{" "}
                      {
                        resumen.pagos
                          .sinUsuario
                      }
                    </p>
                    <p>
                      Cobertura:{" "}
                      {
                        resumen.pagos
                          .coberturaPorcentaje
                      }
                      %
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : null}

          {vista === "LEGACY" &&
          legacy ? (
            <div className="space-y-6">
              <SectionCard
                title="Movimientos legacy"
                description="Registros históricos agrupados sin cobertura completa de identidad."
              >
                <DataTableShell
                  data={
                    legacy.movimientos
                  }
                  emptyMessage="No existen movimientos legacy."
                  getRowKey={(
                    row,
                  ) =>
                    row.tipoMovimiento
                  }
                  columns={[
                    {
                      key: "tipo",
                      header:
                        "Tipo",
                      render: (row) =>
                        row.tipoMovimiento,
                    },
                    {
                      key: "cantidad",
                      header:
                        "Registros",
                      render: (row) =>
                        String(
                          row.cantidad,
                        ),
                    },
                    {
                      key: "unidades",
                      header:
                        "Unidades",
                      render: (row) =>
                        String(
                          row.unidades,
                        ),
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Pagos legacy"
                description="Cobertura histórica de pagos sin identidad completa."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Pagos"
                    value={String(
                      legacy.pagos
                        .cantidad,
                    )}
                    hint="Registros históricos"
                    icon={Banknote}
                    variant="neutral"
                  />

                  <StatCard
                    label="Monto"
                    value={formatCurrency(
                      legacy.pagos
                        .monto,
                    )}
                    hint="Monto histórico"
                    icon={Banknote}
                    variant="neutral"
                  />
                </div>
              </SectionCard>
            </div>
          ) : null}

          {vista !== "RESUMEN" &&
          vista !== "LEGACY" ? (
            <SectionCard
              title={
                vista === "USUARIOS"
                  ? "Actividad por usuario"
                  : vista ===
                      "MOVIMIENTOS"
                    ? "Movimientos auditados"
                    : "Pagos auditados"
              }
            >
              {renderResultado()}
            </SectionCard>
          ) : null}
        </>
      )}
    </div>
  );
}

export default AuditoriaPage;
