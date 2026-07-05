import PageHeader from "../common/PageHeader";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../common/formatters";
import { reporteResumenMock } from "../../data/mockData";
import ReporteInventarioActual from "./ReporteInventarioActual";
import ReporteRentabilidad from "./ReporteRentabilidad";
import ReporteVentasMensuales from "./ReporteVentasMensuales";
import TablaProductosMasVendidos from "./TablaProductosMasVendidos";

function ReportesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Vista inicial de indicadores clave: ventas, inventario, rotación y rentabilidad por pedido."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Ventas del mes"
          value={formatCurrency(reporteResumenMock.ventasDelMes)}
          hint="Se alimentará de ventas registradas"
        />
        <StatCard
          label="Inversión pendiente"
          value={formatCurrency(reporteResumenMock.inversionPendiente)}
          hint="Capital aún no recuperado"
        />
        <StatCard
          label="Utilidad estimada"
          value={formatCurrency(reporteResumenMock.utilidadEstimada)}
          hint="Resumen para seguimiento"
        />
        <StatCard
          label="Baja rotación"
          value={String(reporteResumenMock.productosBajaRotacion)}
          hint="Productos que se mueven lento"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReporteVentasMensuales ventasDelMes={reporteResumenMock.ventasDelMes} />
        <ReporteInventarioActual
          productosBajaRotacion={reporteResumenMock.productosBajaRotacion}
        />
        <TablaProductosMasVendidos productos={reporteResumenMock.productosMasVendidos} />
        <ReporteRentabilidad
          rentabilidadPorPedido={reporteResumenMock.rentabilidadPorPedido}
        />
      </div>
    </div>
  );
}

export default ReportesPage;
