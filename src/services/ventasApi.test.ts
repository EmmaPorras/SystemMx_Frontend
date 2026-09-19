import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  anularVentaApi,
  crearVentaApi,
  enviarVentaPapeleraApi,
  obtenerInventarioDisponibleVentaApi,
  obtenerPagosVentaApi,
  obtenerVentaApi,
  obtenerVentasApi,
  registrarPagoVentaApi,
  restaurarVentaApi,
} from "./ventasApi";

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

describe("ventasApi", () => {
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

  it("consulta listado de ventas activas y con filtros de query", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, []),
    );

    await obtenerVentasApi({ papelera: true });

    const [url] = fetchMock.mock.calls[0] as [string];
    const parsed = new URL(url);

    expect(parsed.pathname).toBe("/api/ventas");
    expect(parsed.searchParams.get("papelera")).toBe("true");
  });

  it("consulta una venta por id", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, { id: 10, numeroVenta: "10" }),
    );

    const venta = await obtenerVentaApi(10);
    expect(venta.id).toBe(10);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url).pathname).toBe("/api/ventas/10");
  });

  it("consulta el inventario disponible para venta", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, [
        {
          loteId: 1,
          productoId: 5,
          cantidadDisponible: 10,
        },
      ]),
    );

    const result = await obtenerInventarioDisponibleVentaApi();
    expect(result).toHaveLength(1);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url).pathname).toBe("/api/ventas/inventario-disponible");
  });

  it("no envía campos financieros calculados al crear venta", async () => {
    fetchMock.mockResolvedValue(
      createResponse(201, {
        id: 1,
        numeroVenta: "100",
        estadoVenta: "REGISTRADA",
        detalles: [],
      }),
    );

    await crearVentaApi({
      numeroVenta: 100,
      fechaVenta: "2026-09-11",
      medioPago: "EFECTIVO",
      detalles: [
        {
          productoId: 10,
          cantidad: 2,
          precioUnitario: 5000,
          tipoTarifa: "IVA",
          porcentajeIva: 13,
          modoDescuentoLote: "FIFO",
        },
      ],
    });

    const [, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    const body = JSON.parse(
      String(init.body),
    ) as Record<string, unknown>;

    expect(body).not.toHaveProperty("subtotal");
    expect(body).not.toHaveProperty("totalVenta");
    expect(body).not.toHaveProperty("saldoPendiente");
    expect(body).not.toHaveProperty("gananciaBruta");
    expect(body).not.toHaveProperty("costoTotal");
    expect(body).not.toHaveProperty("ivaTotal");
  });

  it("consulta los pagos de una venta", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, [
        {
          idPagoVenta: 1,
          idVenta: 5,
          monto: 5000,
          metodoPago: "SINPE",
        },
      ]),
    );

    const pagos = await obtenerPagosVentaApi(5);
    expect(pagos).toHaveLength(1);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url).pathname).toBe("/api/ventas/5/pagos");
  });

  it("registra un pago append-only a una venta", async () => {
    fetchMock.mockResolvedValue(
      createResponse(201, {
        id: 5,
        saldoPendiente: 0,
        estadoPago: "PAGADA",
      }),
    );

    const actualizada = await registrarPagoVentaApi(5, {
      monto: 5000,
      metodoPago: "SINPE",
      referencia: "REF-123",
    });

    expect(actualizada.saldoPendiente).toBe(0);

    const [url, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(new URL(url).pathname).toBe("/api/ventas/5/pagos");
    expect(init.method).toBe("POST");
  });

  it("envía venta a papelera, restaura y anula con PATCH", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, { id: 7, enPapelera: true }),
    );

    await enviarVentaPapeleraApi(7);

    const [url1, init1] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url1).pathname).toBe("/api/ventas/7/papelera");
    expect(init1.method).toBe("PATCH");

    fetchMock.mockResolvedValue(
      createResponse(200, { id: 7, enPapelera: false }),
    );

    await restaurarVentaApi(7);

    const [url2, init2] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(new URL(url2).pathname).toBe("/api/ventas/7/restaurar");
    expect(init2.method).toBe("PATCH");

    fetchMock.mockResolvedValue(
      createResponse(200, { id: 7, estadoVenta: "ANULADA" }),
    );

    await anularVentaApi(7);

    const [url3, init3] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(new URL(url3).pathname).toBe("/api/ventas/7/anular");
    expect(init3.method).toBe("PATCH");
  });
});
