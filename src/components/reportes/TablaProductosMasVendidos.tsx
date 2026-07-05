import DataTableShell from "../common/DataTableShell";
import SectionCard from "../common/SectionCard";
import type { ReporteProductoTop } from "./reportes.types";

type TablaProductosMasVendidosProps = {
  productos: ReporteProductoTop[];
};

function TablaProductosMasVendidos({ productos }: TablaProductosMasVendidosProps) {
  return (
    <SectionCard
      title="Productos más vendidos"
      description="Ideal para tomar decisiones de recompra."
    >
      <DataTableShell
        data={productos}
        emptyMessage="No hay datos de productos top."
        columns={[
          { key: "nombre", header: "Producto", render: (row) => row.nombre },
          { key: "cantidad", header: "Cantidad", render: (row) => row.cantidad },
        ]}
      />
    </SectionCard>
  );
}

export default TablaProductosMasVendidos;
