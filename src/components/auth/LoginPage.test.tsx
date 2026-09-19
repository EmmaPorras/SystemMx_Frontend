import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

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

import {
  AuthContext,
  type AuthContextValue,
} from "../../auth/AuthContext";

import LoginPage from "./LoginPage";

function createAuthValue(
  login: AuthContextValue["login"],
): AuthContextValue {
  return {
    user: null,
    status: "unauthenticated",
    sessionError: null,
    login,
    logout: vi.fn(),
    refreshSession: vi.fn(async () => undefined),
  };
}

describe("LoginPage", () => {
  it("envía las credenciales al AuthProvider", async () => {
    const user = userEvent.setup();

    const loginMock = vi.fn(async () => undefined);

    render(
      <AuthContext.Provider
        value={createAuthValue(loginMock)}
      >
        <MemoryRouter
          initialEntries={["/login"]}
        >
          <Routes>
            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/"
              element={<div>Inicio SystemMx</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    await user.type(
      screen.getByPlaceholderText(
        "Ingrese su usuario",
      ),
      "admin",
    );

    await user.type(
      screen.getByPlaceholderText(
        "Ingrese su contraseña",
      ),
      "clave-prueba",
    );

    await user.click(
      screen.getByRole("button", {
        name: /ingresar/i,
      }),
    );

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: "admin",
        password: "clave-prueba",
      });
    });
  });

  it("regresa a la ruta original después del login", async () => {
    const user = userEvent.setup();

    const loginMock = vi.fn(async () => undefined);

    render(
      <AuthContext.Provider
        value={createAuthValue(loginMock)}
      >
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/login",
              state: {
                from: "/ventas",
              },
            },
          ]}
        >
          <Routes>
            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/ventas"
              element={<div>Ventas destino</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    await user.type(
      screen.getByPlaceholderText(
        "Ingrese su usuario",
      ),
      "admin",
    );

    await user.type(
      screen.getByPlaceholderText(
        "Ingrese su contraseña",
      ),
      "clave-prueba",
    );

    await user.click(
      screen.getByRole("button", {
        name: /ingresar/i,
      }),
    );

    expect(
      await screen.findByText("Ventas destino"),
    ).toBeInTheDocument();
  });

  it("valida campos vacíos sin llamar al backend", async () => {
    const user = userEvent.setup();

    const loginMock = vi.fn(async () => undefined);

    render(
      <AuthContext.Provider
        value={createAuthValue(loginMock)}
      >
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: /ingresar/i,
      }),
    );

    expect(
      screen.getByText(
        "Ingrese el nombre de usuario.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Ingrese la contraseña.",
      ),
    ).toBeInTheDocument();

    expect(loginMock).not.toHaveBeenCalled();
  });
});
