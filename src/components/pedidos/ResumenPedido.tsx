import SectionCard from "../common/SectionCard";
import { formatCurrency } from "../common/formatters";
import type { PedidoDetalle } from "./pedidos.types";

type ResumenPedidoProps = {
  detalles: PedidoDetalle[];
};

function ResumenPedido({ detalles }: ResumenPedidoProps) {
  const subtotal = detalles.reduce((acc, item) => acc + item.subtotal, 0);
  const impuesto = detalles.reduce((acc, item) => acc + item.impuesto, 0);
  const total = detalles.reduce((acc, item) => acc + item.total, 0);

  return (
    <SectionCard
      title="Resumen del pedido"
      description="Este bloque replica la idea del maestro-detalle, pero adaptado a pedido de compra."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Subtotal</p>
          <p className="mt-2 text-xl font-semibold">{formatCurrency(subtotal)}</p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Impuesto</p>
          <p className="mt-2 text-xl font-semibold">{formatCurrency(impuesto)}</p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Total</p>
          <p className="mt-2 text-xl font-semibold">{formatCurrency(total)}</p>
        </div>
      </div>
    </SectionCard>
  );
}

export default ResumenPedido;
