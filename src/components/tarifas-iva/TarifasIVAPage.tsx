import { useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import { tarifasMock } from "../../data/mockData";
import BotonAgregarTarifa from "./BotonAgregarTarifa";
import FormularioTarifa from "./FormularioTarifa";
import TablaTarifas from "./TablaTarifas";
import type { TarifaIVA } from "./tarifas-iva.types";

const tarifaInicial: TarifaIVA = {
  id: 0,
  codigo: "",
  porcentaje: 0,
  descripcion: "",
  estado: "ACTIVA",
};

function TarifasIVAPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tarifa, setTarifa] = useState<TarifaIVA>(tarifaInicial);

  const tarifasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return tarifasMock;

    return tarifasMock.filter((item) =>
      [item.codigo, item.descripcion, String(item.porcentaje)]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda]);

  function actualizarTarifa(field: keyof TarifaIVA, value: string) {
    setTarifa((prev) => ({
      ...prev,
      [field]: field === "porcentaje" ? Number(value) : value,
    }));
  }

  function guardarTarifaLocal() {
    console.log("Tarifa lista para backend:", tarifa);
    setMostrarFormulario(false);
    setTarifa(tarifaInicial);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarifas IVA"
        description="Catálogo de impuestos listo para ser consumido por productos, pedidos y ventas."
        action={<BotonAgregarTarifa onClick={() => setMostrarFormulario((prev) => !prev)} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Tarifas registradas"
          value={String(tarifasMock.length)}
          hint="Ideal para centralizar el IVA y evitar duplicados"
        />
        <StatCard
          label="Tarifa principal"
          value="13%"
          hint="Puedes reemplazar este dato por una consulta real"
        />
        <StatCard
          label="Dependencia"
          value="Productos"
          hint="Las tarifas alimentan catálogos y cálculos"
        />
      </div>

      {mostrarFormulario ? (
        <FormularioTarifa
          tarifa={tarifa}
          onChange={actualizarTarifa}
          onSubmit={guardarTarifaLocal}
        />
      ) : null}

      <SectionCard
        title="Listado de tarifas"
        description="Más adelante aquí también puedes validar si una tarifa está en uso antes de eliminarla."
      >
        <div className="mb-4">
          <InputField
            label="Buscar tarifa"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Código, porcentaje o descripción"
          />
        </div>

        <TablaTarifas tarifas={tarifasFiltradas} />
      </SectionCard>
    </div>
  );
}

export default TarifasIVAPage;
