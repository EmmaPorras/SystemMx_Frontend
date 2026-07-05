import { useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import { ventasMock, ventaDetallesMock } from "../../data/mockData";
import FormularioVenta from "./FormularioVenta";
import TablaVentas from "./TablaVentas";
import VentaDetalleTable from "./VentaDetalleTable";
import type { Venta } from "./ventas.types";

const ventaInicial: Venta = {
  id: 0,
  consecutivo: "",
  fecha: new Date().toISOString().slice(0, 10),
  cliente: "Venta mostrador",
  subtotal: 0,
  impuesto: 0,
  total: 0,
  estado: "BORRADOR",
  detalles: [],
};

function VentasPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [venta, setVenta] = useState<Venta>({
    ...ventaInicial,
    detalles: ventaDetallesMock,
  });

  const ventasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return ventasMock;

    return ventasMock.filter((item) =>
      [item.consecutivo, item.cliente, item.estado].join(" ").toLowerCase().includes(term),
    );
  }, [busqueda]);

  function actualizarVenta(field: keyof Venta, value: string) {
    setVenta((prev) => ({ ...prev, [field]: value }));
  }

  function guardarVentaLocal() {
    console.log("Venta lista para backend:", venta);
    setMostrarFormulario(false);
    setVenta({ ...ventaInicial, detalles: ventaDetallesMock });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="La pantalla ya queda preparada para el registro de ventas físicas, con IVA y futura salida automática de inventario según FIFO."
        action={
          <PrimaryButton onClick={() => setMostrarFormulario((prev) => !prev)}>
            + Nueva venta
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Ventas registradas"
          value={String(ventasMock.length)}
          hint="Datos temporales"
        />
        <StatCard
          label="Ventas completadas"
          value={String(ventasMock.filter((item) => item.estado === "COMPLETADA").length)}
          hint="Base para reportes mensuales"
        />
        <StatCard
          label="Borradores"
          value={String(ventasMock.filter((item) => item.estado === "BORRADOR").length)}
          hint="Ventas aún no cerradas"
        />
        <StatCard
          label="Lógica futura"
          value="FIFO"
          hint="Backend resolverá qué lote se rebaja"
        />
      </div>

      {mostrarFormulario ? (
        <div className="space-y-6">
          <FormularioVenta venta={venta} onChange={actualizarVenta} onSubmit={guardarVentaLocal} />

          <SectionCard
            title="Detalle de la venta"
            description="Luego aquí conectaremos búsqueda de productos y cálculo dinámico de totales."
          >
            <VentaDetalleTable detalles={venta.detalles} />
          </SectionCard>
        </div>
      ) : null}

      <SectionCard
        title="Listado de ventas"
        description="Más adelante lo puedes filtrar por fecha, estado y producto vendido."
      >
        <div className="mb-4">
          <InputField
            label="Buscar venta"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Consecutivo, cliente o estado"
          />
        </div>

        <TablaVentas ventas={ventasFiltradas} />
      </SectionCard>
    </div>
  );
}

export default VentasPage;
