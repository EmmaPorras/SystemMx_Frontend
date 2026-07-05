import DataTableShell from "../common/DataTableShell";
import SectionCard from "../common/SectionCard";
import { formatCurrency } from "../common/formatters";
import type { ReporteRentabilidadPedido } from "./reportes.types";

type ReporteRentabilidadProps = {
  rentabilidadPorPedido: ReporteRentabilidadPedido[];
};

function ReporteRentabilidad({ rentabilidadPorPedido }: ReporteRentabilidadProps) {
  return (
    <SectionCard
      title="Rentabilidad por pedido"
      description="Este reporte conecta directamente con la idea de medir inversión, recuperación y utilidad por compra."
    >
      <DataTableShell
        data={rentabilidadPorPedido}
        emptyMessage="No hay datos de rentabilidad."
        columns={[
          { key: "pedido", header: "Pedido", render: (row) => row.pedidoNumero },
          {
            key: "inversion",
            header: "Inversión",
            render: (row) => formatCurrency(row.inversion),
          },
          {
            key: "venta",
            header: "Venta generada",
            render: (row) => formatCurrency(row.ventaGenerada),
          },
          {
            key: "utilidad",
            header: "Utilidad",
            render: (row) => formatCurrency(row.utilidad),
          },
        ]}
      />
    </SectionCard>
  );
}

export default ReporteRentabilidad;
