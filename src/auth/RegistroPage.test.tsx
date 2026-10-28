import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import RegistroPage from "./RegistroPage";
import * as authApi from "./auth.api";
import { ApiError } from "../api/ApiError";

describe("RegistroPage (Fase 4 - Registro Público y Login Funcional)", () => {
  it("renderiza el formulario completo con accesibilidad y campos requeridos", () => {
    render(
      <MemoryRouter>
        <RegistroPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
  });

  it("valida campos vacíos y muestra errores con role alert y aria-invalid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistroPage />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByRole("button", { name: /registrarse/i });
    await user.click(submitBtn);

    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(4);

    const nameInput = screen.getByLabelText(/nombre completo/i);
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
  });

  it("rechaza contraseñas menores a 15 caracteres con mensaje explicativo", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistroPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Carlos Méndez");
    await user.type(screen.getByLabelText(/^usuario/i), "carlos.m");
    await user.type(screen.getByLabelText(/correo electrónico/i), "carlos@gmail.com");

    const passInput = screen.getByLabelText(/^contraseña/i);
    await user.type(passInput, "ClaveCorta14ch"); // 14 caracteres

    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    await user.type(confirmInput, "ClaveCorta14ch");

    const submitBtn = screen.getByRole("button", { name: /registrarse/i });
    await user.click(submitBtn);

    expect(screen.getByText(/al menos 15 caracteres/i)).toBeInTheDocument();
  });

  it("rechaza si la confirmación de contraseña no coincide", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistroPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Carlos Méndez");
    await user.type(screen.getByLabelText(/^usuario/i), "carlos.m");
    await user.type(screen.getByLabelText(/correo electrónico/i), "carlos@gmail.com");

    await user.type(screen.getByLabelText(/^contraseña/i), "MiClaveSeguraSystemMx15!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "OtraClaveDiferente15!");

    const submitBtn = screen.getByRole("button", { name: /registrarse/i });
    await user.click(submitBtn);

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it("envía registro exitoso a la API y muestra confirmación con aviso de rol DEMO", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authApi, "registroApi").mockResolvedValue({
      message: "Registro exitoso",
      usuario: {
        idUsuario: 101,
        username: "carlos.m",
        nombre: "Carlos Méndez",
        email: "carlos@gmail.com",
        rol: "DEMO",
        activo: true,
      },
    });

    render(
      <MemoryRouter>
        <RegistroPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Carlos Méndez");
    await user.type(screen.getByLabelText(/^usuario/i), "carlos.m");
    await user.type(screen.getByLabelText(/correo electrónico/i), "carlos@gmail.com");
    await user.type(screen.getByLabelText(/^contraseña/i), "MiClaveSeguraSystemMx15!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "MiClaveSeguraSystemMx15!");

    const submitBtn = screen.getByRole("button", { name: /registrarse/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Carlos Méndez",
          username: "carlos.m",
          email: "carlos@gmail.com",
          password: "MiClaveSeguraSystemMx15!",
        }),
      );
    });

    expect(await screen.findByText(/cuenta creada exitosamente/i)).toBeInTheDocument();
    expect(screen.getByText(/rol demo/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir a iniciar sesión/i })).toBeInTheDocument();
  });

  it("maneja error 409 de usuario o correo ya registrado", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "registroApi").mockRejectedValue(
      new ApiError(409, "El nombre de usuario o correo electrónico ya está registrado."),
    );

    render(
      <MemoryRouter>
        <RegistroPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Carlos Méndez");
    await user.type(screen.getByLabelText(/^usuario/i), "carlos.m");
    await user.type(screen.getByLabelText(/correo electrónico/i), "carlos@gmail.com");
    await user.type(screen.getByLabelText(/^contraseña/i), "MiClaveSeguraSystemMx15!");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "MiClaveSeguraSystemMx15!");

    const submitBtn = screen.getByRole("button", { name: /registrarse/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/ya está registrado/i)).toBeInTheDocument();
  });
});
