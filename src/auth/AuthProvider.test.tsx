import {
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import AuthProvider from "./AuthProvider";
import { useAuth } from "./useAuth";
import { setAccessToken } from "./tokenStorage";
import { AUTH_UNAUTHORIZED_EVENT } from "../api/apiClient";

function createResponse(
  status: number,
  body?: unknown,
): Response {
  const text =
    body === undefined
      ? ""
      : JSON.stringify(body);

  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(text),
  } as unknown as Response;
}

function AuthStateProbe() {
  const { status, user } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="username">
        {user?.username ?? "sin-usuario"}
      </span>
    </div>
  );
}

describe("AuthProvider", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();

    fetchMock.mockReset();

    vi.stubGlobal("fetch", fetchMock);
  });

  it("queda sin autenticar cuando no existe token", async () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("status"),
      ).toHaveTextContent("unauthenticated");
    });

    expect(
      screen.getByTestId("username"),
    ).toHaveTextContent("sin-usuario");
  });

  it("restaura la sesión mediante /auth/me", async () => {
    setAccessToken("token-admin");

    fetchMock.mockResolvedValue(
      createResponse(200, {
        idUsuario: 1,
        username: "admin",
        nombre: "Administrador",
        rol: "ADMIN",
        activo: true,
      }),
    );

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("status"),
      ).toHaveTextContent("authenticated");
    });

    expect(
      screen.getByTestId("username"),
    ).toHaveTextContent("admin");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url] = fetchMock.mock.calls[0] as [string];

    expect(new URL(url).pathname).toBe("/api/auth/me");
  });

  it("pasa a no autenticado cuando recibe unauthorized", async () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("status"),
      ).toHaveTextContent("unauthenticated");
    });

    act(() => {
      window.dispatchEvent(
        new Event(AUTH_UNAUTHORIZED_EVENT),
      );
    });

    expect(
      screen.getByTestId("status"),
    ).toHaveTextContent("unauthenticated");
  });

  it("no transforma un error 500 de /auth/me en logout", async () => {
    setAccessToken("token-admin");

    fetchMock.mockResolvedValue(
      createResponse(500, {
        statusCode: 500,
        message: "Servidor temporalmente no disponible.",
      }),
    );

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("status"),
      ).toHaveTextContent("error");
    });

    expect(sessionStorage.getItem("systemmx.accessToken")).toBe(
      "token-admin",
    );
  });
});
