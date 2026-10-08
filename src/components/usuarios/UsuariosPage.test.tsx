import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import { AuthContext, type AuthContextValue } from "../../auth/AuthContext";
import UsuariosPage from "./UsuariosPage";
import * as usuariosApi from "../../services/usuariosApi";

function createAuthContextValue(role: "ADMIN" | "OPERADOR" = "ADMIN"): AuthContextValue {
  return {
    user: {
      idUsuario: 1,
      username: "admin",
      nombre: "Administrador General",
      rol: role,
      activo: true,
    },
    status: "authenticated",
    sessionError: null,
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
  };
}

describe("UsuariosPage", () => {
  it("muestra la lista de usuarios y permite abrir modal de invitación para ADMIN", async () => {
    const user = userEvent.setup();

    const mockUsuarios: usuariosApi.UsuarioItem[] = [
      {
        idUsuario: 1,
        username: "admin",
        nombre: "Administrador General",
        email: "admin@systemmx.com",
        rol: "ADMIN",
        activo: true,
        estadoActivacion: "ACTIVO",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        idUsuario: 2,
        username: "juanito24",
        nombre: "Juanito Pérez",
        email: "juanito@gmail.com",
        rol: "OPERADOR",
        activo: true,
        estadoActivacion: "PENDIENTE_ACTIVACION",
        createdAt: "2026-01-02T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      },
    ];

    vi.spyOn(usuariosApi, "getUsuariosApi").mockResolvedValue(mockUsuarios);

    render(
      <AuthContext.Provider value={createAuthContextValue("ADMIN")}>
        <MemoryRouter>
          <UsuariosPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.getByText("juanito24")).toBeInTheDocument();
    expect(screen.getByText("Juanito Pérez")).toBeInTheDocument();
    expect(screen.getAllByText(/pendiente de activación/i).length).toBeGreaterThanOrEqual(1);

    // Botón de invitar usuario
    const inviteBtn = screen.getByRole("button", { name: /invitar usuario/i });
    expect(inviteBtn).toBeInTheDocument();

    await user.click(inviteBtn);

    // Modal abierto
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/se registrará la cuenta y se enviará un enlace seguro/i)).toBeInTheDocument();
  });

  it("bloquea el acceso con advertencia si el usuario no es ADMIN", async () => {
    vi.spyOn(usuariosApi, "getUsuariosApi").mockResolvedValue([]);

    render(
      <AuthContext.Provider value={createAuthContextValue("OPERADOR")}>
        <MemoryRouter>
          <UsuariosPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(
      screen.getByText(/solo los administradores tienen permiso para acceder a este módulo/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /invitar usuario/i })).not.toBeInTheDocument();
  });

  it("permite reenviar invitación a usuarios con activación pendiente", async () => {
    const user = userEvent.setup();

    const mockUsuarios: usuariosApi.UsuarioItem[] = [
      {
        idUsuario: 2,
        username: "juanito24",
        nombre: "Juanito Pérez",
        email: "juanito@gmail.com",
        rol: "OPERADOR",
        activo: true,
        estadoActivacion: "PENDIENTE_ACTIVACION",
        createdAt: "2026-01-02T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      },
    ];

    vi.spyOn(usuariosApi, "getUsuariosApi").mockResolvedValue(mockUsuarios);
    const resendSpy = vi.spyOn(usuariosApi, "reenviarInvitacionApi").mockResolvedValue({
      mensaje: "Invitación reenviada exitosamente.",
    });

    render(
      <AuthContext.Provider value={createAuthContextValue("ADMIN")}>
        <MemoryRouter>
          <UsuariosPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    const resendBtn = await screen.findByRole("button", { name: /reenviar invitación/i });
    expect(resendBtn).toBeInTheDocument();

    await user.click(resendBtn);

    await waitFor(() => {
      expect(resendSpy).toHaveBeenCalledWith(2);
    });
  });
});
