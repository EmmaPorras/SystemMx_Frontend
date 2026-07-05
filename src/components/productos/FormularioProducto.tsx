import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import type { Producto } from "./productos.types";

type FormularioProductoProps = {
  producto: Producto;
  proveedores: Array<{ id: number; nombre: string }>;
  tarifas: Array<{ id: number; descripcion: string; porcentaje: number }>;
  onChange: (field: keyof Producto, value: string) => void;
  onSubmit: () => void;
};

function FormularioProducto({
  producto,
  proveedores,
  tarifas,
  onChange,
  onSubmit,
}: FormularioProductoProps) {
  return (
    <SectionCard
      title="Formulario de producto"
      description="Queda listo para conectar catálogos de proveedores y tarifas desde backend."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InputField
          label="Nombre"
          value={producto.nombre}
          onChange={(value) => onChange("nombre", value)}
          placeholder="Nombre del producto"
        />
        <InputField
          label="Categoría"
          value={producto.categoria}
          onChange={(value) => onChange("categoria", value)}
          placeholder="Categoría"
        />
        <InputField
          label="Precio de referencia"
          type="number"
          value={producto.precioReferencia}
          onChange={(value) => onChange("precioReferencia", value)}
          placeholder="0.00"
        />
        <InputField
          label="Stock inicial"
          type="number"
          value={producto.stockTotal}
          onChange={(value) => onChange("stockTotal", value)}
          placeholder="0"
        />
        <SelectField
          label="Proveedor"
          value={producto.proveedorId}
          onChange={(value) => onChange("proveedorId", value)}
          options={proveedores.map((item) => ({ value: item.id, label: item.nombre }))}
        />
        <SelectField
          label="Tarifa IVA"
          value={producto.tarifaIvaId}
          onChange={(value) => onChange("tarifaIvaId", value)}
          options={tarifas.map((item) => ({
            value: item.id,
            label: `${item.descripcion} (${item.porcentaje}%)`,
          }))}
        />
        <SelectField
          label="Estado"
          value={producto.estado}
          onChange={(value) => onChange("estado", value)}
          options={[
            { value: "ACTIVO", label: "Activo" },
            { value: "INACTIVO", label: "Inactivo" },
          ]}
        />
      </div>

      <div className="mt-5">
        <PrimaryButton onClick={onSubmit}>Guardar producto</PrimaryButton>
      </div>
    </SectionCard>
  );
}

export default FormularioProducto;
