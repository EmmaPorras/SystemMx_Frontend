import { useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import { lotesMock } from "../../data/mockData";
import TablaLotes from "./TablaLotes";

function LotesPage() {
  const [busqueda, setBusqueda] = useState("");

  const lotesFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return lotesMock;

    return lotesMock.filter((item) =>
      [item.pedidoNumero, item.productoNombre, item.estado]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lotes"
        description="Pantalla de trazabilidad por compra. Aquí se ve de qué pedido salió cada bloque de inventario y cuánto queda disponible."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Lotes registrados"
          value={String(lotesMock.length)}
          hint="Cada lote nace desde un pedido"
        />
        <StatCard
          label="Lotes activos"
          value={String(lotesMock.filter((item) => item.estado === "ACTIVO").length)}
          hint="Disponibles para ventas"
        />
        <StatCard
          label="Lotes pendientes"
          value={String(lotesMock.filter((item) => item.estado === "PENDIENTE").length)}
          hint="Aún no recibidos o no liquidados"
        />
        <StatCard
          label="Preparado para FIFO"
          value="Sí"
          hint="Backend decidirá cuál lote se descuenta primero"
        />
      </div>

      <SectionCard
        title="Listado de lotes"
        description="Cuando llegue el backend, este módulo puede tener filtros por producto, pedido y fecha de ingreso."
      >
        <div className="mb-4">
          <InputField
            label="Buscar lote"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Pedido, producto o estado"
          />
        </div>

        <TablaLotes lotes={lotesFiltrados} />
      </SectionCard>
    </div>
  );
}

export default LotesPage;
