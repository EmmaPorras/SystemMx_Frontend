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
  it("presenta el video como logo animado con reproducción automática y bucle", () => {
    const loginMock = vi.fn(async () => undefined);
    const { container } = render(
      <AuthContext.Provider value={createAuthValue(loginMock)}>
        <MemoryRouter initialEntries={["/login"]}>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    const logo = container.querySelector<HTMLVideoElement>(
      '[data-testid="systemmx-animated-logo"]',
    );
    expect(logo).not.toBeNull();
    expect(logo).toHaveClass("object-cover");
    expect(logo?.parentElement).toHaveClass("aspect-video", "bg-white");
    expect(logo).toHaveAttribute("autoplay");
    expect(logo).toHaveAttribute("loop");
    expect(logo).toHaveAttribute("muted");
    expect(logo).toHaveAttribute("playsinline");
    expect(logo).not.toHaveAttribute("controls");
    expect(logo?.querySelector("source")).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dqqnhxhcp/video/upload/v1791492297/gemini_generated_video_68192616_ogqmlj.mp4",
    );
  });

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
