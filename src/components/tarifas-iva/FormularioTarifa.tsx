import { useTranslation } from "react-i18next";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import PrimaryButton from "../common/PrimaryButton";
import type {
  TarifaIVAFormErrors,
  TarifaIVAFormField,
  TarifaIVAFormState,
} from "./tarifas-iva.types";

type FormularioTarifaProps = {
  tarifa: TarifaIVAFormState;
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
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: FormularioTarifaProps) {
  const { t } = useTranslation();
  const resolvedSubmitLabel = submitLabel ?? t("common.save");

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
          label={t("common.code", "Código")}
          required
          value={tarifa.codigo}
          onChange={(value) => onChange("codigo", value)}
          placeholder="Ej. IVA13"
          maxLength={20}
          showCharacterCount
          error={errors.codigo}
        />

        <InputField
          label={t("vatRates.percentage", "Porcentaje (%)")}
          required
          type="text"
          value={tarifa.porcentaje}
          onChange={(value) => {
            const clean = value.replace(",", ".").replace(/[^\d.]/g, "");
            const parts = clean.split(".");
            if (parts.length > 2) return;
            if (parts[1] && parts[1].length > 2) return;
            const num = Number(clean);
            if (clean && !Number.isNaN(num) && num > 100) return;
            onChange("porcentaje", clean);
          }}
          placeholder="Ej. 13"
          maxLength={6}
          prefix="%"
          error={errors.porcentaje}
          helperText="Ingrese un valor entre 0 y 100 (ej. 13 para 13%)."
        />

        <div className="sm:col-span-2">
          <InputField
            label={t("common.description", "Descripción")}
            required
            value={tarifa.descripcion}
            onChange={(value) => onChange("descripcion", value)}
            placeholder={t("vatRates.descriptionPlaceholder", "Ej. Tarifa general 13%")}
            maxLength={45}
            showCharacterCount
            error={errors.descripcion}
          />
        </div>

        <SelectField
          label={t("common.status", "Estado")}
          required
          value={tarifa.estado}
          onChange={(value) => onChange("estado", value)}
          error={errors.estado}
          options={[
            { value: "ACTIVA", label: t("common.active", "Activo") },
            { value: "INACTIVA", label: t("common.inactive", "Inactivo") },
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
          {t("common.cancel")}
        </button>

        <PrimaryButton
          type="submit"
          loading={isSubmitting}
          loadingText={t("common.processing")}
        >
          {resolvedSubmitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default FormularioTarifa;