import { useTranslation } from "react-i18next";

import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import { translateStatus } from "../../i18n/statusMap";

export type ReportFilterMode =
  | "none"
  | "periodo"
  | "fechaCorte"
  | "auditoria"
  | "auditoriaMovimiento";

export type ReportFilterValues = {
  fechaDesde: string;
  fechaHasta: string;
  fechaCorte: string;
  usuarioId: string;
  tipoMovimiento: string;
};

type ReportFiltersProps = {
  /*
   * mode se conserva por compatibilidad
   * con código anterior.
   */
  mode?: ReportFilterMode;

  /*
   * Nuevo:
   * permite combinar varios tipos
   * de filtros simultáneamente.
   */
  modes?: ReportFilterMode[];

  value: ReportFilterValues;

  onChange: (
    next: ReportFilterValues,
  ) => void;
};

function ReportFilters({
  mode,
  modes,
  value,
  onChange,
}: ReportFiltersProps) {
  const { t } = useTranslation();

  const activeModes =
    modes ??
    (
      mode
        ? [mode]
        : []
    );

  const requierePeriodo =
    activeModes.some(
      (current) =>
        current === "periodo" ||
        current === "auditoria" ||
        current ===
          "auditoriaMovimiento",
    );

  const requiereFechaCorte =
    activeModes.includes(
      "fechaCorte",
    );

  const requiereUsuario =
    activeModes.some(
      (current) =>
        current === "auditoria" ||
        current ===
          "auditoriaMovimiento",
    );

  const requiereTipoMovimiento =
    activeModes.includes(
      "auditoriaMovimiento",
    );

  const sinFiltros =
    activeModes.length === 0 ||
    activeModes.every(
      (current) =>
        current === "none",
    );

  function setField(
    field:
      keyof ReportFilterValues,
    nextValue: string,
  ) {
    onChange({
      ...value,
      [field]:
        nextValue,
    });
  }

  if (sinFiltros) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
        <p className="text-sm font-semibold text-zinc-700">
          {t("reports.noFiltersRequired")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {requierePeriodo ? (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            {t("home.filterPeriod")}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label={t("reports.dateFrom")}
              type="date"
              value={
                value.fechaDesde
              }
              onChange={(
                next,
              ) =>
                setField(
                  "fechaDesde",
                  next,
                )
              }
            />

            <InputField
              label={t("reports.dateTo")}
              type="date"
              value={
                value.fechaHasta
              }
              onChange={(
                next,
              ) =>
                setField(
                  "fechaHasta",
                  next,
                )
              }
            />
          </div>
        </div>
      ) : null}

      {requiereFechaCorte ? (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            {t("reports.cutoffDate")}
          </p>

          <div className="max-w-sm">
            <InputField
              label={t("reports.cutoffDate")}
              type="date"
              value={
                value.fechaCorte
              }
              onChange={(
                next,
              ) =>
                setField(
                  "fechaCorte",
                  next,
                )
              }
              required
            />
          </div>
        </div>
      ) : null}

      {requiereUsuario ||
      requiereTipoMovimiento ? (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            {t("reports.audit")}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {requiereUsuario ? (
              <InputField
                label={t("reports.userId")}
                type="number"
                min={
                  1
                }
                step={
                  1
                }
                value={
                  value.usuarioId
                }
                onChange={(
                  next,
                ) =>
                  setField(
                    "usuarioId",
                    next,
                  )
                }
                placeholder={t("reports.all")}
              />
            ) : null}

            {requiereTipoMovimiento ? (
              <SelectField
                label={t("reports.movementType")}
                value={
                  value.tipoMovimiento
                }
                onChange={(
                  next,
                ) =>
                  setField(
                    "tipoMovimiento",
                    next,
                  )
                }
                options={[
                  {
                    value:
                      "",
                    label:
                      t("reports.all"),
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
        </div>
      ) : null}
    </div>
  );
}

export default ReportFilters;