import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  obtenerProductoApi,
  obtenerProductosApi,
} from "./productosApi";

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

describe("productosApi", () => {
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

  it("consulta el catálogo de productos", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, [
        {
          idProducto: 1,
          nombre: "Filtro",
          precioVentaSugeridoSinIva: 5000,
          stockMinimo: 2,
          activo: true,
          stockActual: 8,
          categoria: null,
          tarifaIva: null,
        },
      ]),
    );

    const result =
      await obtenerProductosApi();

    expect(result).toHaveLength(1);

    expect(
      result[0]?.stockActual,
    ).toBe(8);

    const [url, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    expect(
      new URL(url).pathname,
    ).toBe("/api/productos");

    expect(
      requestInit.method,
    ).toBe("GET");
  });

  it("consulta un producto individual por id", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        idProducto: 7,
        nombre: "Aceite",
        precioVentaSugeridoSinIva: 7000,
        stockMinimo: 3,
        activo: true,
        stockActual: 5,
      }),
    );

    const result =
      await obtenerProductoApi(7);

    expect(result.idProducto).toBe(7);

    const [url] =
      fetchMock.mock.calls[0] as [
        string,
      ];

    expect(
      new URL(url).pathname,
    ).toBe("/api/productos/7");
  });
});
