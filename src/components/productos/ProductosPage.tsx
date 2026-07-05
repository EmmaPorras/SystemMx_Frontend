import { useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";
import InputField from "../common/InputField";
import { productosMock, proveedoresMock, tarifasMock } from "../../data/mockData";
import BotonAgregarProducto from "./BotonAgregarProducto";
import FormularioProducto from "./FormularioProducto";
import TablaProductos from "./TablaProductos";
import type { Producto } from "./productos.types";

const productoInicial: Producto = {
  id: 0,
  nombre: "",
  categoria: "",
  precioReferencia: 0,
  stockTotal: 0,
  proveedorId: 0,
  proveedorNombre: "",
  tarifaIvaId: 0,
  tarifaIvaDescripcion: "",
  estado: "ACTIVO",
};

function ProductosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [producto, setProducto] = useState<Producto>(productoInicial);

  const productosFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return productosMock;

    return productosMock.filter((item) =>
      [
        item.nombre,
        item.categoria,
        item.proveedorNombre,
        item.tarifaIvaDescripcion,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [busqueda]);

  function actualizarProducto(field: keyof Producto, value: string) {
    setProducto((prev) => ({
      ...prev,
      [field]:
        field === "precioReferencia" ||
        field === "stockTotal" ||
        field === "proveedorId" ||
        field === "tarifaIvaId"
          ? Number(value)
          : value,
    }));
  }

  function guardarProductoLocal() {
    console.log("Producto listo para backend:", producto);
    setMostrarFormulario(false);
    setProducto(productoInicial);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo general del negocio con proveedor, tarifa IVA, precio y stock total visible."
        action={<BotonAgregarProducto onClick={() => setMostrarFormulario((prev) => !prev)} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Productos registrados"
          value={String(productosMock.length)}
          hint="Dato temporal desde mocks"
        />
        <StatCard
          label="Categorías usadas"
          value={String(new Set(productosMock.map((item) => item.categoria)).size)}
          hint="Te ayuda a ver variedad del catálogo"
        />
        <StatCard
          label="Proveedores activos"
          value={String(proveedoresMock.filter((item) => item.estado === "ACTIVO").length)}
          hint="Catálogo relacionado"
        />
        <StatCard
          label="Tarifas disponibles"
          value={String(tarifasMock.length)}
          hint="Base para cálculos de IVA"
        />
      </div>

      {mostrarFormulario ? (
        <FormularioProducto
          producto={producto}
          proveedores={proveedoresMock}
          tarifas={tarifasMock}
          onChange={actualizarProducto}
          onSubmit={guardarProductoLocal}
        />
      ) : null}

      <SectionCard
        title="Listado de productos"
        description="Aquí luego puedes conectar filtros por estado, categoría, proveedor y stock."
      >
        <div className="mb-4">
          <InputField
            label="Buscar producto"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Nombre, categoría, proveedor o tarifa"
          />
        </div>

        <TablaProductos productos={productosFiltrados} />
      </SectionCard>
    </div>
  );
}

export default ProductosPage;
