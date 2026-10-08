import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SelectField from "./SelectField";

describe("SelectField", () => {
  it("renderiza label, placeholder y opciones sin duplicados", () => {
    const handleChange = vi.fn();
    render(
      <SelectField
        label="País de origen"
        value=""
        onChange={handleChange}
        placeholder="Todos los países"
        options={[
          { value: "", label: "Todos los países" },
          { value: "CR", label: "Costa Rica" },
          { value: "CR", label: "Costa Rica Duplicado" },
          { value: "MX", label: "México" },
        ]}
      />,
    );

    const select = screen.getByRole("combobox", { name: /país de origen/i });
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    // Should only have 3 options: 1 placeholder ("Todos los países"), "Costa Rica", "México"
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Todos los países");
    expect(options[0]).toHaveValue("");
    expect(options[1]).toHaveTextContent("Costa Rica");
    expect(options[1]).toHaveValue("CR");
    expect(options[2]).toHaveTextContent("México");
    expect(options[2]).toHaveValue("MX");
  });

  it("permite seleccionar una opción y ejecuta onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SelectField
        label="Estado"
        value="ACTIVO"
        onChange={handleChange}
        options={[
          { value: "ACTIVO", label: "Activo" },
          { value: "INACTIVO", label: "Inactivo" },
        ]}
      />,
    );

    const select = screen.getByRole("combobox", { name: /estado/i });
    await user.selectOptions(select, "INACTIVO");

    expect(handleChange).toHaveBeenCalledWith("INACTIVO");
  });

  it("muestra mensaje de error accesible cuando error está presente", () => {
    render(
      <SelectField
        label="Moneda"
        value=""
        onChange={vi.fn()}
        error="Campo obligatorio"
        options={[{ value: "CRC", label: "Colones" }]}
      />,
    );

    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toHaveTextContent("Campo obligatorio");
    const select = screen.getByRole("combobox", { name: /moneda/i });
    expect(select).toHaveAttribute("aria-invalid", "true");
  });
});
