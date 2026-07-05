import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import type { Venta } from "./ventas.types";

type FormularioVentaProps = {
  venta: Venta;
  onChange: (field: keyof Venta, value: string) => void;
  onSubmit: () => void;
};

function FormularioVenta({ venta, onChange, onSubmit }: FormularioVentaProps) {
  return (
    <SectionCard
      title="Cabecera de venta"
      description="Lista para conectar luego el descuento automático de inventario por FIFO."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputField
          label="Consecutivo"
          value={venta.consecutivo}
          onChange={(value) => onChange("consecutivo", value)}
          placeholder="VTA-0001"
        />
        <InputField
          label="Fecha"
          type="date"
          value={venta.fecha}
          onChange={(value) => onChange("fecha", value)}
        />
        <InputField
          label="Cliente"
          value={venta.cliente}
          onChange={(value) => onChange("cliente", value)}
          placeholder="Venta mostrador"
        />
        <SelectField
          label="Estado"
          value={venta.estado}
          onChange={(value) => onChange("estado", value)}
          options={[
            { value: "COMPLETADA", label: "Completada" },
            { value: "BORRADOR", label: "Borrador" },
            { value: "ANULADA", label: "Anulada" },
          ]}
        />
      </div>

      <div className="mt-5">
        <PrimaryButton onClick={onSubmit}>Guardar venta</PrimaryButton>
      </div>
    </SectionCard>
  );
}

export default FormularioVenta;
