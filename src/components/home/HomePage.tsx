import PageHeader from "../common/PageHeader";
import StatCard from "../common/StatCard";
import ModuleCard from "./ModuleCard";
import { navigationItems } from "../common/navigation";
import { productosMock, pedidosMock, ventasMock, reporteResumenMock } from "../../data/mockData";
import { formatCurrency } from "../common/formatters";

function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inicio"
        description="Vista general del sistema. Esta base ya está organizada por módulos para que luego conectemos servicios, hooks y backend sin desarmar la estructura."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Productos activos"
          value={String(productosMock.length)}
          hint="Catálogo principal para ventas e inventario"
        />
        <StatCard
          label="Pedidos registrados"
          value={String(pedidosMock.length)}
          hint="Compras de inventario por proveedor y origen"
        />
        <StatCard
          label="Ventas registradas"
          value={String(ventasMock.length)}
          hint="Salidas listas para conectar con FIFO"
        />
        <StatCard
          label="Utilidad estimada"
          value={formatCurrency(reporteResumenMock.utilidadEstimada)}
          hint="Dato de ejemplo para el dashboard"
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {navigationItems
          .filter((item) => item.path !== "/")
          .map((item) => (
            <ModuleCard
              key={item.path}
              title={item.label}
              description={item.description}
              to={item.path}
            />
          ))}
      </section>
    </div>
  );
}

export default HomePage;
