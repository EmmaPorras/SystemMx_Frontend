import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import type { PedidoCompra } from "./pedidos.types";

type FormularioPedidoProps = {
  pedido: PedidoCompra;
  proveedores: Array<{ id: number; nombre: string }>;
  onChange: (field: keyof PedidoCompra, value: string) => void;
  onSubmit: () => void;
};

function FormularioPedido({
  pedido,
  proveedores,
  onChange,
  onSubmit,
}: FormularioPedidoProps) {
  return (
    <SectionCard
      title="Cabecera del pedido"
      description="Aquí preparamos la compra antes de registrar lotes y entrada de inventario."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputField
          label="Número de pedido"
          value={pedido.numeroPedido}
          onChange={(value) => onChange("numeroPedido", value)}
          placeholder="PED-0001"
        />
        <InputField
          label="Fecha"
          type="date"
          value={pedido.fecha}
          onChange={(value) => onChange("fecha", value)}
        />
        <InputField
          label="Origen"
          value={pedido.origen}
          onChange={(value) => onChange("origen", value)}
          placeholder="AliExpress, Temu, Alibaba..."
        />
        <SelectField
          label="Proveedor"
          value={pedido.proveedorId}
          onChange={(value) => onChange("proveedorId", value)}
          options={proveedores.map((item) => ({ value: item.id, label: item.nombre }))}
        />
        <div className="xl:col-span-2">
          <InputField
            label="Observaciones"
            value={pedido.observaciones}
            onChange={(value) => onChange("observaciones", value)}
            placeholder="Notas del pedido"
          />
        </div>
        <SelectField
          label="Estado"
          value={pedido.estado}
          onChange={(value) => onChange("estado", value)}
          options={[
            { value: "REGISTRADO", label: "Registrado" },
            { value: "EN_TRANSITO", label: "En tránsito" },
            { value: "RECIBIDO", label: "Recibido" },
          ]}
        />
      </div>

      <div className="mt-5">
        <PrimaryButton onClick={onSubmit}>Guardar pedido</PrimaryButton>
      </div>
    </SectionCard>
  );
}

export default FormularioPedido;
