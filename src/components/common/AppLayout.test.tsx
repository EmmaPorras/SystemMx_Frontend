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

  it("aplica jerarquía correcta de capas visuales y gestiona apertura/cierre de menú móvil", async () => {
    const user = userEvent.setup();

    render(
      <AuthContext.Provider value={createAuthValue()}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<div data-testid="page-content">Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    const mainEl = screen.getByRole("main");
    expect(mainEl.className).toContain("isolate");
    expect(mainEl.className).toContain("relative");

    const asideNav = document.getElementById("mobile-navigation");
    expect(asideNav).toBeInTheDocument();
    expect(asideNav?.className).toContain("z-50");

    const menuToggle = screen.getByRole("button", { name: /abrir navegación|open/i });
    expect(menuToggle).toHaveAttribute("aria-expanded", "false");

    // Abrir menú móvil
    await user.click(menuToggle);
    expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    // Backdrop debe estar visible con z-40
    const backdrop = document.querySelector(".fixed.inset-0.top-15.z-40");
    expect(backdrop).toBeInTheDocument();
    expect(backdrop?.className).toContain("z-40");

    // Cerrar al hacer clic en el backdrop
    await user.click(backdrop as Element);
    expect(document.querySelector(".fixed.inset-0.top-15.z-40")).not.toBeInTheDocument();
    expect(menuToggle).toHaveAttribute("aria-expanded", "false");

    // Abrir nuevamente y cerrar con tecla Escape
    await user.click(menuToggle);
    expect(document.querySelector(".fixed.inset-0.top-15.z-40")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(document.querySelector(".fixed.inset-0.top-15.z-40")).not.toBeInTheDocument();
  });
});
