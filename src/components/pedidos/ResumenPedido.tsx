import SectionCard from "../common/SectionCard";
import { formatCurrency } from "../common/formatters";
import type { PedidoDetalle } from "./pedidos.types";

type ResumenPedidoProps = {
  detalles: PedidoDetalle[];
};

function ResumenPedido({ detalles }: ResumenPedidoProps) {
  const costoTotal = detalles.reduce(
    (acc, item) => acc + item.costoUnitarioReal * item.cantidad,
    0,
  );

  const valorVentaEstimado = detalles.reduce(
    (acc, item) => acc + item.precioVentaRecomendado * item.cantidad,
    0,
  );

  const stockActual = detalles.reduce(
    (acc, item) => acc + item.cantidadDisponible,
    0,
  );

  return (
    <SectionCard
      title="Resumen del pedido"
      description="Resumen basado en los lotes asociados al pedido."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Costo total real</p>
          <p className="mt-2 text-xl font-semibold">{formatCurrency(costoTotal)}</p>
        </div>

        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Venta estimada</p>
          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(valorVentaEstimado)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Stock actual</p>
          <p className="mt-2 text-xl font-semibold">{stockActual}</p>
        </div>
      </div>
    </SectionCard>
  );
}

export default ResumenPedido;