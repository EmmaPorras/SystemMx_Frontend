import SectionCard from "../common/SectionCard";

type ReporteInventarioActualProps = {
  productosBajaRotacion: number;
};

function ReporteInventarioActual({
  productosBajaRotacion,
}: ReporteInventarioActualProps) {
  return (
    <SectionCard
      title="Inventario actual"
      description="Resumen rápido para detectar productos lentos o con rotación baja."
    >
      <p className="text-3xl font-semibold text-zinc-900">{productosBajaRotacion}</p>
      <p className="mt-2 text-sm text-zinc-500">
        Productos marcados como de baja salida en este ejemplo.
      </p>
    </SectionCard>
  );
}

export default ReporteInventarioActual;
