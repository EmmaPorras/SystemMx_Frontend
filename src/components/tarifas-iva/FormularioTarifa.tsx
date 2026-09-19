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
  isSubmitting?: boolean;
  submitLabel?: string;
  onChange: (field: TarifaIVAFormField, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function FormularioTarifa({
  tarifa,
  errors,
  isSubmitting = false,
  submitLabel = "Guardar tarifa",
  onChange,
  onSubmit,
  onCancel,
}: FormularioTarifaProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isSubmitting) {
          onSubmit();
        }
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="sm:col-span-2">
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

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <PrimaryButton
          type="submit"
          loading={isSubmitting}
          loadingText="Guardando..."
        >
          {submitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default FormularioTarifa;