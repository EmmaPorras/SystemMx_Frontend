import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SearchableSelectField from "../common/SearchableSelectField";
import SelectField from "../common/SelectField";
import { paisesOptions } from "../../data/paises";
import {
  monedaPreferidaOptions,
  type Proveedor,
  type ProveedorFormErrors,
  type ProveedorFormField,
} from "./proveedores.types";

type FormularioProveedorProps = {
  proveedor: Proveedor;
  errors: ProveedorFormErrors;
  isSubmitting?: boolean;
  submitLabel?: string;
  onChange: (field: ProveedorFormField, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function FormularioProveedor({
  proveedor,
  errors,
  isSubmitting = false,
  submitLabel = "Guardar proveedor",
  onChange,
  onSubmit,
  onCancel,
}: FormularioProveedorProps) {
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
          label="Nombre"
          required
          value={proveedor.nombre}
          onChange={(value) => onChange("nombre", value)}
          placeholder="Ejemplo: Proveedor Central"
          maxLength={40}
          showCharacterCount
          error={errors.nombre}
        />

        <InputField
          label="Teléfono"
          required
          value={proveedor.telefono}
          onChange={(value) => onChange("telefono", value)}
          placeholder="Ejemplo: +506 8888-8888"
          maxLength={20}
          showCharacterCount
          helperText="Puede incluir código de país, espacios, guiones o paréntesis."
          error={errors.telefono}
        />

        <InputField
          label="Correo"
          required
          type="email"
          value={proveedor.correo}
          onChange={(value) => onChange("correo", value)}
          placeholder="correo@ejemplo.com"
          maxLength={100}
          error={errors.correo}
        />

        <SearchableSelectField
          label="País de origen"
          required
          value={proveedor.pais}
          onChange={(value) => onChange("pais", value)}
          placeholder="Seleccione el país del proveedor"
          error={errors.pais}
          options={paisesOptions}
        />

        <SelectField
          label="Moneda preferida"
          required
          value={proveedor.monedaPreferida}
          onChange={(value) => onChange("monedaPreferida", value)}
          placeholder="Seleccioná una moneda"
          error={errors.monedaPreferida}
          options={monedaPreferidaOptions}
        />

        <SelectField
          label="Estado"
          required
          value={proveedor.estado}
          onChange={(value) => onChange("estado", value)}
          error={errors.estado}
          options={[
            { value: "ACTIVO", label: "Activo" },
            { value: "INACTIVO", label: "Inactivo" },
          ]}
        />

        <div className="sm:col-span-2">
          <InputField
            label="Dirección exacta"
            value={proveedor.direccion}
            onChange={(value) => onChange("direccion", value)}
            placeholder="Opcional: ciudad, calle, edificio o referencia"
            maxLength={150}
            showCharacterCount
            helperText="Este campo es opcional y se mostrará únicamente en el detalle del proveedor."
            error={errors.direccion}
          />
        </div>
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

export default FormularioProveedor;
