import type { TarifaIVA } from "./tarifas-iva.types";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";

type FormularioTarifaProps = {
  tarifa: TarifaIVA;
  onChange: (field: keyof TarifaIVA, value: string) => void;
  onSubmit: () => void;
};

function FormularioTarifa({ tarifa, onChange, onSubmit }: FormularioTarifaProps) {
  return (
    <SectionCard
      title="Formulario de tarifa IVA"
      description="Este módulo alimenta productos, pedidos y ventas."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Código"
          value={tarifa.codigo}
          onChange={(value) => onChange("codigo", value)}
          placeholder="Ejemplo: IVA13"
        />
        <InputField
          label="Porcentaje"
          type="number"
          value={tarifa.porcentaje}
          onChange={(value) => onChange("porcentaje", value)}
          placeholder="Ejemplo: 13"
        />
        <div className="md:col-span-2">
          <InputField
            label="Descripción"
            value={tarifa.descripcion}
            onChange={(value) => onChange("descripcion", value)}
            placeholder="Descripción de la tarifa"
          />
        </div>
        <SelectField
          label="Estado"
          value={tarifa.estado}
          onChange={(value) => onChange("estado", value)}
          options={[
            { value: "ACTIVA", label: "Activa" },
            { value: "INACTIVA", label: "Inactiva" },
          ]}
        />
      </div>

      <div className="mt-5">
        <PrimaryButton onClick={onSubmit}>Guardar tarifa</PrimaryButton>
      </div>
    </SectionCard>
  );
}

export default FormularioTarifa;
