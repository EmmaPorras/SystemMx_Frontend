import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  obtenerCuentasPorCobrarApi,
  obtenerVencimientosCuentasPorCobrarApi,
} from "./cuentasPorCobrarApi";

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

describe("cuentasPorCobrarApi", () => {
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
  });

  it("consulta el resumen y detalle de cuentas por cobrar", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        resumen: { ventasConSaldo: 2, totalPorCobrar: 15000 },
        detalle: [],
      }),
    );

    const result = await obtenerCuentasPorCobrarApi();
    expect(result.resumen.ventasConSaldo).toBe(2);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url).pathname).toBe("/api/reportes/cuentas-por-cobrar");
  });

  it("consulta los vencimientos según la fecha de corte", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        fechaCorte: "2026-09-11",
        sinVencimiento: { cantidad: 1, saldo: 5000 },
        vencidas: { cantidad: 1, saldo: 10000 },
        venceEnFechaCorte: { cantidad: 0, saldo: 0 },
        porVencer: { cantidad: 0, saldo: 0 },
      }),
    );

    const result = await obtenerVencimientosCuentasPorCobrarApi("2026-09-11");
    expect(result.vencidas.saldo).toBe(10000);

    const [url] = fetchMock.mock.calls[0] as [string];
    const parsed = new URL(url);

    expect(parsed.pathname).toBe("/api/reportes/cuentas-por-cobrar/vencimientos");
    expect(parsed.searchParams.get("fechaCorte")).toBe("2026-09-11");
  });
});
