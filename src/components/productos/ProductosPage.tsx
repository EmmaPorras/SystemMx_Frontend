import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Boxes,
  PackageSearch,
} from "lucide-react";
import { RiResetLeftFill } from "react-icons/ri";

import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";

import {
  obtenerProductosApi,
} from "../../services/productosApi";

import ProductoDetalleModal from "./ProductoDetalleModal";
import TablaProductos from "./TablaProductos";

import type { Producto } from "./productos.types";

function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productoDetalle, setProductoDetalle] =
    useState<Producto | null>(null);

  async function cargarProductos() {
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerProductosApi();
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

  const categoriasOptions = useMemo(() => {
    const categorias = new Map<
      number,
      string
    >();

    productos.forEach((producto) => {
      if (
        producto.categoria?.idCategoria &&
        producto.categoria.nombre
      ) {
        categorias.set(
          producto.categoria.idCategoria,
          producto.categoria.nombre,
        );
      }
    });

    return Array.from(categorias.entries())
      .map(([id, nombre]) => ({
        value: String(id),
        label: nombre,
      }))
      .sort((a, b) =>
        a.label.localeCompare(
          b.label,
          "es",
          { sensitivity: "base" },
        ),
      );
  }, [productos]);

  const marcasOptions = useMemo(() => {
    const marcas = new Set<string>();

    productos.forEach((producto) => {
      const marca = producto.marca?.trim();

      if (marca) {
        marcas.add(marca);
      }
    });

    return Array.from(marcas)
      .sort((a, b) =>
        a.localeCompare(
          b,
          "es",
          { sensitivity: "base" },
        ),
      )
      .map((marca) => ({
        value: marca,
        label: marca,
      }));
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const term = busqueda
      .trim()
      .toLowerCase();

    return productos.filter((producto) => {
      const coincideNombre = term
        ? producto.nombre
            .toLowerCase()
            .includes(term)
        : true;

      const coincideCategoria = filtroCategoria
        ? String(
            producto.categoria?.idCategoria ?? "",
          ) === filtroCategoria
        : true;

      const coincideMarca = filtroMarca
        ? (
            producto.marca?.trim() ?? ""
          ) === filtroMarca
        : true;

      return (
        coincideNombre &&
        coincideCategoria &&
        coincideMarca
      );
    });
  }, [
    productos,
    busqueda,
    filtroCategoria,
    filtroMarca,
  ]);

  const hayFiltros =
    Boolean(busqueda.trim()) ||
    Boolean(filtroCategoria) ||
    Boolean(filtroMarca);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroCategoria("");
    setFiltroMarca("");
  }

  const productosActivos = productos.filter(
    (producto) => producto.activo,
  ).length;

  const unidadesDisponibles = productos.reduce(
    (total, producto) =>
      total + Number(producto.stockActual ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Consultá el catálogo de productos generado a partir de los pedidos."
        icon={PackageSearch}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        description="Buscá por nombre y filtrá el catálogo por categoría o marca."
      >
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="Nombre del producto"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Careta negra, LED, pads..."
            maxLength={150}
          />

          <SelectField
            label="Categoría"
            value={filtroCategoria}
            onChange={setFiltroCategoria}
            placeholder="Todas las categorías"
            options={categoriasOptions}
          />

          <SelectField
            label="Marca"
            value={filtroMarca}
            onChange={setFiltroMarca}
            placeholder="Todas las marcas"
            options={marcasOptions}
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={!hayFiltros}
              aria-label="Restablecer filtros"
              title="Restablecer filtros"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              <RiResetLeftFill
                className="h-5 w-5"
                aria-hidden="true"
              />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Cargando productos..." />
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