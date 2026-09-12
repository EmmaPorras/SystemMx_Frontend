import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { obtenerResumenDashboard } from "./dashboardApi";

function createResponse(
  status: number,
  body: unknown,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(
      JSON.stringify(body),
    ),
  } as unknown as Response;
}

describe("dashboardApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();

    sessionStorage.setItem(
      "systemmx.accessToken",
      "token-admin",
    );

    vi.stubGlobal("fetch", fetchMock);
  });

  it("consulta el resumen real del backend", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        periodo: {
          fechaDesde: null,
          fechaHasta: null,
        },
        ventas: {
          cantidad: 0,
          total: 0,
          costo: 0,
          gananciaBruta: 0,
          margenBrutoPorcentaje: 0,
          montoPagado: 0,
          saldoPendiente: 0,
        },
        inventario: {
          lotesConStock: 0,
          unidadesDisponibles: 0,
          valorCosto: 0,
        },
        cuentasPorCobrar: {
          ventasConSaldo: 0,
          saldo: 0,
        },
        pedidos: {
          registrados: 0,
          enTransito: 0,
          recibidos: 0,
          cancelados: 0,
          pendientes: 0,
          total: 0,
        },
      }),
    );

    const result =
      await obtenerResumenDashboard();

    expect(result.ventas.cantidad).toBe(0);
    expect(result.inventario.unidadesDisponibles).toBe(0);
    expect(result.pedidos.total).toBe(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url] =
      fetchMock.mock.calls[0] as [string];

    expect(new URL(url).pathname).toBe(
      "/api/reportes/resumen",
    );
  });
});
