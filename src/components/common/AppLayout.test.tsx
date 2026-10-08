import {
  render,
  screen,
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

import AppLayout from "./AppLayout";

function createAuthValue(): AuthContextValue {
  return {
    user: {
      idUsuario: 1,
      username: "admin",
      nombre: "Administrador",
      rol: "ADMIN",
      activo: true,
    },
    status: "authenticated",
    sessionError: null,
    login: vi.fn(async () => undefined),
    logout: vi.fn(),
    refreshSession: vi.fn(async () => undefined),
  };
}

describe("AppLayout", () => {
  it("muestra identidad y navegación principal", () => {
    render(
      <AuthContext.Provider value={createAuthValue()}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<div>Dashboard</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(
      screen.getByText("Administrador"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Proveedores"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pedidos"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Categorías"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Ventas")[0],
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cuentas por cobrar"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reportes"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Auditoría"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Movimientos"),
    ).toBeInTheDocument();
  });

  it("ejecuta logout", async () => {
    const user = userEvent.setup();

    const authValue = createAuthValue();

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<div>Dashboard</div>}
              />
            </Route>

            <Route
              path="/login"
              element={<div>Login</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: /cerrar sesión/i,
      }),
    );

    expect(authValue.logout).toHaveBeenCalledTimes(1);
  });

  it("bloquea el scroll del body al abrir UserWay y lo restaura al cerrar", () => {
    const { unmount } = render(
      <AuthContext.Provider value={createAuthValue()}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<div>Dashboard</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(document.body.style.overflow).toBe("");

    // Simular apertura via evento UserWay
    window.dispatchEvent(new Event("userway:open"));
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.classList.contains("userway-panel-open")).toBe(true);

    // Simular cierre via evento UserWay
    window.dispatchEvent(new Event("userway:close"));
    expect(document.body.style.overflow).toBe("");
    expect(document.body.classList.contains("userway-panel-open")).toBe(false);

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
