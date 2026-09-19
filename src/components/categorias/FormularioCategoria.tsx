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
        label="Nombre"
        value={value.nombre}
        onChange={(nextValue) =>
          onChange("nombre", nextValue)
        }
        placeholder="Ej. Repuestos, Accesorios, Llantas"
        required
        maxLength={100}
        showCharacterCount
        error={errors.nombre}
      />

      <InputField
        label="Descripción"
        value={value.descripcion}
        onChange={(nextValue) =>
          onChange("descripcion", nextValue)
        }
        placeholder="Descripción opcional de la categoría"
        maxLength={255}
        showCharacterCount
        error={errors.descripcion}
      />

      <SelectField
        label="Estado"
        value={value.activo ? "ACTIVO" : "INACTIVO"}
        onChange={(nextValue) =>
          onChange("activo", nextValue === "ACTIVO")
        }
        options={[
          {
            value: "ACTIVO",
            label: "Activa",
          },
          {
            value: "INACTIVO",
            label: "Inactiva",
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

export default FormularioCategoria;
