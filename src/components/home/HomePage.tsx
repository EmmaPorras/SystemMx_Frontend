import {
  useEffect,
  useState,
} from "react";
import {
  Boxes,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import { TbMotorbikeFilled } from "react-icons/tb";

import AlertMessage from "../common/AlertMessage";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import StatCard from "../common/StatCard";
import ModuleCard from "./ModuleCard";
import { navigationItems } from "../common/navigation";
import { formatCurrency } from "../common/formatters";
import { obtenerResumenDashboard } from "../../services/dashboardApi";
import type { ResumenDashboard } from "./dashboard.types";

function HomePage() {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarResumen() {
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerResumenDashboard();
      setResumen(data);
    } catch (requestError) {
      setResumen(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar el resumen del sistema.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarResumen();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inicio"
        description="Vista general del sistema."
        icon={TbMotorbikeFilled}
      />

      {error ? (
        <div className="space-y-3">
          <AlertMessage
            variant="error"
            title="No fue posible cargar el Dashboard"
            message={error}
            onClose={() => setError(null)}
          />

          <PrimaryButton
            onClick={() => {
              void cargarResumen();
            }}
          >
            Reintentar
          </PrimaryButton>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
            Resumen general
          </h2>

          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <LoadingState message="Cargando resumen del sistema..." />
          </div>
        ) : resumen ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard
              label="Ventas registradas"
              value={String(resumen.ventas.cantidad)}
              hint={`Ventas acumuladas por ${formatCurrency(
                resumen.ventas.total,
              )}`}
              icon={ShoppingCart}
              variant="success"
            />

            <StatCard
              label="Ganancia bruta"
              value={formatCurrency(
                resumen.ventas.gananciaBruta,
              )}
              hint={`Margen bruto: ${resumen.ventas.margenBrutoPorcentaje.toFixed(
                2,
              )}%`}
              icon={CircleDollarSign}
              variant="success"
            />

            <StatCard
              label="Inventario disponible"
              value={String(
                resumen.inventario.unidadesDisponibles,
              )}
              hint={`${resumen.inventario.lotesConStock} lotes con stock`}
              icon={Boxes}
              variant="info"
            />

            <StatCard
              label="Cuentas por cobrar"
              value={formatCurrency(
                resumen.cuentasPorCobrar.saldo,
              )}
              hint={`${resumen.cuentasPorCobrar.ventasConSaldo} ventas con saldo pendiente`}
              icon={WalletCards}
              variant={
                resumen.cuentasPorCobrar.saldo > 0
                  ? "warning"
                  : "neutral"
              }
            />

            <StatCard
              label="Pedidos registrados"
              value={String(resumen.pedidos.total)}
              hint={`${resumen.pedidos.pendientes} pedidos pendientes`}
              icon={ReceiptText}
              variant="info"
            />

            <StatCard
              label="Pedidos recibidos"
              value={String(resumen.pedidos.recibidos)}
              hint={`${resumen.pedidos.enTransito} pedidos en tránsito`}
              icon={PackageCheck}
              variant="success"
            />

            <StatCard
              label="Saldo pendiente ventas"
              value={formatCurrency(
                resumen.ventas.saldoPendiente,
              )}
              hint={`Pagado: ${formatCurrency(
                resumen.ventas.montoPagado,
              )}`}
              icon={WalletCards}
              variant={
                resumen.ventas.saldoPendiente > 0
                  ? "warning"
                  : "neutral"
              }
            />

            <StatCard
              label="Valor del inventario"
              value={formatCurrency(
                resumen.inventario.valorCosto,
              )}
              hint="Valor actual del inventario disponible a costo"
              icon={Boxes}
              variant="neutral"
            />
          </div>
        ) : null}
      </section>

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navigationItems
            .filter((item) => item.path !== "/")
            .map((item) => (
              <ModuleCard
                key={item.path}
                title={item.label}
                description={item.description}
                to={item.path}
                icon={item.icon}
              />
            ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;