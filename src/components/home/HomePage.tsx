import type { ElementType } from "react";

import { TbMotorbikeFilled, TbReportMoney } from "react-icons/tb";
import { ImAddressBook } from "react-icons/im";
import { AiOutlinePercentage } from "react-icons/ai";
import { GrDropbox } from "react-icons/gr";
import { PiAirplaneTiltFill } from "react-icons/pi";
import { FaBoxesStacked } from "react-icons/fa6";
import { GiSellCard } from "react-icons/gi";

import PageHeader from "../common/PageHeader";
import StatCard from "../common/StatCard";
import ModuleCard from "./ModuleCard";
import { navigationItems } from "../common/navigation";

import {
  productosMock,
  pedidosMock,
  ventasMock,
  reporteResumenMock,
} from "../../data/mockData";

import { formatCurrency } from "../common/formatters";

/**
 * Íconos visuales para cada módulo.
 * Las rutas y funcionalidades se mantienen sin cambios.
 */
const moduleIcons: Record<string, ElementType> = {
  "/proveedores": ImAddressBook,
  "/tarifas-iva": AiOutlinePercentage,
  "/productos": GrDropbox,
  "/pedidos": PiAirplaneTiltFill,
  "/lotes": FaBoxesStacked,
  "/ventas": GiSellCard,
  "/reportes": TbReportMoney,
};

function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Inicio"
        description="Vista general del sistema."
        icon={TbMotorbikeFilled}
      />

      {/* Resumen general */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
            Resumen general
          </h2>

          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Primero: Pedidos registrados */}
          <StatCard
            label="Pedidos registrados"
            value={String(pedidosMock.length)}
            hint="Compras de inventario por proveedor y origen"
            icon={PiAirplaneTiltFill}
            variant="info"
          />

          {/* Segundo: Productos activos */}
          <StatCard
            label="Productos activos"
            value={String(productosMock.length)}
            hint="Catálogo principal para ventas e inventario"
            icon={GrDropbox}
            variant="success"
          />

          {/* Tercero: Ventas registradas */}
          <StatCard
            label="Ventas registradas"
            value={String(ventasMock.length)}
            hint="Salidas listas para conectar con FIFO"
            icon={GiSellCard}
            variant="success"
          />

          {/* Cuarto: Utilidad estimada */}
          <StatCard
            label="Utilidad estimada"
            value={formatCurrency(reporteResumenMock.utilidadEstimada)}
            hint="Dato de ejemplo para el dashboard"
            icon={TbReportMoney}
            variant="success"
          />
        </div>
      </section>

      {/* Módulos del sistema */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
              Módulos del sistema
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Seleccioná el módulo que deseás administrar.
            </p>
          </div>

          <div className="hidden h-px flex-1 bg-zinc-200 sm:block" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {navigationItems
            .filter((item) => item.path !== "/")
            .map((item) => (
              <ModuleCard
                key={item.path}
                title={item.label}
                description={item.description}
                to={item.path}
                icon={moduleIcons[item.path]}
              />
            ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;