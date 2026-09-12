import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ApiError } from "./ApiError";
import {
  apiClient,
  AUTH_UNAUTHORIZED_EVENT,
} from "./apiClient";
import {
  getAccessToken,
  setAccessToken,
} from "../auth/tokenStorage";

function createResponse(
  status: number,
  body?: unknown,
): Response {
  const text =
    body === undefined
      ? ""
      : typeof body === "string"
        ? body
        : JSON.stringify(body);

  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(text),
  } as unknown as Response;
}

describe("apiClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    fetchMock.mockReset();

    vi.stubGlobal("fetch", fetchMock);
  });

  it("agrega Authorization Bearer cuando existe token", async () => {
    setAccessToken("token-admin");

    fetchMock.mockResolvedValue(
      createResponse(200, { ok: true }),
    );

    await apiClient.get<{ ok: boolean }>("/proveedores");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    const headers = new Headers(requestInit.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer token-admin",
    );
  });

  it("construye correctamente los query params", async () => {
    fetchMock.mockResolvedValue(
      createResponse(200, []),
    );

    await apiClient.get("/ventas", {
      papelera: true,
      deudores: false,
      pagina: 2,
      vacio: "",
      omitido: undefined,
      nulo: null,
    });

    const [url] = fetchMock.mock.calls[0] as [string];

    const parsedUrl = new URL(url);

    expect(parsedUrl.pathname).toBe("/api/ventas");
    expect(parsedUrl.searchParams.get("papelera")).toBe("true");
    expect(parsedUrl.searchParams.get("deudores")).toBe("false");
    expect(parsedUrl.searchParams.get("pagina")).toBe("2");

    expect(parsedUrl.searchParams.has("vacio")).toBe(false);
    expect(parsedUrl.searchParams.has("omitido")).toBe(false);
    expect(parsedUrl.searchParams.has("nulo")).toBe(false);
  });

  it("une los mensajes de validación de un error 400", async () => {
    fetchMock.mockResolvedValue(
      createResponse(400, {
        statusCode: 400,
        message: [
          "El nombre es obligatorio.",
          "El correo no es válido.",
        ],
        error: "Bad Request",
      }),
    );

    try {
      await apiClient.post("/proveedores", {});
      throw new Error("La petición debía fallar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);

      const apiError = error as ApiError;

      expect(apiError.status).toBe(400);
      expect(apiError.message).toBe(
        "El nombre es obligatorio. El correo no es válido.",
      );
    }
  });

  it("elimina el token y emite evento ante un 401 autenticado", async () => {
    setAccessToken("token-expirado");

    const unauthorizedListener = vi.fn();

    window.addEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      unauthorizedListener,
    );

    fetchMock.mockResolvedValue(
      createResponse(401, {
        statusCode: 401,
        message: "Token inválido.",
        error: "Unauthorized",
      }),
    );

    await expect(
      apiClient.get("/auth/me"),
    ).rejects.toMatchObject({
      status: 401,
      message: "Token inválido.",
    });

    expect(getAccessToken()).toBeNull();
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    window.removeEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      unauthorizedListener,
    );
  });

  it("NO elimina el token ante un 403", async () => {
    setAccessToken("token-valido");

    fetchMock.mockResolvedValue(
      createResponse(403, {
        statusCode: 403,
        message: "Acceso denegado.",
        error: "Forbidden",
      }),
    );

    await expect(
      apiClient.get("/auditoria"),
    ).rejects.toMatchObject({
      status: 403,
      message: "Acceso denegado.",
    });

    expect(getAccessToken()).toBe("token-valido");
  });

  it("conserva el mensaje real del backend ante un 409", async () => {
    fetchMock.mockResolvedValue(
      createResponse(409, {
        statusCode: 409,
        message:
          "No hay inventario suficiente para completar la venta.",
        error: "Conflict",
      }),
    );

    await expect(
      apiClient.post("/ventas", {}),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "No hay inventario suficiente para completar la venta.",
    });
  });

  it("maneja correctamente un 429", async () => {
    fetchMock.mockResolvedValue(
      createResponse(429, {
        statusCode: 429,
        message:
          "Demasiados intentos. Intente nuevamente más tarde.",
        error: "Too Many Requests",
      }),
    );

    await expect(
      apiClient.post(
        "/auth/login",
        {
          username: "admin",
          password: "password-de-prueba",
        },
        {
          auth: false,
        },
      ),
    ).rejects.toMatchObject({
      status: 429,
      message:
        "Demasiados intentos. Intente nuevamente más tarde.",
    });
  });

  it("no envía Authorization cuando auth es false", async () => {
    setAccessToken("token-existente");

    fetchMock.mockResolvedValue(
      createResponse(200, {
        accessToken: "nuevo-token",
      }),
    );

    await apiClient.post(
      "/auth/login",
      {
        username: "admin",
        password: "password-de-prueba",
      },
      {
        auth: false,
      },
    );

    const [, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    const headers = new Headers(requestInit.headers);

    expect(headers.has("Authorization")).toBe(false);
  });
});
