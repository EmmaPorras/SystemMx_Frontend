import {
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";

import ReportFilters, {
  type ReportFilterValues,
} from "./ReportFilters";

import ReportResultView from "./ReportResultView";

import {
  reportesCatalog,
  reportFamilyLabels,
  type ReportFamily,
} from "./reportes.catalog";

function fechaActual(): string {
  const now = new Date();

  return [
    now.getFullYear(),

    String(
      now.getMonth() + 1,
    ).padStart(2, "0"),

    String(
      now.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}

const INITIAL_FILTERS:
  ReportFilterValues = {
  fechaDesde: "",
  fechaHasta: "",
  fechaCorte: fechaActual(),
  usuarioId: "",
  tipoMovimiento: "",
};

function ReportesPage() {
  const [family, setFamily] =
    useState<ReportFamily>(
      "resumen",
    );

  const familyReports =
    useMemo(
      () =>
        reportesCatalog.filter(
          (report) =>
            report.family === family,
        ),
      [family],
    );

  const [
    selectedReportId,
    setSelectedReportId,
  ] = useState("resumen");

  const [filters, setFilters] =
    useState<ReportFilterValues>(
      INITIAL_FILTERS,
    );

  const [result, setResult] =
    useState<unknown>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedReport =
    useMemo(
      () =>
        reportesCatalog.find(
          (report) =>
            report.id ===
            selectedReportId,
        ) ??
        familyReports[0] ??
        null,
      [
        selectedReportId,
        familyReports,
      ],
    );

  function handleFamilyChange(
    value: string,
  ) {
    const nextFamily =
      value as ReportFamily;

    const first =
      reportesCatalog.find(
        (report) =>
          report.family ===
          nextFamily,
      );

    setFamily(nextFamily);

    if (first) {
      setSelectedReportId(
        first.id,
      );
    }

    setFilters(INITIAL_FILTERS);
    setResult(null);
    setError(null);
  }

  async function consultar() {
    if (!selectedReport) {
      return;
    }

    if (
      filters.fechaDesde &&
      filters.fechaHasta &&
      filters.fechaDesde >
        filters.fechaHasta
    ) {
      setError(
        "La fecha desde no puede ser posterior a la fecha hasta.",
      );

      return;
    }

    if (
      selectedReport.filterMode ===
        "fechaCorte" &&
      !filters.fechaCorte
    ) {
      setError(
        "Seleccione una fecha de corte.",
      );

      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response =
        await selectedReport.load(
          filters,
        );

      setResult(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible consultar el reporte.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Centro analítico de ventas, inventario, compras, pagos y auditoría."
        icon={BarChart3}
      />

      <SectionCard
        title="Seleccionar reporte"
        description="Todos los datos son calculados por el backend."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Familia"
            value={family}
            onChange={
              handleFamilyChange
            }
            options={Object.entries(
              reportFamilyLabels,
            ).map(
              ([value, label]) => ({
                value,
                label,
              }),
            )}
          />

          <SelectField
            label="Reporte"
            value={
              selectedReport?.id ?? ""
            }
            onChange={(value) => {
              setSelectedReportId(
                value,
              );

              setResult(null);
              setError(null);
            }}
            options={familyReports.map(
              (report) => ({
                value: report.id,
                label: report.label,
              }),
            )}
          />
        </div>

        {selectedReport ? (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="font-semibold text-zinc-950">
              {selectedReport.label}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              {
                selectedReport.description
              }
            </p>
          </div>
        ) : null}

        {selectedReport ? (
          <div className="mt-6">
            <ReportFilters
              mode={
                selectedReport.filterMode
              }
              value={filters}
              onChange={setFilters}
            />
          </div>
        ) : null}

        <div className="mt-6">
          <PrimaryButton
            onClick={() => {
              void consultar();
            }}
            loading={loading}
            loadingText="Consultando reporte..."
            disabled={loading}
          >
            Consultar reporte
          </PrimaryButton>
        </div>
      </SectionCard>

      {error ? (
        <AlertMessage
          variant="error"
          title="No fue posible cargar el reporte"
          message={error}
          onClose={() =>
            setError(null)
          }
        />
      ) : null}

      <SectionCard
        title={
          selectedReport?.label ??
          "Resultado"
        }
        description="Información oficial devuelta por SystemMx."
      >
        {loading ? (
          <LoadingState message="Consultando reporte..." />
        ) : result !== null ? (
          <ReportResultView
            data={result}
          />
        ) : (
          <div className="py-12 text-center">
            <BarChart3
              className="mx-auto h-8 w-8 text-zinc-300"
            />

            <p className="mt-3 text-sm font-semibold text-zinc-500">
              Seleccione los filtros y consulte el reporte.
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default ReportesPage;
