import { useEffect, useMemo, useState } from "react";
import AlertMessage from "../common/AlertMessage";
import InputField from "../common/InputField";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import SelectField from "../common/SelectField";
import StatCard from "../common/StatCard";
import { formatCurrency } from "../common/formatters";
import { obtenerPedidos } from "../../services/pedidosApi";
import ProductoDetalleModal from "./ProductoDetalleModal";
import TablaProductos from "./TablaProductos";
import type { PedidoCompra, PedidoDetalle } from "../pedidos/pedidos.types";
import type { Producto, ProductoLoteDetalle } from "./productos.types";

function normalizarTexto(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getProductoKey(detalle: PedidoDetalle) {
  if (detalle.productoId) {
    return `producto-${detalle.productoId}`;
  }

  return `nombre-${normalizarTexto(detalle.productoNombre)}`;
}

function loteCuentaComoDisponible(lote: ProductoLoteDetalle) {
  if (lote.cantidadDisponible <= 0) return false;

  return (
    lote.estadoLote === "EN_STOCK" || lote.estadoLote === "VENDIDO_PARCIAL"
  );
}

function loteCuentaComoEnProceso(lote: ProductoLoteDetalle) {
  if (lote.cantidadDisponible <= 0) return false;

  return lote.estadoLote === "EN_PROCESO";
}

function calcularEstadoProducto(
  stockDisponible: number,
  stockEnProceso: number,
): Producto["estado"] {
  if (stockDisponible > 0) return "DISPONIBLE";
  if (stockEnProceso > 0) return "EN_PROCESO";
  return "AGOTADO";
}

function construirProductosDesdePedidos(pedidos: PedidoCompra[]): Producto[] {
  const productosMap = new Map<string, Producto>();

  pedidos.forEach((pedido) => {
    const detalles = pedido.detalles ?? [];

    detalles.forEach((detalle) => {
      const productoKey = getProductoKey(detalle);
      const cantidadInicial = getNumber(detalle.cantidad);
      const cantidadDisponible = getNumber(
        detalle.cantidadDisponible,
        cantidadInicial,
      );

      const lote: ProductoLoteDetalle = {
        idTemporal: detalle.idTemporal,
        pedidoId: pedido.id,
        numeroPedido: pedido.numeroPedido,
        fecha: pedido.fecha,
        origen: pedido.origen,
        proveedorId: pedido.proveedorId,
        proveedorNombre:
          pedido.proveedorNombre || `Proveedor ${pedido.proveedorId}`,
        monedaCompra: pedido.monedaCompra,
        tipoCambio: pedido.tipoCambio,
        loteCodigo: detalle.loteCodigo,
        cantidad: cantidadInicial,
        cantidadDisponible,
        costoUnitarioOrigen: getNumber(detalle.costoUnitarioOrigen),
        costoUnitarioReal: getNumber(detalle.costoUnitarioReal),
        precioVentaRecomendado: getNumber(detalle.precioVentaRecomendado),
        estadoLote: detalle.estadoLote,
      };

      const stockDisponibleLote = loteCuentaComoDisponible(lote)
        ? lote.cantidadDisponible
        : 0;

      const stockEnProcesoLote = loteCuentaComoEnProceso(lote)
        ? lote.cantidadDisponible
        : 0;

      const productoExistente = productosMap.get(productoKey);

      if (!productoExistente) {
        productosMap.set(productoKey, {
          productoKey,
          id: detalle.productoId ?? 0,
          displayId: 0,
          nombre: detalle.productoNombre,

          // Legacy: no se muestran en la tabla nueva.
          categoria: "",
          precioReferencia: lote.precioVentaRecomendado,
          stockTotal: cantidadInicial,
          proveedorId: pedido.proveedorId,
          proveedorNombre:
            pedido.proveedorNombre || `Proveedor ${pedido.proveedorId}`,
          tarifaIvaId: 0,
          tarifaIvaDescripcion: "",

          precioVenta: lote.precioVentaRecomendado,
          stockActual: stockDisponibleLote,
          stockEnProceso: stockEnProcesoLote,
          proveedores: [
            pedido.proveedorNombre || `Proveedor ${pedido.proveedorId}`,
          ],
          estado: calcularEstadoProducto(
            stockDisponibleLote,
            stockEnProcesoLote,
          ),
          lotes: [lote],
          ultimaCompra: pedido.fecha,
          costoMinimoReal: lote.costoUnitarioReal,
          costoMaximoReal: lote.costoUnitarioReal,
        });

        return;
      }

      productoExistente.stockTotal += cantidadInicial;

      productoExistente.stockActual =
        getNumber(productoExistente.stockActual) + stockDisponibleLote;

      productoExistente.stockEnProceso =
        getNumber(productoExistente.stockEnProceso) + stockEnProcesoLote;

      productoExistente.lotes = [...(productoExistente.lotes ?? []), lote];

      const proveedorNombre =
        pedido.proveedorNombre || `Proveedor ${pedido.proveedorId}`;

      if (!(productoExistente.proveedores ?? []).includes(proveedorNombre)) {
        productoExistente.proveedores = [
          ...(productoExistente.proveedores ?? []),
          proveedorNombre,
        ];
      }

      productoExistente.proveedorNombre = (
        productoExistente.proveedores ?? []
      ).join(", ");

      if (
        !productoExistente.ultimaCompra ||
        pedido.fecha > productoExistente.ultimaCompra
      ) {
        productoExistente.ultimaCompra = pedido.fecha;
        productoExistente.precioVenta = lote.precioVentaRecomendado;
        productoExistente.precioReferencia = lote.precioVentaRecomendado;
      }

      productoExistente.estado = calcularEstadoProducto(
        getNumber(productoExistente.stockActual),
        getNumber(productoExistente.stockEnProceso),
      );
    });
  });

  return Array.from(productosMap.values())
    .map((producto): Producto => {
      const lotesOrdenados = [...(producto.lotes ?? [])].sort((a, b) =>
        b.fecha.localeCompare(a.fecha),
      );

      const costosReales = lotesOrdenados
        .map((lote) => lote.costoUnitarioReal)
        .filter((value) => Number.isFinite(value));

      const stockDisponible = lotesOrdenados
        .filter(loteCuentaComoDisponible)
        .reduce((acc, lote) => acc + lote.cantidadDisponible, 0);

      const stockEnProceso = lotesOrdenados
        .filter(loteCuentaComoEnProceso)
        .reduce((acc, lote) => acc + lote.cantidadDisponible, 0);

      return {
        ...producto,
        proveedorNombre: (producto.proveedores ?? []).join(", "),
        stockActual: stockDisponible,
        stockEnProceso,
        estado: calcularEstadoProducto(stockDisponible, stockEnProceso),
        costoMinimoReal:
          costosReales.length > 0 ? Math.min(...costosReales) : 0,
        costoMaximoReal:
          costosReales.length > 0 ? Math.max(...costosReales) : 0,
        lotes: lotesOrdenados,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((producto, index) => ({
      ...producto,
      displayId: index + 1,
    }));
}

function ProductosPage() {
  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [busquedaNombre, setBusquedaNombre] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarPedidos() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const pedidosApi = await obtenerPedidos();

        if (isMounted) {
          setPedidos(pedidosApi);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los productos desde pedidos.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    cargarPedidos();

    return () => {
      isMounted = false;
    };
  }, []);

  const productos = useMemo(
    () => construirProductosDesdePedidos(pedidos),
    [pedidos],
  );

  const proveedoresOptions = useMemo(() => {
    const proveedores = new Set<string>();

    productos.forEach((producto) => {
      (producto.proveedores ?? []).forEach((proveedor) => {
        if (proveedor.trim()) {
          proveedores.add(proveedor);
        }
      });
    });

    return Array.from(proveedores)
      .sort((a, b) => a.localeCompare(b))
      .map((proveedor) => ({
        value: proveedor,
        label: proveedor,
      }));
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const term = busquedaNombre.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideNombre = term
        ? producto.nombre.toLowerCase().includes(term)
        : true;

      const coincideProveedor = proveedorSeleccionado
        ? (producto.proveedores ?? []).includes(proveedorSeleccionado)
        : true;

      return coincideNombre && coincideProveedor;
    });
  }, [busquedaNombre, proveedorSeleccionado, productos]);

  const productosDisponibles = productos.filter(
    (producto) => producto.estado === "DISPONIBLE",
  ).length;

  const productosEnProceso = productos.filter(
    (producto) => producto.estado === "EN_PROCESO",
  ).length;

  const productosAgotados = productos.filter(
    (producto) => producto.estado === "AGOTADO",
  ).length;

  const stockDisponibleActual = productos.reduce(
    (acc, producto) => acc + getNumber(producto.stockActual),
    0,
  );

  const valorInventarioActual = productos.reduce((acc, producto) => {
    const stockDisponible = getNumber(producto.stockActual);
    const precioVenta = getNumber(producto.precioVenta ?? producto.precioReferencia);

    return acc + stockDisponible * precioVenta;
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Vista de productos generados desde pedidos. Aquí no se crean productos manualmente."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Productos registrados"
          value={String(productos.length)}
          hint="Agrupados desde pedidos/lotes"
        />

        <StatCard
          label="Disponibles"
          value={String(productosDisponibles)}
          hint="Con stock listo para vender"
        />

        <StatCard
          label="En proceso"
          value={String(productosEnProceso)}
          hint="Comprados, pendientes de llegada"
        />

        <StatCard
          label="Agotados"
          value={String(productosAgotados)}
          hint="Sin stock disponible"
        />

        <StatCard
          label="Valor inventario actual"
          value={formatCurrency(valorInventarioActual)}
          hint="Stock disponible x precio venta"
        />
      </div>

      {errorMessage ? (
        <AlertMessage
          variant="error"
          title="No se pudieron cargar los productos"
          message={errorMessage}
        />
      ) : null}

      <SectionCard
        title="Listado de productos"
        description="Los productos se alimentan desde los pedidos registrados. Hacé click sobre el nombre para ver el detalle."
      >
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Filtrar por nombre"
            value={busquedaNombre}
            onChange={setBusquedaNombre}
            placeholder="Careta negra, barra led..."
          />

          <SelectField
            label="Filtrar por proveedor"
            value={proveedorSeleccionado}
            onChange={setProveedorSeleccionado}
            placeholder="Todos los proveedores"
            options={proveedoresOptions}
          />
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Cargando productos desde pedidos...
            </p>
          </div>
        ) : (
          <TablaProductos
            productos={productosFiltrados}
            onSelect={setProductoSeleccionado}
          />
        )}
      </SectionCard>

      <ProductoDetalleModal
        producto={productoSeleccionado}
        isOpen={Boolean(productoSeleccionado)}
        onClose={() => setProductoSeleccionado(null)}
      />
    </div>
  );
}

export default ProductosPage;