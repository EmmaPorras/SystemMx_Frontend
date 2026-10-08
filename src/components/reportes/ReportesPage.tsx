import {
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  BarChart3,
  Check,
  FileDown,
  FileSpreadsheet,
  FileText,
  Layers3,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";

import ReportFilters, {
  type ReportFilterMode,
  type ReportFilterValues,
} from "./ReportFilters";

import ReportResultView from "./ReportResultView";

import {
  reportesCatalog,
  reportFamilyLabels,
  type ReportDefinition,
  type ReportFamily,
} from "./reportes.catalog";

import {
  exportarReportesExcel,
  exportarReportesPdf,
  type ReportExportItem,
} from "./reportExport";

function fechaActual(): string {
  const now =
    new Date();

  return [
    now.getFullYear(),

    String(
      now.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    ),

    String(
      now.getDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join("-");
}

const INITIAL_FILTERS:
  ReportFilterValues = {
  fechaDesde:
    "",

  fechaHasta:
    "",

  fechaCorte:
    fechaActual(),

  usuarioId:
    "",

  tipoMovimiento:
    "",
};

type ReportExecution = {
  report:
    ReportDefinition;

  data:
    unknown | null;

  error:
    string | null;
};

const TODAS_FAMILIAS =
  Object.keys(
    reportFamilyLabels,
  ) as
    ReportFamily[];

function ReportesPage() {
  const { t } = useTranslation();

  const getFamilyLabel = (family: ReportFamily) => {
    switch (family) {
      case "resumen":
        return t("reports.familyResumen");
      case "ventas":
        return t("reports.familyVentas");
      case "inventario":
        return t("reports.familyInventario");
      case "compras":
        return t("reports.familyCompras");
      case "pagos":
        return t("reports.familyPagos");
      case "cuentas":
        return t("reports.familyCuentas");
      case "auditoria":
        return t("reports.familyAuditoria");
      default:
        return reportFamilyLabels[family];
    }
  };

  /*
   * ==========================================
   * SELECCIÓN
   * ==========================================
   */

  const [
    selectedFamilies,
    setSelectedFamilies,
  ] =
    useState<
      ReportFamily[]
    >([
      "resumen",
    ]);

  const [
    selectedReportIds,
    setSelectedReportIds,
  ] =
    useState<
      string[]
    >([
      "resumen",
    ]);

  /*
   * ==========================================
   * FILTROS
   * ==========================================
   */

  const [
    filters,
    setFilters,
  ] =
    useState<ReportFilterValues>(
      INITIAL_FILTERS,
    );

  /*
   * ==========================================
   * RESULTADOS
   * ==========================================
   */

  const [
    executions,
    setExecutions,
  ] =
    useState<
      ReportExecution[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /*
   * ==========================================
   * REPORTES VISIBLES
   * ==========================================
   */

  const visibleReports =
    useMemo(
      () =>
        reportesCatalog.filter(
          (
            report,
          ) =>
            selectedFamilies.includes(
              report.family,
            ),
        ),
      [
        selectedFamilies,
      ],
    );

  /*
   * Reportes realmente seleccionados.
   * Se conserva el orden del catálogo.
   */
  const selectedReports =
    useMemo(
      () =>
        reportesCatalog.filter(
          (
            report,
          ) =>
            selectedReportIds.includes(
              report.id,
            ),
        ),
      [
        selectedReportIds,
      ],
    );

  /*
   * Modos de filtro requeridos
   * por todos los reportes elegidos.
   */
  const filterModes =
    useMemo(
      () =>
        Array.from(
          new Set(
            selectedReports.map(
              (
                report,
              ) =>
                report.filterMode,
            ),
          ),
        ) as
          ReportFilterMode[],
      [
        selectedReports,
      ],
    );

  /*
   * ==========================================
   * RESULTADOS EXITOSOS
   * ==========================================
   */

  const successfulExecutions =
    useMemo(
      () =>
        executions.filter(
          (
            execution,
          ) =>
            execution.error ===
              null &&
            execution.data !==
              null,
        ),
      [
        executions,
      ],
    );

  /*
   * ==========================================
   * FAMILIAS
   * ==========================================
   */

  function toggleFamily(
    family:
      ReportFamily,
  ) {
    const alreadySelected =
      selectedFamilies.includes(
        family,
      );

    if (
      alreadySelected
    ) {
      setSelectedFamilies(
        (
          current,
        ) =>
          current.filter(
            (
              item,
            ) =>
              item !==
              family,
          ),
      );

      const idsFamily =
        new Set(
          reportesCatalog
            .filter(
              (
                report,
              ) =>
                report.family ===
                family,
            )
            .map(
              (
                report,
              ) =>
                report.id,
            ),
        );

      setSelectedReportIds(
        (
          current,
        ) =>
          current.filter(
            (
              id,
            ) =>
              !idsFamily.has(
                id,
              ),
          ),
      );
    } else {
      setSelectedFamilies(
        (
          current,
        ) => [
          ...current,
          family,
        ],
      );

      /*
       * Seleccionamos automáticamente
       * el primer reporte de la familia.
       */
      const first =
        reportesCatalog.find(
          (
            report,
          ) =>
            report.family ===
            family,
        );

      if (first) {
        setSelectedReportIds(
          (
            current,
          ) =>
            current.includes(
              first.id,
            )
              ? current
              : [
                  ...current,
                  first.id,
                ],
        );
      }
    }

    setExecutions(
      [],
    );

    setError(
      null,
    );
  }

  function seleccionarTodasFamilias() {
    if (
      selectedFamilies.length ===
      TODAS_FAMILIAS.length
    ) {
      setSelectedFamilies(
        [],
      );

      setSelectedReportIds(
        [],
      );
    } else {
      setSelectedFamilies(
        TODAS_FAMILIAS,
      );
    }

    setExecutions(
      [],
    );

    setError(
      null,
    );
  }

  /*
   * ==========================================
   * REPORTES
   * ==========================================
   */

  function toggleReport(
    id:
      string,
  ) {
    setSelectedReportIds(
      (
        current,
      ) =>
        current.includes(
          id,
        )
          ? current.filter(
              (
                item,
              ) =>
                item !==
                id,
            )
          : [
              ...current,
              id,
            ],
    );

    setExecutions(
      [],
    );

    setError(
      null,
    );
  }

  function seleccionarTodosReportesVisibles() {
    const visibleIds =
      visibleReports.map(
        (
          report,
        ) =>
          report.id,
      );

    const allSelected =
      visibleIds.length >
        0 &&
      visibleIds.every(
        (
          id,
        ) =>
          selectedReportIds.includes(
            id,
          ),
      );

    if (
      allSelected
    ) {
      const visibleSet =
        new Set(
          visibleIds,
        );

      setSelectedReportIds(
        (
          current,
        ) =>
          current.filter(
            (
              id,
            ) =>
              !visibleSet.has(
                id,
              ),
          ),
      );
    } else {
      setSelectedReportIds(
        (
          current,
        ) =>
          Array.from(
            new Set([
              ...current,
              ...visibleIds,
            ]),
          ),
      );
    }

    setExecutions(
      [],
    );

    setError(
      null,
    );
  }

  /*
   * ==========================================
   * VALIDACIÓN
   * ==========================================
   */

  function validarFiltros() {
    const requierePeriodo =
      filterModes.some(
        (
          mode,
        ) =>
          mode ===
            "periodo" ||
          mode ===
            "auditoria" ||
          mode ===
            "auditoriaMovimiento",
      );

    const requiereFechaCorte =
      filterModes.includes(
        "fechaCorte",
      );

    if (
      requierePeriodo &&
      filters.fechaDesde &&
      filters.fechaHasta &&
      filters.fechaDesde >
        filters.fechaHasta
    ) {
      return t("audit.dateRangeError");
    }

    if (
      requiereFechaCorte &&
      !filters.fechaCorte
    ) {
      return t("common.selectOption");
    }

    return null;
  }

  /*
   * ==========================================
   * CONSULTAR REPORTES
   * ==========================================
   */

  async function consultar() {
    if (
      selectedReports.length ===
      0
    ) {
      setError(
        t("reports.selectReport"),
      );

      return;
    }

    const validationError =
      validarFiltros();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
      null,
    );

    setExecutions(
      [],
    );

    try {
      const results =
        await Promise.all(
          selectedReports.map(
            async (
              report,
            ): Promise<ReportExecution> => {
              try {
                const data =
                  await report.load(
                    filters,
                  );

                return {
                  report,
                  data,
                  error:
                    null,
                };
              } catch (
                requestError
              ) {
                return {
                  report,

                  data:
                    null,

                  error:
                    requestError instanceof
                      Error
                      ? requestError.message
                      : t("reports.loadReportError"),
                };
              }
            },
          ),
        );

      setExecutions(
        results,
      );

      const failed =
        results.filter(
          (
            result,
          ) =>
            result.error !==
            null,
        );

      if (
        failed.length ===
        results.length
      ) {
        setError(
          t("reports.noReportsSelectedSuccessError"),
        );
      }
    } finally {
      setLoading(
        false,
      );
    }
  }

  /*
   * ==========================================
   * PREPARAR EXPORTACIÓN
   * ==========================================
   */

  function obtenerDatosExportacion():
    ReportExportItem[] {
    return successfulExecutions.map(
      (
        execution,
      ) => ({
        id:
          execution.report.id,

        family:
          execution.report.family,

        familyLabel:
          getFamilyLabel(
            execution.report.family,
          ),

        label:
          execution.report.label,

        description:
          execution.report.description,

        data:
          execution.data,
      }),
    );
  }

  function exportarPdf() {
    const reports =
      obtenerDatosExportacion();

    if (
      reports.length ===
      0
    ) {
      setError(
        t("reports.noReportsQueriedError"),
      );

      return;
    }

    exportarReportesPdf({
      filters,
      reports,
    });
  }

  function exportarExcel() {
    const reports =
      obtenerDatosExportacion();

    if (
      reports.length ===
      0
    ) {
      setError(
        t("reports.noReportsQueriedError"),
      );

      return;
    }

    exportarReportesExcel({
      filters,
      reports,
    });
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("navigation.reports")}
        description={t("reports.pageDesc")}
        icon={
          BarChart3
        }
      />

      {/* ====================================== */}
      {/* SELECCIÓN */}
      {/* ====================================== */}

      <SectionCard
        title={t("reports.buildReport")}
        description={t("reports.buildReportDesc")}
      >
        {/* FAMILIAS */}

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-950">
                {t("reports.families")}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {t("reports.familiesDesc")}
              </p>
            </div>

            <button
              type="button"
              onClick={
                seleccionarTodasFamilias
              }
              className="text-xs font-bold text-zinc-500 transition hover:text-zinc-950"
            >
              {selectedFamilies.length ===
              TODAS_FAMILIAS.length
                ? t("reports.clearAll")
                : t("reports.selectAll")}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TODAS_FAMILIAS.map(
              (
                family,
              ) => {
                const selected =
                  selectedFamilies.includes(
                    family,
                  );

                const count =
                  reportesCatalog.filter(
                    (
                      report,
                    ) =>
                      report.family ===
                      family,
                  ).length;

                return (
                  <button
                    key={
                      family
                    }
                    type="button"
                    onClick={() =>
                      toggleFamily(
                        family,
                      )
                    }
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition

                      ${
                        selected
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                      }
                    `}
                  >
                    <div
                      className={`
                        grid
                        h-9
                        w-9
                        shrink-0
                        place-items-center
                        rounded-xl

                        ${
                          selected
                            ? "bg-white/10"
                            : "bg-zinc-100"
                        }
                      `}
                    >
                      {selected ? (
                        <Check
                          size={
                            17
                          }
                        />
                      ) : (
                        <Layers3
                          size={
                            17
                          }
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {
                          getFamilyLabel(
                            family,
                          )
                        }
                      </p>

                      <p
                        className={`
                          mt-0.5
                          text-xs

                          ${
                            selected
                              ? "text-zinc-300"
                              : "text-zinc-400"
                          }
                        `}
                      >
                        {t("reports.reportsCount", { count })}
                      </p>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* REPORTES */}

        <div className="mt-7 border-t border-zinc-200 pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-950">
                {t("navigation.reports")}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {t("reports.selectReportsDesc")}
              </p>
            </div>

            {visibleReports.length >
            0 ? (
              <button
                type="button"
                onClick={
                  seleccionarTodosReportesVisibles
                }
                className="text-xs font-bold text-zinc-500 transition hover:text-zinc-950"
              >
                {visibleReports.every(
                  (
                    report,
                  ) =>
                    selectedReportIds.includes(
                      report.id,
                    ),
                )
                  ? t("reports.clearVisible")
                  : t("reports.selectVisible")}
              </button>
            ) : null}
          </div>

          {visibleReports.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-zinc-500">
                {t("reports.selectAtLeastOneFamily")}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleReports.map(
                (
                  report,
                ) => {
                  const selected =
                    selectedReportIds.includes(
                      report.id,
                    );

                  return (
                    <button
                      key={
                        report.id
                      }
                      type="button"
                      onClick={() =>
                        toggleReport(
                          report.id,
                        )
                      }
                      className={`
                        flex
                        min-h-[105px]
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition

                        ${
                          selected
                            ? "border-blue-300 bg-blue-50"
                            : "border-zinc-200 bg-white hover:border-zinc-400"
                        }
                      `}
                    >
                      <div
                        className={`
                          mt-0.5
                          grid
                          h-8
                          w-8
                          shrink-0
                          place-items-center
                          rounded-lg

                          ${
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-100 text-zinc-500"
                          }
                        `}
                      >
                        {selected ? (
                          <Check
                            size={
                              16
                            }
                          />
                        ) : (
                          <BarChart3
                            size={
                              16
                            }
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-950">
                          {
                            report.label
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {
                            report.description
                          }
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* RESUMEN DE SELECCIÓN */}

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
            {t("reports.familiesCount", { count: selectedFamilies.length })}
          </span>

          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
            {t("reports.reportsCount", { count: selectedReports.length })}
          </span>
        </div>

        {/* FILTROS */}

        {selectedReports.length >
        0 ? (
          <div className="mt-7 border-t border-zinc-200 pt-6">
            <div className="mb-4">
              <p className="text-sm font-bold text-zinc-950">
                {t("reports.combinedFilters")}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {t("reports.combinedFiltersDesc")}
              </p>
            </div>

            <ReportFilters
              modes={
                filterModes
              }
              value={
                filters
              }
              onChange={
                setFilters
              }
            />
          </div>
        ) : null}

        {/* CONSULTAR */}

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6">
          <PrimaryButton
            onClick={() => {
              void consultar();
            }}
            loading={
              loading
            }
            loadingText={t("reports.consultingReports")}
            disabled={
              loading ||
              selectedReports.length ===
                0
            }
          >
            {t("reports.consultReport", { count: selectedReports.length })}
          </PrimaryButton>
        </div>
      </SectionCard>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error ? (
        <AlertMessage
          variant="error"
          title={t("reports.operationErrorTitle")}
          message={
            error
          }
          onClose={() =>
            setError(
              null,
            )
          }
        />
      ) : null}

      {/* ====================================== */}
      {/* EXPORTACIÓN */}
      {/* ====================================== */}

      {successfulExecutions.length >
      0 ? (
        <SectionCard
          title={t("reports.saveReport")}
          description={t("reports.saveReportDesc")}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={
                exportarPdf
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-red-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-600
                focus-visible:ring-offset-2
              "
            >
              <FileText
                size={
                  18
                }
              />

              {t("reports.exportPdf")}
            </button>

            <button
              type="button"
              onClick={
                exportarExcel
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-emerald-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-600
                focus-visible:ring-offset-2
              "
            >
              <FileSpreadsheet
                size={
                  18
                }
              />

              {t("reports.exportExcel")}
            </button>

            <div className="flex items-center gap-2 px-2 text-xs text-zinc-500">
              <FileDown
                size={
                  15
                }
              />

              {t("reports.readyToExport", { count: successfulExecutions.length })}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {/* ====================================== */}
      {/* RESULTADOS */}
      {/* ====================================== */}

      {loading ? (
        <SectionCard
          title={t("reports.results")}
          description={t("reports.resultsConsultingDesc")}
        >
          <LoadingState message={t("reports.loadingReports")} />
        </SectionCard>
      ) : executions.length >
        0 ? (
        <div className="space-y-6">
          {executions.map(
            (
              execution,
            ) => (
              <SectionCard
                key={
                  execution.report.id
                }
                title={
                  execution.report.label
                }
                description={`${
                  getFamilyLabel(
                    execution.report
                      .family,
                  )
                } · ${
                  execution.report
                    .description
                }`}
              >
                {execution.error ? (
                  <AlertMessage
                    variant="error"
                    title={t("reports.loadReportError")}
                    message={
                      execution.error
                    }
                  />
                ) : (
                  <ReportResultView
                    data={
                      execution.data
                    }
                  />
                )}
              </SectionCard>
            ),
          )}
        </div>
      ) : (
        <SectionCard
          title={t("reports.results")}
          description={t("reports.resultsOfficialDesc")}
        >
          <div className="py-12 text-center">
            <BarChart3
              className="mx-auto h-8 w-8 text-zinc-300"
            />

            <p className="mt-3 text-sm font-semibold text-zinc-500">
              {t("reports.selectPrompt")}
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default ReportesPage;