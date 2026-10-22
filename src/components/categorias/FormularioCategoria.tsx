import { useTranslation } from "react-i18next";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SelectField from "../common/SelectField";

import type {
  CategoriaFormData,
  CategoriaFormErrors,
} from "./categorias.types";

type FormularioCategoriaProps = {
  value: CategoriaFormData;
  errors: CategoriaFormErrors;
  isSubmitting: boolean;
  submitLabel: string;
  onChange: (
    field: keyof CategoriaFormData,
    value: string | boolean,
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function FormularioCategoria({
  value,
  errors,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: FormularioCategoriaProps) {
  const { t } = useTranslation();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isSubmitting) {
          onSubmit();
        }
      }}
    >
      <InputField
        label={t("categories.name")}
        value={value.nombre}
        onChange={(nextValue) =>
          onChange("nombre", nextValue)
        }
        placeholder={t("categories.namePlaceholder")}
        required
        maxLength={100}
        showCharacterCount
        error={errors.nombre}
      />

      <InputField
        label={t("categories.description")}
        value={value.descripcion}
        onChange={(nextValue) =>
          onChange("descripcion", nextValue)
        }
        placeholder={t("categories.descriptionPlaceholder")}
        maxLength={255}
        showCharacterCount
        error={errors.descripcion}
      />

      <SelectField
        label={t("categories.status")}
        value={value.activo ? "ACTIVO" : "INACTIVO"}
        onChange={(nextValue) =>
          onChange("activo", nextValue === "ACTIVO")
        }
        options={[
          {
            value: "ACTIVO",
            label: t("common.active"),
          },
          {
            value: "INACTIVO",
            label: t("common.inactive"),
          },
        ]}
      />

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
          {submitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default FormularioCategoria;
