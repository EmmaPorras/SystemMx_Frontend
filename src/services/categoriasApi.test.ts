import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  desactivarCategoriaApi,
  obtenerCategorias,
} from "./categoriasApi";

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

describe("categoriasApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();

    sessionStorage.setItem(
      "systemmx.accessToken",
      "token-admin",
    );

    vi.stubGlobal("fetch", fetchMock);
  });

  it("consulta las categorías", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, [
        {
          idCategoria: 1,
          nombre: "Accesorios",
          descripcion: null,
          activo: true,
        },
      ]),
    );

    const result = await obtenerCategorias();

    expect(result).toHaveLength(1);
    expect(result[0]?.nombre).toBe("Accesorios");

    const [url] =
      fetchMock.mock.calls[0] as [string];

    expect(new URL(url).pathname).toBe(
      "/api/categorias",
    );
  });

  it("usa DELETE para la baja lógica", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, {
        message:
          "Categoría desactivada correctamente",
        id: 1,
      }),
    );

    const result =
      await desactivarCategoriaApi(1);

    expect(result.id).toBe(1);

    const [, requestInit] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];

    expect(requestInit.method).toBe("DELETE");
  });
});
