import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";

import RecuperarPasswordPage from "./RecuperarPasswordPage";
import RestablecerPasswordPage from "./RestablecerPasswordPage";
import ActivarCuentaPage from "./ActivarCuentaPage";
import * as authApi from "./auth.api";

describe("Flujos de Autenticación - Recuperación y Activación", () => {
  describe("RecuperarPasswordPage", () => {
    it("solicita recuperación y muestra mensaje genérico seguro", async () => {
      const user = userEvent.setup();
      const spy = vi.spyOn(authApi, "solicitarRecuperacionApi").mockResolvedValue({
        message: "Enlace enviado",
      });

      render(
        <MemoryRouter>
          <RecuperarPasswordPage />
        </MemoryRouter>,
      );

      const emailInput = screen.getByPlaceholderText("ejemplo@correo.com");
      await user.type(emailInput, "juanito@gmail.com");

      const submitBtn = screen.getByRole("button", { name: /enviar enlace de recuperación/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "juanito@gmail.com",
          }),
        );
      });

      expect(await screen.findByText(/solicitud procesada/i)).toBeInTheDocument();
      expect(
        screen.getByText(/si el correo electrónico está registrado en el sistema/i),
      ).toBeInTheDocument();
    });
  });

  describe("ActivarCuentaPage", () => {
    it("valida el token de invitación y permite definir contraseña", async () => {
      const user = userEvent.setup();
      vi.spyOn(authApi, "validarTokenApi").mockResolvedValue({
        valid: true,
        tipo: "INVITACION",
        nombre: "Juanito",
        username: "juanito24",
      });

      const activarSpy = vi.spyOn(authApi, "activarCuentaApi").mockResolvedValue({
        success: true,
        message: "Activado",
      });

      render(
        <MemoryRouter initialEntries={["/activar-cuenta?token=valid-token-123"]}>
          <Routes>
            <Route path="/activar-cuenta" element={<ActivarCuentaPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Juanito")).toBeInTheDocument();
      expect(screen.getByText("@juanito24")).toBeInTheDocument();

      const passInputs = screen.getAllByPlaceholderText("Ingrese su contraseña");
      await user.type(passInputs[0], "MiClaveSegura123!");
      await user.type(passInputs[1], "MiClaveSegura123!");

      const submitBtn = screen.getByRole("button", {
        name: /activar cuenta y guardar contraseña/i,
      });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(activarSpy).toHaveBeenCalledWith({
          token: "valid-token-123",
          password: "MiClaveSegura123!",
        });
      });

      expect(await screen.findByText(/cuenta activada exitosamente/i)).toBeInTheDocument();
    });

    it("muestra advertencia si el token es inválido o ha expirado", async () => {
      vi.spyOn(authApi, "validarTokenApi").mockResolvedValue({
        valid: false,
        tipo: "INVITACION",
      });

      render(
        <MemoryRouter initialEntries={["/activar-cuenta?token=expired-token"]}>
          <Routes>
            <Route path="/activar-cuenta" element={<ActivarCuentaPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText(/enlace inválido o expirado/i)).toBeInTheDocument();
    });
  });

  describe("RestablecerPasswordPage", () => {
    it("valida el token de recuperación y permite cambiar la contraseña", async () => {
      const user = userEvent.setup();
      vi.spyOn(authApi, "validarTokenApi").mockResolvedValue({
        valid: true,
        tipo: "RECUPERACION_PASSWORD",
      });

      const resetSpy = vi.spyOn(authApi, "restablecerPasswordApi").mockResolvedValue({
        success: true,
        message: "Actualizado",
      });

      render(
        <MemoryRouter initialEntries={["/restablecer-contrasena?token=recovery-token-xyz"]}>
          <Routes>
            <Route path="/restablecer-contrasena" element={<RestablecerPasswordPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByRole("button", { name: /guardar nueva contraseña/i })).toBeInTheDocument();

      const passInputs = screen.getAllByPlaceholderText("Ingrese su contraseña");
      await user.type(passInputs[0], "NuevaClaveSuperSegura123!");
      await user.type(passInputs[1], "NuevaClaveSuperSegura123!");

      const submitBtn = screen.getByRole("button", { name: /guardar nueva contraseña/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(resetSpy).toHaveBeenCalledWith({
          token: "recovery-token-xyz",
          password: "NuevaClaveSuperSegura123!",
        });
      });

      expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument();
    });
  });
});
