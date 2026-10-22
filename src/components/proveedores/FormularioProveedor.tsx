import { useTranslation } from "react-i18next";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SearchableSelectField from "../common/SearchableSelectField";
import SelectField from "../common/SelectField";
import { usePaisesOptions } from "../../data/paises";
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
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: FormularioProveedorProps) {
  const { t } = useTranslation();
  const paisesOptions = usePaisesOptions();
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
          label={t("common.name")}
          required
          value={proveedor.nombre}
          onChange={(value) => onChange("nombre", value)}
          placeholder={t("suppliers.namePlaceholder")}
          maxLength={40}
          showCharacterCount
          error={errors.nombre}
        />

        <InputField
          label={t("suppliers.phone")}
          required
          value={proveedor.telefono}
          onChange={(value) => onChange("telefono", value)}
          placeholder={t("suppliers.phonePlaceholder")}
          maxLength={20}
          showCharacterCount
          error={errors.telefono}
        />

        <InputField
          label={t("suppliers.email")}
          required
          type="email"
          value={proveedor.correo}
          onChange={(value) => onChange("correo", value)}
          placeholder={t("suppliers.emailPlaceholder")}
          maxLength={100}
          error={errors.correo}
        />

        <SearchableSelectField
          label={t("suppliers.country")}
          required
          value={proveedor.pais}
          onChange={(value) => onChange("pais", value)}
          placeholder={t("suppliers.countryPlaceholder")}
          error={errors.pais}
          options={paisesOptions}
        />

        <SelectField
          label={t("suppliers.currency")}
          required
          value={proveedor.monedaPreferida}
          onChange={(value) => onChange("monedaPreferida", value)}
          placeholder={t("suppliers.currencyPlaceholder")}
          error={errors.monedaPreferida}
          options={monedaPreferidaOptions}
        />

        <SelectField
          label={t("common.status")}
          required
          value={proveedor.estado}
          onChange={(value) => onChange("estado", value)}
          error={errors.estado}
          options={[
            { value: "ACTIVO", label: t("common.active") },
            { value: "INACTIVO", label: t("common.inactive") },
          ]}
        />

        <div className="sm:col-span-2">
          <InputField
            label={t("suppliers.address")}
            value={proveedor.direccion}
            onChange={(value) => onChange("direccion", value)}
            placeholder={t("suppliers.addressPlaceholder")}
            maxLength={150}
            showCharacterCount
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

export default FormularioProveedor;
