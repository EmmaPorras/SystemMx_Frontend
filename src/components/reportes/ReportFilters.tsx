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
  mode: ReportFilterMode;
  value: ReportFilterValues;
  onChange: (
    next: ReportFilterValues,
  ) => void;
};

function ReportFilters({
  mode,
  value,
  onChange,
}: ReportFiltersProps) {
  if (mode === "none") {
    return null;
  }

  function setField(
    field: keyof ReportFilterValues,
    nextValue: string,
  ) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  if (mode === "fechaCorte") {
    return (
      <div className="max-w-sm">
        <InputField
          label="Fecha de corte"
          type="date"
          value={value.fechaCorte}
          onChange={(next) =>
            setField(
              "fechaCorte",
              next,
            )
          }
          required
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <InputField
        label="Fecha desde"
        type="date"
        value={value.fechaDesde}
        onChange={(next) =>
          setField(
            "fechaDesde",
            next,
          )
        }
      />

      <InputField
        label="Fecha hasta"
        type="date"
        value={value.fechaHasta}
        onChange={(next) =>
          setField(
            "fechaHasta",
            next,
          )
        }
      />

      {mode === "auditoria" ||
      mode === "auditoriaMovimiento" ? (
        <InputField
          label="ID usuario"
          type="number"
          min={1}
          step={1}
          value={value.usuarioId}
          onChange={(next) =>
            setField(
              "usuarioId",
              next,
            )
          }
          placeholder="Todos"
        />
      ) : null}

      {mode ===
      "auditoriaMovimiento" ? (
        <SelectField
          label="Tipo de movimiento"
          value={value.tipoMovimiento}
          onChange={(next) =>
            setField(
              "tipoMovimiento",
              next,
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
  );
}

export default ReportFilters;
