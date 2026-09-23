import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  CircleCheckBig,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import { TbMotorbikeFilled } from "react-icons/tb";

import AlertMessage from "../common/AlertMessage";
import LoadingState from "../common/LoadingState";
import PageHeader from "../common/PageHeader";
import PrimaryButton from "../common/PrimaryButton";
import StatCard from "../common/StatCard";

import ModuleCard from "./ModuleCard";
import HomeCommercialOverview from "./HomeCommercialOverview";

import {
  navigationItems,
} from "../common/navigation";

import {
  formatCurrency,
} from "../common/formatters";

import {
  obtenerEvolucionVentas,
  obtenerResumenDashboard,
  obtenerVentasPorProducto,
} from "../../services/dashboardApi";

import type {
  EvolucionVentasItem,
  ResumenDashboard,
  VentasPorProductoItem,
} from "./dashboard.types";

type PeriodoGrafica =
  | "7d"
  | "30d"
  | "year"
  | "all";

type PuntoGrafica = {
  clave: string;
  etiqueta: string;
  etiquetaCorta: string;
  ventas: number;
  costo: number;
  gananciaBruta: number;
  cantidadVentas: number;
};

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function fechaISO(
  fecha: Date,
) {
  const year =
    fecha.getFullYear();

  const month =
    String(
      fecha.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      fecha.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function fechaDesdePeriodo(
  periodo: PeriodoGrafica,
) {
  const hoy =
    new Date();

  if (
    periodo === "year"
  ) {
    return new Date(
      hoy.getFullYear(),
      0,
      1,
    );
  }

  if (
    periodo === "all"
  ) {
    return null;
  }

  const dias =
    periodo === "7d"
      ? 6
      : 29;

  const fecha =
    new Date(hoy);

  fecha.setDate(
    fecha.getDate() -
      dias,
  );

  return fecha;
}

function agregarDias(
  fecha: Date,
  cantidad: number,
) {
  const resultado =
    new Date(fecha);

  resultado.setDate(
    resultado.getDate() +
      cantidad,
  );

  return resultado;
}

function generarPuntosTodo(
  datos: EvolucionVentasItem[],
): PuntoGrafica[] {
  if (
    datos.length === 0
  ) {
    return [];
  }

  const mapa =
    new Map<
      string,
      PuntoGrafica
    >();

  for (
    const item of datos
  ) {
    const clave =
      item.fecha.slice(
        0,
        7,
      );

    const partes =
      clave.split("-");

    const year =
      Number(
        partes[0],
      );

    const mes =
      Number(
        partes[1],
      );

    const actual =
      mapa.get(clave);

    if (actual) {
      actual.ventas +=
        item.ventas;

      actual.costo +=
        item.costo;

      actual.gananciaBruta +=
        item.gananciaBruta;

      actual.cantidadVentas +=
        item.cantidadVentas;

      continue;
    }

    mapa.set(
      clave,
      {
        clave,

        etiqueta:
          `${MESES_CORTOS[
            mes - 1
          ]} ${year}`,

        etiquetaCorta:
          `${MESES_CORTOS[
            mes - 1
          ]} ${String(
            year,
          ).slice(-2)}`,

        ventas:
          item.ventas,

        costo:
          item.costo,

        gananciaBruta:
          item.gananciaBruta,

        cantidadVentas:
          item.cantidadVentas,
      },
    );
  }

  const claves =
    Array.from(
      mapa.keys(),
    ).sort();

  if (
    claves.length === 0
  ) {
    return [];
  }

  const primera =
    claves[0].split("-");

  const ultima =
    claves[
      claves.length - 1
    ].split("-");

  let year =
    Number(
      primera[0],
    );

  let mes =
    Number(
      primera[1],
    );

  const yearFinal =
    Number(
      ultima[0],
    );

  const mesFinal =
    Number(
      ultima[1],
    );

  const resultado: PuntoGrafica[] =
    [];

  while (
    year <
      yearFinal ||
    (
      year ===
        yearFinal &&
      mes <= mesFinal
    )
  ) {
    const clave =
      `${year}-${String(
        mes,
      ).padStart(
        2,
        "0",
      )}`;

    const existente =
      mapa.get(clave);

    if (existente) {
      resultado.push(
        existente,
      );
    } else {
      resultado.push({
        clave,

        etiqueta:
          `${MESES_CORTOS[
            mes - 1
          ]} ${year}`,

        etiquetaCorta:
          `${MESES_CORTOS[
            mes - 1
          ]} ${String(
            year,
          ).slice(-2)}`,

        ventas: 0,
        costo: 0,
        gananciaBruta: 0,
        cantidadVentas: 0,
      });
    }

    mes++;

    if (mes > 12) {
      mes = 1;
      year++;
    }
  }

  return resultado;
}

function generarPuntosGrafica(
  datos: EvolucionVentasItem[],
  periodo: PeriodoGrafica,
  fechaDesde: Date | null,
  fechaHasta: Date,
): PuntoGrafica[] {
  if (
    periodo === "all"
  ) {
    return generarPuntosTodo(
      datos,
    );
  }

  if (
    periodo === "year"
  ) {
    const cantidadMeses =
      fechaHasta.getMonth() +
      1;

    return Array.from(
      {
        length:
          cantidadMeses,
      },
      (
        _,
        indice,
      ) => {
        const clave =
          `${fechaHasta.getFullYear()}-${String(
            indice + 1,
          ).padStart(
            2,
            "0",
          )}`;

        const filasMes =
          datos.filter(
            (item) =>
              item.fecha.startsWith(
                clave,
              ),
          );

        return {
          clave,

          etiqueta:
            `${MESES_CORTOS[
              indice
            ]} ${fechaHasta.getFullYear()}`,

          etiquetaCorta:
            MESES_CORTOS[
              indice
            ],

          ventas:
            filasMes.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.ventas,
              0,
            ),

          costo:
            filasMes.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.costo,
              0,
            ),

          gananciaBruta:
            filasMes.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.gananciaBruta,
              0,
            ),

          cantidadVentas:
            filasMes.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.cantidadVentas,
              0,
            ),
        };
      },
    );
  }

  if (!fechaDesde) {
    return [];
  }

  const mapa =
    new Map(
      datos.map(
        (item) => [
          item.fecha,
          item,
        ],
      ),
    );

  const resultado: PuntoGrafica[] =
    [];

  let fecha =
    new Date(
      fechaDesde,
    );

  while (
    fecha <= fechaHasta
  ) {
    const clave =
      fechaISO(fecha);

    const item =
      mapa.get(clave);

    resultado.push({
      clave,

      etiqueta:
        fecha.toLocaleDateString(
          "es-CR",
          {
            day:
              "2-digit",
            month:
              "short",
            year:
              "numeric",
          },
        ),

      etiquetaCorta:
        `${String(
          fecha.getDate(),
        ).padStart(
          2,
          "0",
        )}/${String(
          fecha.getMonth() +
            1,
        ).padStart(
          2,
          "0",
        )}`,

      ventas:
        item?.ventas ??
        0,

      costo:
        item?.costo ??
        0,

      gananciaBruta:
        item?.gananciaBruta ??
        0,

      cantidadVentas:
        item?.cantidadVentas ??
        0,
    });

    fecha =
      agregarDias(
        fecha,
        1,
      );
  }

  return resultado;
}

