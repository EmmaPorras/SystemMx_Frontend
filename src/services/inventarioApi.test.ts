import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  obtenerLoteInventarioApi,
  obtenerLotesInventarioApi,
  obtenerLotesPorProductoApi,
  obtenerMovimientoInventarioApi,
  obtenerMovimientosInventarioApi,
} from "./inventarioApi";

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

describe("inventarioApi - lotes", () => {
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

  it("consulta lotes paginados con filtros", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        items: [],
        total: 0,
        pagina: 2,
        limite: 20,
        totalPaginas: 0,
      }),
    );

    await obtenerLotesInventarioApi({
      productoId: 7,
      estadoLote: "EN_STOCK",
      pagina: 2,
      limite: 20,
    });

    const [url] =
      fetchMock.mock.calls[0] as [
        string,
      ];

    const parsed =
      new URL(url);

    expect(parsed.pathname).toBe(
      "/api/inventario/lotes",
    );

    expect(
      parsed.searchParams.get(
        "productoId",
      ),
    ).toBe("7");

    expect(
      parsed.searchParams.get(
        "estadoLote",
      ),
    ).toBe("EN_STOCK");

    expect(
      parsed.searchParams.get(
        "pagina",
      ),
    ).toBe("2");

    expect(
      parsed.searchParams.get(
        "limite",
      ),
    ).toBe("20");
  });

  it("consulta los lotes paginados de un producto", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        items: [],
        total: 0,
        pagina: 2,
        limite: 5,
        totalPaginas: 0,
      }),
    );

    await obtenerLotesPorProductoApi(
      15,
      {
        pagina: 2,
        limite: 5,
        estadoLote: "EN_STOCK",
      },
    );

    const [url] =
      fetchMock.mock.calls[0] as [
        string,
      ];

    const parsed = new URL(url);

    expect(parsed.pathname).toBe(
      "/api/inventario/productos/15/lotes",
    );

    expect(
      parsed.searchParams.get("pagina"),
    ).toBe("2");

    expect(
      parsed.searchParams.get("limite"),
    ).toBe("5");

    expect(
      parsed.searchParams.get(
        "estadoLote",
      ),
    ).toBe("EN_STOCK");

    expect(
      parsed.searchParams.has(
        "productoId",
      ),
    ).toBe(false);
  });

  it("consulta un lote por id", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        idLote: 12,
        codigoLote: "L1",
        idProducto: 4,
        idPedido: 8,
        idDetallePedido: 10,
        cantidadInicial: 5,
        cantidadRecibida: 5,
        cantidadDisponible: 5,
        cantidadVendida: 0,
        cantidadPendienteRecepcion: 0,
        estadoLote: "EN_STOCK",
        fechaEntrada:
          "2026-09-11",
        costoUnitarioReal: 1000,
        precioVentaRecomendado: 2000,
        producto: null,
        pedido: null,
      }),
    );

    const result =
      await obtenerLoteInventarioApi(
        12,
      );

    expect(result.idLote).toBe(12);

    const [url] =
      fetchMock.mock.calls[0] as [
        string,
      ];

    expect(
      new URL(url).pathname,
    ).toBe(
      "/api/inventario/lotes/12",
    );
  });

  it("consulta movimientos paginados con filtros", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        items: [],
        total: 0,
        pagina: 1,
        limite: 20,
        totalPaginas: 0,
      }),
    );

    await obtenerMovimientosInventarioApi({
      productoId: 7,
      loteId: 10,
      tipoMovimiento: "SALIDA_VENTA",
      referenciaTipo: "VENTA",
      referenciaId: 50,
      desde: "2026-09-01",
      hasta: "2026-09-11",
      usuarioId: 1,
      pagina: 1,
      limite: 20,
    });

    const [url] =
      fetchMock.mock.calls[0] as [
        string,
      ];

    const parsed = new URL(url);

    expect(parsed.pathname).toBe(
      "/api/inventario/movimientos",
    );

    expect(
      parsed.searchParams.get(
        "productoId",
      ),
    ).toBe("7");

    expect(
      parsed.searchParams.get(
        "loteId",
      ),
    ).toBe("10");

    expect(
      parsed.searchParams.get(
        "tipoMovimiento",
      ),
    ).toBe("SALIDA_VENTA");

    expect(
      parsed.searchParams.get(
        "referenciaTipo",
      ),
    ).toBe("VENTA");

    expect(
      parsed.searchParams.get(
        "referenciaId",
      ),
    ).toBe("50");

    expect(
      parsed.searchParams.get(
        "desde",
      ),
    ).toBe("2026-09-01");

    expect(
      parsed.searchParams.get(
        "hasta",
      ),
    ).toBe("2026-09-11");

    expect(
      parsed.searchParams.get(
        "usuarioId",
      ),
    ).toBe("1");
  });

  it("consulta un movimiento por id", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        idMovimiento: 99,
        fechaMovimiento:
          "2026-09-11T12:00:00.000Z",
        tipoMovimiento:
          "ENTRADA_COMPRA",
        cantidad: 5,
        referenciaTipo: "PEDIDO",
        referenciaId: 20,
        idUsuario: 1,
        usuario: "admin",
        motivo: "Recepción de pedido",
        observaciones: null,
        costoUnitario: 1000,
        totalMovimiento: 5000,
        producto: null,
        lote: null,
      }),
    );

    const result =
      await obtenerMovimientoInventarioApi(
        99,
      );

    expect(
      result.idMovimiento,
    ).toBe(99);

    const [url] =
      fetchMock.mock.calls[0] as [
        string,
      ];

    expect(
      new URL(url).pathname,
    ).toBe(
      "/api/inventario/movimientos/99",
    );
  });
});
