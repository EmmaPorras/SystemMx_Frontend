import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import PrimaryButton from "../common/PrimaryButton";
import type {
  TarifaIVA,
  TarifaIVAFormErrors,
  TarifaIVAFormField,
} from "./tarifas-iva.types";

type FormularioTarifaProps = {
  tarifa: TarifaIVA;
  errors: TarifaIVAFormErrors;
  submitLabel?: string;
  onChange: (field: TarifaIVAFormField, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function FormularioTarifa({
  tarifa,
  errors,
  submitLabel = "Guardar tarifa",
  onChange,
  onSubmit,
  onCancel,
}: FormularioTarifaProps) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Código"
          required
          value={tarifa.codigo}
          onChange={(value) => onChange("codigo", value)}
          placeholder="Ejemplo: IVA13"
          maxLength={20}
          showCharacterCount
          error={errors.codigo}
        />

        <InputField
          label="Porcentaje"
          required
          type="number"
          value={tarifa.porcentaje}
          onChange={(value) => onChange("porcentaje", value)}
          placeholder="Ejemplo: 13"
          min={0}
          max={100}
          step={0.01}
          helperText="Solo números. Puede escribirse o ajustarse con las flechas."
          error={errors.porcentaje}
        />

        <div className="md:col-span-2">
          <InputField
            label="Descripción"
            required
            value={tarifa.descripcion}
            onChange={(value) => onChange("descripcion", value)}
            placeholder="Ejemplo: Tarifa general del IVA"
            maxLength={45}
            showCharacterCount
            error={errors.descripcion}
          />
        </div>

        <SelectField
          label="Estado"
          required
          value={tarifa.estado}
          onChange={(value) => onChange("estado", value)}
          error={errors.estado}
          options={[
            { value: "ACTIVA", label: "Activa" },
            { value: "INACTIVA", label: "Inactiva" },
          ]}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancelar
        </button>

        <PrimaryButton onClick={onSubmit}>{submitLabel}</PrimaryButton>
      </div>
    </div>
  );
}

export default FormularioTarifa;