function formatoCompacto(
  valor: number,
) {
  if (
    valor >=
    1_000_000
  ) {
    return `₡${(
      valor /
      1_000_000
    ).toFixed(1)}M`;
  }

  if (
    valor >= 1000
  ) {
    return `₡${(
      valor /
      1000
    ).toFixed(0)}k`;
  }

  return `₡${Math.round(
    valor,
  )}`;
}

function GraficaVentas({
  puntos,
}: {
  puntos: PuntoGrafica[];
}) {
  const [
    puntoActivo,
    setPuntoActivo,
  ] =
    useState<
      number | null
    >(null);

  const width = 1000;
  const height = 330;

  const paddingLeft = 78;
  const paddingRight = 30;
  const paddingTop = 32;
  const paddingBottom = 56;

  const anchoUtil =
    width -
    paddingLeft -
    paddingRight;

  const altoUtil =
    height -
    paddingTop -
    paddingBottom;

  const maximoReal =
    Math.max(
      ...puntos.map(
        (item) =>
          item.ventas,
      ),
      1,
    );

  const maximo =
    maximoReal *
    1.1;

  function obtenerX(
    indice: number,
  ) {
    if (
      puntos.length <=
      1
    ) {
      return (
        paddingLeft +
        anchoUtil / 2
      );
    }

    return (
      paddingLeft +
      (
        indice /
        (
          puntos.length -
          1
        )
      ) *
        anchoUtil
    );
  }

  function obtenerY(
    valor: number,
  ) {
    return (
      paddingTop +
      altoUtil -
      (
        valor /
        maximo
      ) *
        altoUtil
    );
  }

  const puntosLinea =
    puntos
      .map(
        (
          punto,
          indice,
        ) =>
          `${obtenerX(
            indice,
          )},${obtenerY(
            punto.ventas,
          )}`,
      )
      .join(" ");

  const pasoEtiquetas =
    Math.max(
      1,
      Math.ceil(
        puntos.length /
          8,
      ),
    );

  const ticks = [
    0,
    0.25,
    0.5,
    0.75,
    1,
  ];

  const fondoY =
    paddingTop +
    altoUtil;

  const areaPath =
    puntos.length > 0
      ? `
        M ${obtenerX(
          0,
        )} ${fondoY}

        L ${puntos
          .map(
            (
              punto,
              indice,
            ) =>
              `${obtenerX(
                indice,
              )} ${obtenerY(
                punto.ventas,
              )}`,
          )
          .join(
            " L ",
          )}

        L ${obtenerX(
          puntos.length -
            1,
        )} ${fondoY}

        Z
      `
      : "";

  const puntoTooltip =
    puntoActivo !==
    null
      ? puntos[
          puntoActivo
        ]
      : null;

  const xTooltip =
    puntoActivo !==
    null
      ? obtenerX(
          puntoActivo,
        )
      : 0;

  const yTooltip =
    puntoTooltip
      ? obtenerY(
          puntoTooltip.ventas,
        )
      : 0;

  const tooltipWidth =
    210;

  const tooltipHeight =
    96;

  const tooltipX =
    xTooltip >
    width -
      tooltipWidth -
      25
      ? xTooltip -
        tooltipWidth -
        14
      : xTooltip +
        14;

  const tooltipY =
    Math.max(
      8,
      yTooltip -
        tooltipHeight -
        12,
    );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[680px]"
        role="img"
        aria-label="Gráfica de evolución de ventas"
        onMouseLeave={() =>
          setPuntoActivo(
            null,
          )
        }
      >
        {ticks.map(
          (tick) => {
            const valor =
              maximo *
              tick;

            const y =
              obtenerY(
                valor,
              );

            return (
              <g
                key={
                  tick
                }
              >
                <line
                  x1={
                    paddingLeft
                  }
                  x2={
                    width -
                    paddingRight
                  }
                  y1={y}
                  y2={y}
                  className="stroke-zinc-200"
                  strokeWidth="1"
                />

                <text
                  x={
                    paddingLeft -
                    12
                  }
                  y={
                    y + 4
                  }
                  textAnchor="end"
                  className="fill-zinc-400 text-[11px]"
                >
                  {formatoCompacto(
                    valor,
                  )}
                </text>
              </g>
            );
          },
        )}

        {puntos.length >
        0 ? (
          <>
            <path
              d={
                areaPath
              }
              className="fill-emerald-500/10"
            />

            <polyline
              points={
                puntosLinea
              }
              fill="none"
              className="stroke-emerald-500"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {puntos.map(
              (
                punto,
                indice,
              ) => {
                const x =
                  obtenerX(
                    indice,
                  );

                const y =
                  obtenerY(
                    punto.ventas,
                  );

                const activo =
                  puntoActivo ===
                  indice;

                return (
                  <g
                    key={
                      punto.clave
                    }
                  >
                    {(
                      indice %
                        pasoEtiquetas ===
                        0 ||
                      indice ===
                        puntos.length -
                          1
                    ) ? (
                      <text
                        x={x}
                        y={
                          height -
                          18
                        }
                        textAnchor="middle"
                        className="fill-zinc-400 text-[11px]"
                      >
                        {
                          punto.etiquetaCorta
                        }
                      </text>
                    ) : null}

                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setPuntoActivo(
                          indice,
                        )
                      }
                    />

                    {punto.ventas >
                    0 ? (
                      <circle
                        cx={x}
                        cy={y}
                        r={
                          activo
                            ? 7
                            : 5
                        }
                        className={
                          activo
                            ? "fill-emerald-500 stroke-white"
                            : "fill-white stroke-emerald-500"
                        }
                        strokeWidth="3"
                        pointerEvents="none"
                      />
                    ) : (
                      <circle
                        cx={x}
                        cy={y}
                        r={
                          activo
                            ? 4
                            : 2
                        }
                        className="fill-zinc-300"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              },
            )}

            {puntoTooltip ? (
              <g pointerEvents="none">
                <rect
                  x={
                    tooltipX
                  }
                  y={
                    tooltipY
                  }
                  width={
                    tooltipWidth
                  }
                  height={
                    tooltipHeight
                  }
                  rx="12"
                  className="fill-zinc-950"
                />

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y={
                    tooltipY +
                    23
                  }
                  className="fill-zinc-300 text-[11px] font-semibold"
                >
                  {
                    puntoTooltip.etiqueta
                  }
                </text>

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y={
                    tooltipY +
                    47
                  }
                  className="fill-white text-[15px] font-bold"
                >
                  {formatCurrency(
                    puntoTooltip.ventas,
                  )}
                </text>

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y={
                    tooltipY +
                    68
                  }
                  className="fill-zinc-300 text-[11px]"
                >
                  {`${puntoTooltip.cantidadVentas} ${
                    puntoTooltip.cantidadVentas ===
                    1
                      ? "venta"
                      : "ventas"
                  }`}
                </text>

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y={
                    tooltipY +
                    85
                  }
                  className="fill-emerald-300 text-[11px]"
                >
                  {`Ganancia: ${formatCurrency(
                    puntoTooltip.gananciaBruta,
                  )}`}
                </text>
              </g>
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
}

function obtenerRutaModulo(
  nombre: string,
  fallback: string,
) {
  const item =
    navigationItems.find(
      (navigationItem) =>
        navigationItem.label
          .toLowerCase()
          .trim() ===
        nombre
          .toLowerCase()
          .trim(),
    );

  return (
    item?.path ??
    fallback
  );
}

function HomePage() {
  const [
    resumen,
    setResumen,
  ] =
    useState<ResumenDashboard | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    periodoGrafica,
    setPeriodoGrafica,
  ] =
    useState<PeriodoGrafica>(
      "year",
    );

  const [
    evolucionVentas,
    setEvolucionVentas,
  ] =
    useState<
      EvolucionVentasItem[]
    >([]);

  const [
    loadingGrafica,
    setLoadingGrafica,
  ] =
    useState(true);

  const [
    errorGrafica,
    setErrorGrafica,
  ] =
    useState<
      string | null
    >(null);

  const [
    productosVendidos,
    setProductosVendidos,
  ] =
    useState<
      VentasPorProductoItem[]
    >([]);

  const [
    loadingProductos,
    setLoadingProductos,
  ] =
    useState(true);

  const [
    errorProductos,
    setErrorProductos,
  ] =
    useState<
      string | null
    >(null);

  async function cargarResumen() {
    setLoading(true);
    setError(null);

    try {
      const data =
        await obtenerResumenDashboard();

      setResumen(data);
    } catch (
      requestError
    ) {
      setResumen(null);

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "No fue posible cargar el resumen del sistema.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarResumen();
  }, []);

  const rangoGrafica =
    useMemo(
      () => {
        const hasta =
          new Date();

        const desde =
          fechaDesdePeriodo(
            periodoGrafica,
          );

        return {
          desde,
          hasta,

          fechaDesde:
            desde
              ? fechaISO(
                  desde,
                )
              : null,

          fechaHasta:
            fechaISO(
              hasta,
            ),
        };
      },
      [
        periodoGrafica,
      ],
    );

  const periodoConsulta =
    useMemo(
      () => {
        if (
          periodoGrafica ===
          "all"
        ) {
          return {};
        }

        return {
          fechaDesde:
            rangoGrafica.fechaDesde ??
            undefined,

          fechaHasta:
            rangoGrafica.fechaHasta,
        };
      },
      [
        periodoGrafica,
        rangoGrafica,
      ],
    );

  useEffect(() => {
    let activo =
      true;

    async function cargarGrafica() {
      setLoadingGrafica(
        true,
      );

      setErrorGrafica(
        null,
      );

      try {
        const datos =
          await obtenerEvolucionVentas(
            periodoConsulta,
          );

        if (activo) {
          setEvolucionVentas(
            datos,
          );
        }
      } catch (
        requestError
      ) {
        if (activo) {
          setEvolucionVentas(
            [],
          );

          setErrorGrafica(
            requestError instanceof
              Error
              ? requestError.message
              : "No fue posible cargar la evolución de ventas.",
          );
        }
      } finally {
        if (activo) {
          setLoadingGrafica(
            false,
          );
        }
      }
    }

    void cargarGrafica();

    return () => {
      activo = false;
    };
  }, [
    periodoConsulta,
  ]);

  useEffect(() => {
    let activo =
      true;

    async function cargarProductos() {
      setLoadingProductos(
        true,
      );

      setErrorProductos(
        null,
      );

      try {
        const datos =
          await obtenerVentasPorProducto(
            periodoConsulta,
          );

        if (activo) {
          setProductosVendidos(
            datos,
          );
        }
      } catch (
        requestError
      ) {
        if (activo) {
          setProductosVendidos(
            [],
          );

          setErrorProductos(
            requestError instanceof
              Error
              ? requestError.message
              : "No fue posible cargar los productos más vendidos.",
          );
        }
      } finally {
        if (activo) {
          setLoadingProductos(
            false,
          );
        }
      }
    }

    void cargarProductos();

    return () => {
      activo = false;
    };
  }, [
    periodoConsulta,
  ]);

  const puntosGrafica =
    useMemo(
      () =>
        generarPuntosGrafica(
          evolucionVentas,
          periodoGrafica,
          rangoGrafica.desde,
          rangoGrafica.hasta,
        ),
      [
        evolucionVentas,
        periodoGrafica,
        rangoGrafica,
      ],
    );

  const resumenGrafica =
    useMemo(
      () => {
        const ventas =
          puntosGrafica.reduce(
            (
              total,
              punto,
            ) =>
              total +
              punto.ventas,
            0,
          );

        const ganancia =
          puntosGrafica.reduce(
            (
              total,
              punto,
            ) =>
              total +
              punto.gananciaBruta,
            0,
          );

        const cantidad =
          puntosGrafica.reduce(
            (
              total,
              punto,
            ) =>
              total +
              punto.cantidadVentas,
            0,
          );

        return {
          ventas,
          ganancia,
          cantidad,

          margen:
            ventas > 0
              ? (
                  ganancia /
                  ventas
                ) *
                100
              : 0,
        };
      },
      [
        puntosGrafica,
      ],
    );

  const ventasPath =
    obtenerRutaModulo(
      "Ventas",
      "/ventas",
    );

  const pedidosPath =
    obtenerRutaModulo(
      "Pedidos",
      "/pedidos",
    );

  const productosPath =
    obtenerRutaModulo(
      "Productos",
      "/productos",
    );

  const reportesPath =
    obtenerRutaModulo(
      "Reportes",
      "/reportes",
    );

  return (
    <div className="space-y-8 pb-8">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <PageHeader
        title="Inicio"
        description="Vista general del sistema."
        icon={
          TbMotorbikeFilled
        }
      />

      {/* ====================================== */}
      {/* ERROR GENERAL */}
      {/* ====================================== */}

      {error ? (
        <div className="space-y-3">
          <AlertMessage
            variant="error"
            title="No fue posible cargar el Dashboard"
            message={
              error
            }
            onClose={() =>
              setError(null)
            }
          />

          <PrimaryButton
            onClick={() => {
              void cargarResumen();
            }}
          >
            Reintentar
          </PrimaryButton>
        </div>
      ) : null}

      {/* ====================================== */}
      {/* RESUMEN GENERAL */}
      {/* ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
              Resumen general
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Indicadores principales del negocio.
            </p>
          </div>

          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <LoadingState message="Cargando resumen del sistema..." />
          </div>
        ) : resumen ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Ventas registradas"
              value={String(
                resumen.ventas
                  .cantidad,
              )}
              hint={`Ventas acumuladas por ${formatCurrency(
                resumen.ventas
                  .total,
              )}`}
              icon={
                ShoppingCart
              }
              variant="success"
            />

            <StatCard
              label="Ganancia bruta"
              value={formatCurrency(
                resumen.ventas
                  .gananciaBruta,
              )}
              hint={`Margen bruto: ${resumen.ventas.margenBrutoPorcentaje.toFixed(
                2,
              )}%`}
              icon={
                CircleDollarSign
              }
              variant="success"
            />

            <StatCard
              label="Inventario disponible"
              value={String(
                resumen.inventario
                  .unidadesDisponibles,
              )}
              hint={`${resumen.inventario.lotesConStock} lotes con stock`}
              icon={
                Boxes
              }
              variant="info"
            />

            <StatCard
              label="Cuentas por cobrar"
              value={formatCurrency(
                resumen
                  .cuentasPorCobrar
                  .saldo,
              )}
              hint={`${resumen.cuentasPorCobrar.ventasConSaldo} ventas con saldo pendiente`}
              icon={
                WalletCards
              }
              variant={
                resumen
                  .cuentasPorCobrar
                  .saldo > 0
                  ? "warning"
                  : "neutral"
              }
            />

            <StatCard
              label="Pedidos registrados"
              value={String(
                resumen.pedidos
                  .total,
              )}
              hint={`${resumen.pedidos.pendientes} pedidos pendientes`}
              icon={
                ReceiptText
              }
              variant="info"
            />

            <StatCard
              label="Pedidos recibidos"
              value={String(
                resumen.pedidos
                  .recibidos,
              )}
              hint={`${resumen.pedidos.enTransito} pedidos en tránsito`}
              icon={
                PackageCheck
              }
              variant="success"
            />

            <StatCard
              label="Saldo pendiente ventas"
              value={formatCurrency(
                resumen.ventas
                  .saldoPendiente,
              )}
              hint={`Pagado: ${formatCurrency(
                resumen.ventas
                  .montoPagado,
              )}`}
              icon={
                WalletCards
              }
              variant={
                resumen.ventas
                  .saldoPendiente >
                0
                  ? "warning"
                  : "neutral"
              }
            />

            <StatCard
              label="Valor del inventario"
              value={formatCurrency(
                resumen.inventario
                  .valorCosto,
              )}
              hint="Valor actual del inventario disponible a costo"
              icon={
                Boxes
              }
              variant="neutral"
            />
          </div>
        ) : null}
      </section>

      {/* ====================================== */}
      {/* EVOLUCIÓN DE VENTAS */}
      {/* ====================================== */}

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
              Evolución de ventas
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Comportamiento de las ventas registradas.
            </p>
          </div>

          <div className="flex w-fit rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            {[
              {
                value:
                  "7d",
                label:
                  "7 días",
              },
              {
                value:
                  "30d",
                label:
                  "30 días",
              },
              {
                value:
                  "year",
                label:
                  "Este año",
              },
              {
                value:
                  "all",
                label:
                  "Todo",
              },
            ].map(
              (
                opcion,
              ) => (
                <button
                  key={
                    opcion.value
                  }
                  type="button"
                  onClick={() =>
                    setPeriodoGrafica(
                      opcion.value as PeriodoGrafica,
                    )
                  }
                  className={`
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-bold
                    transition

                    ${
                      periodoGrafica ===
                      opcion.value
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                    }
                  `}
                >
                  {
                    opcion.label
                  }
                </button>
              ),
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="grid border-b border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-b border-zinc-200 p-5 sm:border-r lg:border-b-0">
              <p className="text-xs font-medium text-zinc-400">
                Total vendido
              </p>

              <p className="mt-1 text-xl font-bold text-zinc-950">
                {formatCurrency(
                  resumenGrafica.ventas,
                )}
              </p>
            </div>

            <div className="border-b border-zinc-200 p-5 lg:border-r lg:border-b-0">
              <p className="text-xs font-medium text-zinc-400">
                Ganancia bruta
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-600">
                {formatCurrency(
                  resumenGrafica.ganancia,
                )}
              </p>
            </div>

            <div className="border-b border-zinc-200 p-5 sm:border-r sm:border-b-0">
              <p className="text-xs font-medium text-zinc-400">
                Ventas
              </p>

              <p className="mt-1 text-xl font-bold text-zinc-950">
                {
                  resumenGrafica.cantidad
                }
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-medium text-zinc-400">
                Margen
              </p>

              <p className="mt-1 text-xl font-bold text-zinc-950">
                {resumenGrafica.margen.toFixed(
                  2,
                )}
                %
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loadingGrafica ? (
              <div className="flex min-h-[310px] items-center justify-center">
                <LoadingState message="Cargando evolución de ventas..." />
              </div>
            ) : errorGrafica ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <TriangleAlert className="mb-3 h-8 w-8 text-amber-500" />

                <p className="font-bold text-zinc-950">
                  No fue posible cargar la gráfica
                </p>

                <p className="mt-1 max-w-md text-sm text-zinc-500">
                  {
                    errorGrafica
                  }
                </p>
              </div>
            ) : resumenGrafica.cantidad ===
              0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-3 h-8 w-8 text-zinc-300" />

                <p className="font-bold text-zinc-950">
                  No hay ventas en este período
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Seleccioná otro período para consultar el historial.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-end gap-2 text-xs text-zinc-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                  Ventas
                </div>

                <GraficaVentas
                  puntos={
                    puntosGrafica
                  }
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* ACCIONES + PRODUCTOS DESTACADOS */}
      {/* ====================================== */}

      <HomeCommercialOverview
        productos={
          productosVendidos
        }
        loading={
          loadingProductos
        }
        error={
          errorProductos
        }
        ventasPath={
          ventasPath
        }
        pedidosPath={
          pedidosPath
        }
        productosPath={
          productosPath
        }
        reportesPath={
          reportesPath
        }
      />

      {/* ====================================== */}
      {/* ESTADO OPERATIVO */}
      {/* ====================================== */}

      {!loading &&
      resumen ? (
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
                Estado operativo
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Situaciones que requieren atención.
              </p>
            </div>

            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-3">
            <div className="flex items-start gap-4 border-b border-zinc-200 p-5 lg:border-r lg:border-b-0">
              <div
                className={`
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-xl

                  ${
                    resumen
                      .cuentasPorCobrar
                      .saldo > 0
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }
                `}
              >
                {resumen
                  .cuentasPorCobrar
                  .saldo > 0 ? (
                  <TriangleAlert
                    size={21}
                  />
                ) : (
                  <CircleCheckBig
                    size={21}
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-950">
                  Cuentas por cobrar
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {resumen
                    .cuentasPorCobrar
                    .saldo > 0
                    ? `${resumen.cuentasPorCobrar.ventasConSaldo} ventas tienen saldo pendiente.`
                    : "No existen ventas con saldo pendiente."}
                </p>

                <p className="mt-2 text-sm font-bold text-zinc-900">
                  {formatCurrency(
                    resumen
                      .cuentasPorCobrar
                      .saldo,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-zinc-200 p-5 lg:border-r lg:border-b-0">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3
                  size={21}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-950">
                  Pedidos pendientes
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {resumen
                    .pedidos
                    .pendientes >
                  0
                    ? "Hay pedidos que todavía no han finalizado su proceso."
                    : "No hay pedidos pendientes actualmente."}
                </p>

                <p className="mt-2 text-sm font-bold text-zinc-900">
                  {
                    resumen
                      .pedidos
                      .pendientes
                  }{" "}
                  pendientes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Boxes
                  size={21}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-950">
                  Inventario actual
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Existencias disponibles actualmente en los lotes registrados.
                </p>

                <p className="mt-2 text-sm font-bold text-zinc-900">
                  {
                    resumen
                      .inventario
                      .unidadesDisponibles
                  }{" "}
                  unidades
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ====================================== */}
      {/* RESUMEN FINANCIERO */}
      {/* ====================================== */}

      {!loading &&
      resumen ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Ventas
                </p>

                <h3 className="mt-1 text-lg font-bold text-zinc-950">
                  Resumen financiero
                </h3>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CircleDollarSign
                  size={22}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Vendido
                </p>

                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(
                    resumen
                      .ventas
                      .total,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Pagado
                </p>

                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(
                    resumen
                      .ventas
                      .montoPagado,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Pendiente
                </p>

                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(
                    resumen
                      .ventas
                      .saldoPendiente,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Costo
                </p>

                <p className="mt-1 text-base font-bold text-zinc-950">
                  {formatCurrency(
                    resumen
                      .ventas
                      .costo,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Ganancia
                </p>

                <p className="mt-1 text-base font-bold text-emerald-600">
                  {formatCurrency(
                    resumen
                      .ventas
                      .gananciaBruta,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Margen
                </p>

                <p className="mt-1 text-base font-bold text-zinc-950">
                  {resumen
                    .ventas
                    .margenBrutoPorcentaje.toFixed(
                      2,
                    )}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Compras
                </p>

                <h3 className="mt-1 text-lg font-bold text-zinc-950">
                  Estado de pedidos
                </h3>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <ReceiptText
                  size={22}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold text-zinc-950">
                  {
                    resumen
                      .pedidos
                      .total
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Registrados
                </p>

                <p className="mt-1 text-xl font-bold text-zinc-950">
                  {
                    resumen
                      .pedidos
                      .registrados
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  En tránsito
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {
                    resumen
                      .pedidos
                      .enTransito
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Recibidos
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {
                    resumen
                      .pedidos
                      .recibidos
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Pendientes
                </p>

                <p className="mt-1 text-xl font-bold text-amber-600">
                  {
                    resumen
                      .pedidos
                      .pendientes
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-400">
                  Cancelados
                </p>

                <p className="mt-1 text-xl font-bold text-red-600">
                  {
                    resumen
                      .pedidos
                      .cancelados
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ====================================== */}
      {/* MÓDULOS */}
      {/* ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-sm">
              Módulos del sistema
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Seleccioná el módulo que deseás administrar.
            </p>
          </div>

          <div className="hidden h-px flex-1 bg-zinc-200 sm:block" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {navigationItems
            .filter(
              (item) =>
                item.path !==
                "/",
            )
            .map(
              (item) => (
                <ModuleCard
                  key={
                    item.path
                  }
                  title={
                    item.label
                  }
                  description={
                    item.description
                  }
                  to={
                    item.path
                  }
                  icon={
                    item.icon
                  }
                />
              ),
            )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;