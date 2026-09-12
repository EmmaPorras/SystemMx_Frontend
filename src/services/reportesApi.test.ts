import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as reportesApi from "./reportesApi";

function createResponse(
  status: number,
  body: unknown,
): Response {
  return {
    ok:
      status >= 200 &&
      status < 300,

    status,

    text: vi
      .fn()
      .mockResolvedValue(
        JSON.stringify(body),
      ),
  } as unknown as Response;
}

type EndpointCase = {
  name: string;
  pathname: string;
  invoke: () => Promise<unknown>;
  expectedQuery?: Record<
    string,
    string
  >;
};

describe("reportesApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();

    sessionStorage.setItem(
      "systemmx.accessToken",
      "token-admin",
    );

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    fetchMock.mockResolvedValue(
      createResponse(200, {}),
    );
  });

  const periodo = {
    fechaDesde:
      "2026-09-01",

    fechaHasta:
      "2026-09-11",
  };

  const cases: EndpointCase[] = [
    {
      name: "resumen",
      pathname:
        "/api/reportes/resumen",
      invoke: () =>
        reportesApi.obtenerReporteResumenApi(
          periodo,
        ),
    },

    {
      name: "ventas resumen",
      pathname:
        "/api/reportes/ventas/resumen",
      invoke: () =>
        reportesApi.obtenerReporteVentasResumenApi(
          periodo,
        ),
    },
    {
      name: "ventas evolución",
      pathname:
        "/api/reportes/ventas/evolucion",
      invoke: () =>
        reportesApi.obtenerReporteVentasEvolucionApi(
          periodo,
        ),
    },
    {
      name: "ventas productos",
      pathname:
        "/api/reportes/ventas/productos",
      invoke: () =>
        reportesApi.obtenerReporteVentasProductosApi(
          periodo,
        ),
    },
    {
      name: "ventas lotes",
      pathname:
        "/api/reportes/ventas/lotes",
      invoke: () =>
        reportesApi.obtenerReporteVentasLotesApi(
          periodo,
        ),
    },
    {
      name: "ventas anuladas",
      pathname:
        "/api/reportes/ventas/anuladas",
      invoke: () =>
        reportesApi.obtenerReporteVentasAnuladasApi(
          periodo,
        ),
    },

    {
      name: "inventario resumen",
      pathname:
        "/api/reportes/inventario/resumen",
      invoke: () =>
        reportesApi.obtenerReporteInventarioResumenApi(),
    },
    {
      name: "inventario productos",
      pathname:
        "/api/reportes/inventario/productos",
      invoke: () =>
        reportesApi.obtenerReporteInventarioProductosApi(),
    },
    {
      name: "inventario estados",
      pathname:
        "/api/reportes/inventario/estados",
      invoke: () =>
        reportesApi.obtenerReporteInventarioEstadosApi(),
    },
    {
      name: "inventario sin stock",
      pathname:
        "/api/reportes/inventario/sin-stock",
      invoke: () =>
        reportesApi.obtenerReporteInventarioSinStockApi(),
    },
    {
      name: "inventario histórico",
      pathname:
        "/api/reportes/inventario/historico",
      invoke: () =>
        reportesApi.obtenerReporteInventarioHistoricoApi({
          fechaCorte:
            "2026-09-11",
        }),
      expectedQuery: {
        fechaCorte:
          "2026-09-11",
      },
    },

    {
      name: "compras resumen",
      pathname:
        "/api/reportes/compras/resumen",
      invoke: () =>
        reportesApi.obtenerReporteComprasResumenApi(
          periodo,
        ),
    },
    {
      name: "compras evolución",
      pathname:
        "/api/reportes/compras/evolucion",
      invoke: () =>
        reportesApi.obtenerReporteComprasEvolucionApi(
          periodo,
        ),
    },
    {
      name: "compras proveedores",
      pathname:
        "/api/reportes/compras/proveedores",
      invoke: () =>
        reportesApi.obtenerReporteComprasProveedoresApi(
          periodo,
        ),
    },
    {
      name: "compras productos",
      pathname:
        "/api/reportes/compras/productos",
      invoke: () =>
        reportesApi.obtenerReporteComprasProductosApi(
          periodo,
        ),
    },
    {
      name: "compras costos",
      pathname:
        "/api/reportes/compras/costos",
      invoke: () =>
        reportesApi.obtenerReporteComprasCostosApi(
          periodo,
        ),
    },
    {
      name: "compras canceladas",
      pathname:
        "/api/reportes/compras/canceladas",
      invoke: () =>
        reportesApi.obtenerReporteComprasCanceladasApi(
          periodo,
        ),
    },

    {
      name: "pagos resumen",
      pathname:
        "/api/reportes/pagos/resumen",
      invoke: () =>
        reportesApi.obtenerReportePagosResumenApi(
          periodo,
        ),
    },
    {
      name: "pagos evolución",
      pathname:
        "/api/reportes/pagos/evolucion",
      invoke: () =>
        reportesApi.obtenerReportePagosEvolucionApi(
          periodo,
        ),
    },
    {
      name: "pagos métodos",
      pathname:
        "/api/reportes/pagos/metodos",
      invoke: () =>
        reportesApi.obtenerReportePagosMetodosApi(
          periodo,
        ),
    },
    {
      name: "pagos conciliación",
      pathname:
        "/api/reportes/pagos/conciliacion",
      invoke: () =>
        reportesApi.obtenerReportePagosConciliacionApi(),
    },

    {
      name: "cuentas por cobrar",
      pathname:
        "/api/reportes/cuentas-por-cobrar",
      invoke: () =>
        reportesApi.obtenerReporteCuentasPorCobrarApi(),
    },
    {
      name: "vencimientos",
      pathname:
        "/api/reportes/cuentas-por-cobrar/vencimientos",
      invoke: () =>
        reportesApi.obtenerReporteVencimientosApi({
          fechaCorte:
            "2026-09-11",
        }),
      expectedQuery: {
        fechaCorte:
          "2026-09-11",
      },
    },

    {
      name: "auditoría resumen",
      pathname:
        "/api/reportes/auditoria/resumen",
      invoke: () =>
        reportesApi.obtenerReporteAuditoriaResumenApi(),
    },
    {
      name: "auditoría usuarios",
      pathname:
        "/api/reportes/auditoria/usuarios",
      invoke: () =>
        reportesApi.obtenerReporteAuditoriaUsuariosApi({
          ...periodo,
          usuarioId: 1,
        }),
    },
    {
      name: "auditoría movimientos",
      pathname:
        "/api/reportes/auditoria/movimientos",
      invoke: () =>
        reportesApi.obtenerReporteAuditoriaMovimientosApi({
          ...periodo,
          usuarioId: 1,
          tipoMovimiento:
            "ENTRADA_COMPRA",
        }),
    },
    {
      name: "auditoría pagos",
      pathname:
        "/api/reportes/auditoria/pagos",
      invoke: () =>
        reportesApi.obtenerReporteAuditoriaPagosApi({
          ...periodo,
          usuarioId: 1,
        }),
    },
    {
      name: "auditoría legacy",
      pathname:
        "/api/reportes/auditoria/legacy",
      invoke: () =>
        reportesApi.obtenerReporteAuditoriaLegacyApi(),
    },
  ];

  it.each(cases)(
    "$name usa el endpoint correcto",
    async ({
      pathname,
      invoke,
      expectedQuery,
    }) => {
      await invoke();

      const [url] =
        fetchMock.mock
          .calls[0] as [
          string,
        ];

      const parsed =
        new URL(url);

      expect(
        parsed.pathname,
      ).toBe(pathname);

      if (expectedQuery) {
        for (
          const [
            key,
            value,
          ] of Object.entries(
            expectedQuery,
          )
        ) {
          expect(
            parsed.searchParams.get(
              key,
            ),
          ).toBe(value);
        }
      }
    },
  );
});
