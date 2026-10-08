import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MoneyInputField from "./MoneyInputField";

describe("MoneyInputField", () => {
  it("renderiza label, prefijo y valor formateado de forma legible con ₡", () => {
    render(
      <MoneyInputField
        label="Precio de venta"
        value="30000"
        onChange={vi.fn()}
        currencySymbol="₡"
      />,
    );

    const input = screen.getByLabelText(/precio de venta/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("30 000");
    expect(screen.getByText("₡")).toBeInTheDocument();
  });

  it("renderiza correctamente monedas de compra internacionales como USD ($) y EUR (€)", () => {
    const { rerender } = render(
      <MoneyInputField
        label="Costo USD"
        value="12500.5"
        onChange={vi.fn()}
        currencySymbol="$"
        allowDecimals={true}
      />,
    );

    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByLabelText(/costo usd/i)).toHaveValue("12 500.5");

    rerender(
      <MoneyInputField
        label="Costo EUR"
        value="8400.75"
        onChange={vi.fn()}
        currencySymbol="€"
        allowDecimals={true}
      />,
    );

    expect(screen.getByText("€")).toBeInTheDocument();
    expect(screen.getByLabelText(/costo eur/i)).toHaveValue("8 400.75");
  });

  it("permite escribir números y notifica el valor numérico limpio en onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MoneyInputField
        label="Costo unitario"
        value=""
        onChange={handleChange}
        currencySymbol="$"
      />,
    );

    const input = screen.getByLabelText(/costo unitario/i);
    await user.type(input, "1500");

    expect(handleChange).toHaveBeenCalled();
  });

  it("muestra mensaje de error accesible cuando error está presente", () => {
    render(
      <MoneyInputField
        label="Monto"
        value=""
        onChange={vi.fn()}
        error="El monto es requerido"
      />,
    );

    const input = screen.getByLabelText(/monto/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("El monto es requerido");
  });
});
