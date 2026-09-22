import type {
  ElementType,
} from "react";

import {
  ArrowUpRight,
  BarChart3,
  PackagePlus,
  ReceiptText,
  ShoppingCart,
  Trophy,
} from "lucide-react";

import {
  Link,
} from "react-router";

import LoadingState from "../common/LoadingState";
import { formatCurrency } from "../common/formatters";

import type {
  VentasPorProductoItem,
} from "./dashboard.types";

type QuickActionProps = {
  title: string;
  description: string;
  to: string;
  icon: ElementType;
};

function QuickAction({
  title,
  description,
  to,
  icon: Icon,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-zinc-300
        hover:shadow-lg
        hover:shadow-black/5
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-zinc-950
      "
    >
      <div
        className="
          grid
          h-11
          w-11
          shrink-0
          place-items-center
          rounded-xl
          bg-zinc-100
          text-zinc-700
          transition
          duration-200
          group-hover:bg-zinc-950
          group-hover:text-white
        "
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold text-zinc-950">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={18}
        className="
          shrink-0
          text-zinc-300
          transition
          duration-200
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-zinc-950
        "
      />
    </Link>
  );
}

type HomeCommercialOverviewProps = {
  productos: VentasPorProductoItem[];
  loading: boolean;
  error: string | null;

  ventasPath: string;
  pedidosPath: string;
  productosPath: string;
  reportesPath: string;
};

function HomeCommercialOverview({
  productos,
  loading,
  error,
  ventasPath,
  pedidosPath,
  productosPath,
  reportesPath,
}: HomeCommercialOverviewProps) {
  const topProductos =
    productos.slice(0, 5);

  const mayorVenta =
    Math.max(
      ...topProductos.map(
        (producto) =>
          producto.ventas,
      ),
      1,
    );

  return (
    <div className="space-y-8">
      {/* ====================================== */}
      {/* ACCIONES RÁPIDAS */}
      {/* ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
              Acciones rápidas
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Accesos directos a las operaciones más utilizadas.
            </p>
          </div>

          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            title="Ventas"
            description="Registrar y consultar ventas"
            to={ventasPath}
            icon={ShoppingCart}
          />

          <QuickAction
            title="Pedidos"
            description="Crear y administrar pedidos"
            to={pedidosPath}
            icon={ReceiptText}
          />

          <QuickAction
            title="Productos"
            description="Administrar el catálogo"
            to={productosPath}
            icon={PackagePlus}
          />

          <QuickAction
            title="Reportes"
            description="Consultar análisis del sistema"
            to={reportesPath}
            icon={BarChart3}
          />
        </div>
      </section>

      {/* ====================================== */}
      {/* TOP PRODUCTOS */}
      {/* ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
              Productos destacados
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Productos con mayor importe vendido en el período seleccionado.
            </p>
          </div>

          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy size={19} />
              </div>

              <div>
                <h3 className="font-bold text-zinc-950">
                  Top 5 productos vendidos
                </h3>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Ordenados por monto total vendido
                </p>
              </div>
            </div>

            <Link
              to={reportesPath}
              className="
                hidden
                items-center
                gap-1
                text-xs
                font-bold
                text-zinc-500
                transition
                hover:text-zinc-950
                sm:flex
              "
            >
              Ver reportes

              <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="p-10">
              <LoadingState message="Cargando productos más vendidos..." />
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="font-bold text-zinc-950">
                No fue posible cargar los productos
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {error}
              </p>
            </div>
          ) : topProductos.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingCart
                size={30}
                className="mx-auto text-zinc-300"
              />

              <p className="mt-3 font-bold text-zinc-950">
                No existen ventas en este período
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Cambiá el período de la gráfica para consultar otros datos.
              </p>
            </div>
          ) : (
            <div>
              {topProductos.map(
                (
                  producto,
                  index,
                ) => {
                  const porcentaje =
                    mayorVenta > 0
                      ? (
                          producto.ventas /
                          mayorVenta
                        ) *
                        100
                      : 0;

                  return (
                    <div
                      key={
                        producto.idProducto
                      }
                      className="
                        grid
                        gap-4
                        border-b
                        border-zinc-100
                        p-4
                        last:border-b-0
                        sm:grid-cols-[44px_minmax(0,1fr)_120px_180px]
                        sm:items-center
                        sm:px-5
                      "
                    >
                      {/* POSICIÓN */}

                      <div
                        className={`
                          grid
                          h-9
                          w-9
                          place-items-center
                          rounded-xl
                          text-sm
                          font-black

                          ${
                            index === 0
                              ? "bg-amber-50 text-amber-600"
                              : index === 1
                                ? "bg-zinc-100 text-zinc-600"
                                : index === 2
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-zinc-50 text-zinc-400"
                          }
                        `}
                      >
                        {index + 1}
                      </div>

                      {/* PRODUCTO */}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-950">
                          {producto.producto}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {producto.categoria}
                        </p>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${porcentaje}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* UNIDADES */}

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:hidden">
                          Unidades
                        </p>

                        <p className="text-sm font-bold text-zinc-700">
                          {producto.unidadesVendidas}{" "}
                          {producto.unidadesVendidas ===
                          1
                            ? "unidad"
                            : "unidades"}
                        </p>
                      </div>

                      {/* MONTO */}

                      <div className="sm:text-right">
                        <p className="text-sm font-black text-zinc-950">
                          {formatCurrency(
                            producto.ventas,
                          )}
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                          +{" "}
                          {formatCurrency(
                            producto.gananciaBruta,
                          )}{" "}
                          ganancia
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomeCommercialOverview;