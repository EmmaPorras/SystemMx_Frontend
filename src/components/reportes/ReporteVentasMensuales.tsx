import SectionCard from "../common/SectionCard";
import { formatCurrency } from "../common/formatters";

type ReporteVentasMensualesProps = {
  ventasDelMes: number;
};

function ReporteVentasMensuales({ ventasDelMes }: ReporteVentasMensualesProps) {
  return (
    <SectionCard
      title="Ventas mensuales"
      description="Indicador simple que luego puede salir de una consulta agregada del backend."
    >
      <p className="text-3xl font-semibold text-zinc-900">{formatCurrency(ventasDelMes)}</p>
      <p className="mt-2 text-sm text-zinc-500">
        Este bloque puede convertirse luego en gráfico por mes.
      </p>
    </SectionCard>
  );
}

export default ReporteVentasMensuales;
