import DataTableShell from "../common/DataTableShell";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../common/formatters";
import type { PedidoCompra } from "./pedidos.types";

type TablaPedidosProps = {
  pedidos: PedidoCompra[];
};

function TablaPedidos({ pedidos }: TablaPedidosProps) {
  return (
    <DataTableShell
      data={pedidos}
      emptyMessage="Todavía no hay pedidos registrados."
      columns={[
        { key: "numero", header: "Pedido", render: (row) => row.numeroPedido },
        { key: "fecha", header: "Fecha", render: (row) => row.fecha },
        { key: "origen", header: "Origen", render: (row) => row.origen },
        { key: "proveedor", header: "Proveedor", render: (row) => row.proveedorNombre },
        {
          key: "inversion",
          header: "Inversión total",
          render: (row) => formatCurrency(row.inversionTotal),
        },
        {
          key: "estado",
          header: "Estado",
          render: (row) => (
            <StatusBadge
              label={row.estado}
              variant={
                row.estado === "RECIBIDO"
                  ? "success"
                  : row.estado === "EN_TRANSITO"
                    ? "warning"
                    : "neutral"
              }
            />
          ),
        },
      ]}
    />
  );
}

export default TablaPedidos;
