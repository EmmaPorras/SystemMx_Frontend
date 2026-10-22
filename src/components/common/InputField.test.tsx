import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import InputField from "./InputField";

describe("InputField", () => {
  it("asocia label con el input mediante id/htmlFor", () => {
    render(
      <InputField
        label="Nombre del cliente"
        value="Carlos"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/nombre del cliente/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Carlos");
  });

  it("renderiza mensaje de error con role alert y aria-invalid", () => {
    render(
      <InputField
        label="Correo electrónico"
        value=""
        onChange={vi.fn()}
        error="El correo es requerido"
      />
    );

    const input = screen.getByLabelText(/correo electrónico/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    const errorMsg = screen.getByRole("alert");
    expect(errorMsg).toHaveTextContent("El correo es requerido");
  });

  it("llama a onChange cuando el usuario escribe", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <InputField
        label="Teléfono"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/teléfono/i);
    await user.type(input, "8");
    expect(handleChange).toHaveBeenCalledWith("8");
  });

  it("alterna entre mostrar y ocultar contraseña al presionar el botón de ojo", async () => {
    const user = userEvent.setup();
    render(
      <InputField
        label="Contraseña"
        type="password"
        value="MiClave123"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/^contraseña$/i);
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", {
      name: /mostrar contraseña/i,
    });
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    const hideButton = screen.getByRole("button", {
      name: /ocultar contraseña/i,
    });
    await user.click(hideButton);
    expect(input).toHaveAttribute("type", "password");
  });
});
