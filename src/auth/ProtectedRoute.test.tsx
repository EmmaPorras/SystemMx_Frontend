import {
  render,
  screen,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import ProtectedRoute from "./ProtectedRoute";
import {
  AuthContext,
  type AuthContextValue,
} from "./AuthContext";

function createAuthValue(
  overrides: Partial<AuthContextValue> = {},
): AuthContextValue {
  return {
    user: null,
    status: "unauthenticated",
    sessionError: null,
    login: vi.fn(async () => undefined),
    logout: vi.fn(),
    refreshSession: vi.fn(async () => undefined),
    ...overrides,
  };
}

function renderRoute(
  authValue: AuthContextValue,
) {
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter
        initialEntries={["/ventas"]}
      >
        <Routes>
          <Route
            path="/login"
            element={<div>Pantalla Login</div>}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/ventas"
              element={<div>Pantalla Ventas</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("redirige al login cuando no existe sesión", () => {
    renderRoute(
      createAuthValue({
        status: "unauthenticated",
      }),
    );

    expect(
      screen.getByText("Pantalla Login"),
    ).toBeInTheDocument();
  });

  it("permite acceder cuando existe sesión válida", () => {
    renderRoute(
      createAuthValue({
        status: "authenticated",
        user: {
          idUsuario: 1,
          username: "admin",
          nombre: "Administrador",
          rol: "ADMIN",
          activo: true,
        },
      }),
    );

    expect(
      screen.getByText("Pantalla Ventas"),
    ).toBeInTheDocument();
  });

  it("muestra validación de sesión mientras carga", () => {
    renderRoute(
      createAuthValue({
        status: "loading",
      }),
    );

    expect(
      screen.getByText("Validando sesión..."),
    ).toBeInTheDocument();
  });

  it("no redirige al login ante error temporal del servidor", () => {
    renderRoute(
      createAuthValue({
        status: "error",
        sessionError:
          "Servidor temporalmente no disponible.",
      }),
    );

    expect(
      screen.getByText(
        "Servidor temporalmente no disponible.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Pantalla Login"),
    ).not.toBeInTheDocument();
  });
});
