import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

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
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";
import {
  formatCurrency,
  formatDateTime,
} from "../common/formatters";
import { translateStatus } from "../../i18n/statusMap";

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
  return formatDateTime(value);
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
  const { t } = useTranslation();

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
            : t("audit.loadErrorDesc"),
        );
      } finally {
        setLoading(false);
      }
    }, [t]);

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
          : t("audit.consultError"),
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
        title={t("audit.filtersTitle")}
        description={t("audit.filtersDesc")}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField
            label={t("reports.dateFrom")}
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
            label={t("reports.dateTo")}
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
            label={t("reports.userId")}
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
            placeholder={t("reports.all")}
          />

          {vista === "MOVIMIENTOS" ? (
            <SelectField
              label={t("reports.movementType")}
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
                  label: t("reports.all"),
                },
                {
                  value:
                    "ENTRADA_COMPRA",
                  label:
                    translateStatus("movements", "ENTRADA_COMPRA"),
                },
                {
                  value:
                    "SALIDA_VENTA",
                  label:
                    translateStatus("movements", "SALIDA_VENTA"),
                },
                {
                  value:
                    "REINGRESO_ANULACION_VENTA",
                  label:
                    translateStatus("movements", "REINGRESO_ANULACION_VENTA"),
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
              ? t("audit.consulting")
              : t("audit.consult")}
          </PrimaryButton>
        </div>
      </SectionCard>
    );
  }

  function renderResultado() {
    if (loadingDetalle) {
      return <LoadingState message={t("audit.consultingAudit")} />;
    }

    if (vista === "USUARIOS") {
      return (
        <DataTableShell
          data={usuarios}
          emptyMessage={t("audit.noUserActivity")}
          getRowKey={(row) =>
            row.idUsuario
          }
          columns={[
            {
              key: "usuario",
              header: t("audit.user"),
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
              header: t("audit.registeredRole"),
              render: (row) =>
                translateStatus("roles", row.rol),
            },
            {
              key: "movimientos",
              header: t("audit.movements"),
              render: (row) =>
                String(
                  row.movimientos,
                ),
            },
            {
              key: "entradas",
              header: t("audit.entries"),
              render: (row) =>
                String(row.entradas),
            },
            {
              key: "salidas",
              header: t("audit.exits"),
              render: (row) =>
                String(row.salidas),
            },
            {
              key: "reingresos",
              header: t("audit.reentries"),
              render: (row) =>
                String(
                  row.reingresos,
                ),
            },
            {
              key: "unidades",
              header: t("audit.movedUnits"),
              render: (row) =>
                String(
                  row.unidadesMovidas,
                ),
            },
            {
              key: "pagos",
              header: t("audit.processedPayments"),
              render: (row) =>
                String(
                  row.pagosProcesados,
                ),
            },
            {
              key: "monto",
              header: t("audit.processedAmount"),
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
          emptyMessage={t("audit.noMovements")}
          getRowKey={(row) =>
            row.idMovimiento
          }
          columns={[
            {
              key: "fecha",
              header: t("audit.date"),
              render: (row) =>
                formatearFecha(
                  row.fechaMovimiento,
                ),
            },
            {
              key: "tipo",
              header: t("audit.action"),
              render: (row) => (
                <StatusBadge
                  label={
                    translateStatus("movements", row.tipoMovimiento)
                  }
                  variant={varianteMovimiento(
                    row.tipoMovimiento,
                  )}
                />
              ),
            },
            {
              key: "producto",
              header: t("audit.productBatch"),
              render: (row) =>
                `#${row.idProducto} / Lote #${row.idLote}`,
            },
            {
              key: "cantidad",
              header: t("common.quantity"),
              render: (row) =>
                String(
                  row.cantidad,
                ),
            },
            {
              key: "usuario",
              header: t("audit.user"),
              render: (row) =>
                row.usuarioActual ??
                row.usuarioSnapshot ??
                (row.idUsuario
                  ? `${t("audit.user")} #${row.idUsuario}`
                  : t("audit.withoutUser")),
            },
            {
              key: "referencia",
              header: t("audit.reference"),
              render: (row) =>
                `${row.referenciaTipo} #${row.referenciaId}`,
            },
            {
              key: "costo",
              header: t("audit.unitCost"),
              render: (row) =>
                formatCurrency(
                  row.costoUnitario,
                ),
            },
            {
              key: "total",
              header: t("common.total"),
              render: (row) =>
                formatCurrency(
                  row.totalMovimiento,
                ),
            },
            {
              key: "motivo",
              header: t("audit.reason"),
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
          emptyMessage={t("audit.noPayments")}
          getRowKey={(row) =>
            row.idPagoVenta
          }
          columns={[
            {
              key: "fecha",
              header: t("audit.date"),
              render: (row) =>
                formatearFecha(
                  row.fecha,
                ),
            },
            {
              key: "venta",
              header: t("audit.saleNumber"),
              render: (row) =>
                `#${row.numeroVenta}`,
            },
            {
              key: "estado",
              header: t("audit.saleStatus"),
              render: (row) =>
                translateStatus("sales", row.estadoVenta),
            },
            {
              key: "metodo",
              header: t("audit.paymentMethod"),
              render: (row) =>
                translateStatus("paymentMethods", row.metodoPago),
            },
            {
              key: "monto",
              header: t("audit.amount"),
              render: (row) =>
                formatCurrency(
                  row.monto,
                ),
            },
            {
              key: "usuario",
              header: t("audit.user"),
              render: (row) =>
                row.usuarioActual ??
                row.usuarioSnapshot ??
                (row.idUsuario
                  ? `${t("audit.user")} #${row.idUsuario}`
                  : t("audit.withoutUser")),
            },
            {
              key: "referencia",
              header: t("audit.reference"),
              render: (row) =>
                row.referencia ?? "—",
            },
            {
              key: "observaciones",
              header: t("audit.observations"),
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
        title={t("navigation.audit")}
        description={t("audit.pageDesc")}
        icon={ShieldCheck}
      />

      {loading ? (
        <LoadingState message={t("audit.loadingAudit")} />
      ) : error && !resumen ? (
        <div className="space-y-4">
          <AlertMessage
            variant="error"
            title={t("audit.loadErrorTitle")}
            message={error}
          />

          <PrimaryButton
            onClick={() => {
              void cargarResumen();
            }}
          >
            {t("common.retry")}
          </PrimaryButton>
        </div>
      ) : (
        <>
          {resumen ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={t("audit.statMovements")}
                value={String(
                  resumen.movimientos
                    .total,
                )}
                hint={t("audit.statAuditedRecords")}
                icon={History}
                variant="info"
              />

              <StatCard
                label={t("audit.statMovementCoverage")}
                value={`${resumen.movimientos.coberturaPorcentaje}%`}
                hint={t("audit.statWithUser", { count: resumen.movimientos.conUsuario })}
                icon={ShieldCheck}
                variant={
                  resumen.movimientos
                    .sinUsuario === 0
                    ? "success"
                    : "warning"
                }
              />

              <StatCard
                label={t("audit.statPayments")}
                value={String(
                  resumen.pagos.total,
                )}
                hint={t("audit.statAuditedPayments")}
                icon={Banknote}
                variant="info"
              />

              <StatCard
                label={t("audit.statPaymentCoverage")}
                value={`${resumen.pagos.coberturaPorcentaje}%`}
                hint={t("audit.statWithUser", { count: resumen.pagos.conUsuario })}
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
              title={t("audit.queryErrorTitle")}
              message={error}
              onClose={() =>
                setError(null)
              }
            />
          ) : null}

          <SectionCard
            title={t("audit.auditView")}
            description={t("audit.auditViewDesc")}
          >
            <div className="flex flex-wrap gap-2">
              {[
                {
                  value:
                    "RESUMEN" as const,
                  label: t("audit.tabSummary"),
                  icon: ShieldCheck,
                },
                {
                  value:
                    "USUARIOS" as const,
                  label: t("audit.tabActivity"),
                  icon: Users,
                },
                {
                  value:
                    "MOVIMIENTOS" as const,
                  label: t("audit.tabMovements"),
                  icon: History,
                },
                {
                  value:
                    "PAGOS" as const,
                  label: t("audit.tabPayments"),
                  icon: Banknote,
                },
                {
                  value:
                    "LEGACY" as const,
                  label: t("audit.tabLegacy"),
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
              title={t("audit.auditCoverage")}
              description={t("audit.officialCoverageDesc")}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 p-5">
                  <p className="font-bold text-zinc-950">
                    {t("audit.movements")}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <p>
                      {t("audit.total")}{" "}
                      {resumen.movimientos.total}
                    </p>
                    <p>
                      {t("audit.withUser")}{" "}
                      {
                        resumen.movimientos
                          .conUsuario
                      }
                    </p>
                    <p>
                      {t("audit.withoutUserLabel")}{" "}
                      {
                        resumen.movimientos
                          .sinUsuario
                      }
                    </p>
                    <p>
                      {t("audit.coverage")}{" "}
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
                    {t("audit.statPayments")}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <p>
                      {t("audit.total")}{" "}
                      {resumen.pagos.total}
                    </p>
                    <p>
                      {t("audit.withUser")}{" "}
                      {
                        resumen.pagos
                          .conUsuario
                      }
                    </p>
                    <p>
                      {t("audit.withoutUserLabel")}{" "}
                      {
                        resumen.pagos
                          .sinUsuario
                      }
                    </p>
                    <p>
                      {t("audit.coverage")}{" "}
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
                title={t("audit.legacyMovements")}
                description={t("audit.legacyMovementsDesc")}
              >
                <DataTableShell
                  data={
                    legacy.movimientos
                  }
                  emptyMessage={t("audit.noLegacyMovements")}
                  getRowKey={(
                    row,
                  ) =>
                    row.tipoMovimiento
                  }
                  columns={[
                    {
                      key: "tipo",
                      header:
                        t("audit.action"),
                      render: (row) =>
                        translateStatus("movements", row.tipoMovimiento),
                    },
                    {
                      key: "cantidad",
                      header:
                        t("audit.records"),
                      render: (row) =>
                        String(
                          row.cantidad,
                        ),
                    },
                    {
                      key: "unidades",
                      header:
                        t("audit.units"),
                      render: (row) =>
                        String(
                          row.unidades,
                        ),
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title={t("audit.legacyPayments")}
                description={t("audit.legacyPaymentsDesc")}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label={t("audit.statPayments")}
                    value={String(
                      legacy.pagos
                        .cantidad,
                    )}
                    hint={t("audit.historicalRecords")}
                    icon={Banknote}
                    variant="neutral"
                  />

                  <StatCard
                    label={t("audit.amount")}
                    value={formatCurrency(
                      legacy.pagos
                        .monto,
                    )}
                    hint={t("audit.historicalAmount")}
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
                  ? t("audit.userActivityTitle")
                  : vista ===
                      "MOVIMIENTOS"
                    ? t("audit.auditedMovementsTitle")
                    : t("audit.auditedPaymentsTitle")
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
