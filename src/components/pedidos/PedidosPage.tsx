import { useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import { pedidosMock, proveedoresMock, pedidoDetallesMock } from "../../data/mockData";
import FormularioPedido from "./FormularioPedido";
import PedidoDetalleTable from "./PedidoDetalleTable";
import ResumenPedido from "./ResumenPedido";
import TablaPedidos from "./TablaPedidos";
import type { PedidoCompra } from "./pedidos.types";

const pedidoInicial: PedidoCompra = {
  id: 0,
  numeroPedido: "",
  fecha: new Date().toISOString().slice(0, 10),
  origen: "",
  proveedorId: 0,
  proveedorNombre: "",
  inversionTotal: 0,
  observaciones: "",
  estado: "REGISTRADO",
  detalles: [],
};

function PedidosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pedido, setPedido] = useState<PedidoCompra>({
    ...pedidoInicial,
    detalles: pedidoDetallesMock,
  });

  const pedidosFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return pedidosMock;

    return pedidosMock.filter((item) =>
      [item.numeroPedido, item.origen, item.proveedorNombre, item.estado]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda]);

  function actualizarPedido(field: keyof PedidoCompra, value: string) {
    setPedido((prev) => ({
      ...prev,
      [field]: field === "proveedorId" ? Number(value) : value,
    }));
  }

  function guardarPedidoLocal() {
    console.log("Pedido listo para backend:", pedido);
    setMostrarFormulario(false);
    setPedido({ ...pedidoInicial, detalles: pedidoDetallesMock });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de compra"
        description="Este módulo reemplaza la idea anterior de facturas de compra, para dejar el sistema listo para trazabilidad por pedido y creación de lotes."
        action={
          <PrimaryButton onClick={() => setMostrarFormulario((prev) => !prev)}>
            + Nuevo pedido
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Pedidos registrados"
          value={String(pedidosMock.length)}
          hint="Base para trazabilidad de inversión"
        />
        <StatCard
          label="En tránsito"
          value={String(pedidosMock.filter((item) => item.estado === "EN_TRANSITO").length)}
          hint="Pedidos aún no recibidos"
        />
        <StatCard
          label="Recibidos"
          value={String(pedidosMock.filter((item) => item.estado === "RECIBIDO").length)}
          hint="Entradas listas para lotes"
        />
        <StatCard
          label="Origen múltiple"
          value="Sí"
          hint="AliExpress, Temu, Alibaba u otros"
        />
      </div>

      {mostrarFormulario ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <FormularioPedido
              pedido={pedido}
              proveedores={proveedoresMock}
              onChange={actualizarPedido}
              onSubmit={guardarPedidoLocal}
            />

            <SectionCard
              title="Detalle de artículos"
              description="Luego aquí conectaremos el selector real de productos y el registro definitivo de costos por compra."
            >
              <PedidoDetalleTable detalles={pedido.detalles} />
            </SectionCard>
          </div>

          <ResumenPedido detalles={pedido.detalles} />
        </div>
      ) : null}

      <SectionCard
        title="Listado de pedidos"
        description="Preparado para filtrar por fecha, estado, proveedor y origen."
      >
        <div className="mb-4">
          <InputField
            label="Buscar pedido"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Número, origen, proveedor o estado"
          />
        </div>

        <TablaPedidos pedidos={pedidosFiltrados} />
      </SectionCard>
    </div>
  );
}

export default PedidosPage;
