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

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancelar
        </button>

        <PrimaryButton type="submit">
          {isSubmitting
            ? "Guardando..."
            : submitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default FormularioCategoria;
