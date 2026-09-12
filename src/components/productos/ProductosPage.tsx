import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  PackageSearch,
} from "lucide-react";

import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import StatCard from "../common/StatCard";

import {
  obtenerProductosApi,
} from "../../services/productosApi";

import ProductoDetalleModal from "./ProductoDetalleModal";
import TablaProductos from "./TablaProductos";

import type { Producto } from "./productos.types";

function ProductosPage() {
  const [productos, setProductos] =
    useState<Producto[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [productoDetalle, setProductoDetalle] =
    useState<Producto | null>(null);

  async function cargarProductos() {
    setLoading(true);
    setError(null);

    try {
      const data =
        await obtenerProductosApi();

      setProductos(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar los productos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const term =
      busqueda.trim().toLowerCase();

    if (!term) {
      return productos;
    }

    return productos.filter((producto) =>
      [
        producto.nombre,
        producto.sku ?? "",
        producto.marca ?? "",
        producto.variante ?? "",
        producto.categoria?.nombre ?? "",
        producto.activo
          ? "activo"
          : "inactivo",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [
    productos,
    busqueda,
  ]);

  const productosActivos =
    productos.filter(
      (producto) => producto.activo,
    ).length;

  const unidadesDisponibles =
    productos.reduce(
      (total, producto) =>
        total + producto.stockActual,
      0,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Consultá el catálogo de productos generado a partir de los pedidos."
        icon={PackageSearch}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Productos"
          value={String(productos.length)}
          hint="Total registrado en catálogo"
          icon={PackageSearch}
          variant="info"
        />

        <StatCard
          label="Activos"
          value={String(productosActivos)}
          hint="Productos activos"
          icon={PackageSearch}
          variant="success"
        />

        <StatCard
          label="Unidades disponibles"
          value={String(unidadesDisponibles)}
          hint="Stock agregado del catálogo"
          icon={Boxes}
          variant="neutral"
        />
      </div>

      <SectionCard
        title="Catálogo de productos"
        description="El catálogo es de solo lectura. Los productos se crean o reutilizan desde Pedidos."
      >
        <div className="mb-5">
          <InputField
            label="Buscar producto"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Nombre, SKU, marca, variante o categoría"
          />
        </div>

        {loading ? (
          <div className="grid min-h-[220px] place-items-center rounded-2xl border border-zinc-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />

              <p className="mt-4 text-sm font-semibold text-zinc-600">
                Cargando productos...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <AlertMessage
              variant="error"
              title="No fue posible cargar los productos"
              message={error}
            />

            <PrimaryButton
              onClick={() => {
                void cargarProductos();
              }}
            >
              Reintentar
            </PrimaryButton>
          </div>
        ) : (
          <TablaProductos
            productos={productosFiltrados}
            onView={setProductoDetalle}
          />
        )}
      </SectionCard>

      <ProductoDetalleModal
        isOpen={productoDetalle !== null}
        producto={productoDetalle}
        onClose={() =>
          setProductoDetalle(null)
        }
      />
    </div>
  );
}

export default ProductosPage;