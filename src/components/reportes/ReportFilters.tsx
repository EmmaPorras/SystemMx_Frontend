import InputField from "../common/InputField";
import SelectField from "../common/SelectField";

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
          Los reportes seleccionados no requieren filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {requierePeriodo ? (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Período
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Fecha desde"
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
              label="Fecha hasta"
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
            Fecha de corte
          </p>

          <div className="max-w-sm">
            <InputField
              label="Fecha de corte"
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
            Auditoría
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {requiereUsuario ? (
              <InputField
                label="ID usuario"
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
                placeholder="Todos"
              />
            ) : null}

            {requiereTipoMovimiento ? (
              <SelectField
                label="Tipo de movimiento"
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
                      "Todos",
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
        </div>
      ) : null}
    </div>
  );
}

export default ReportFilters;