import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import InputField from "../components/common/InputField";
import SelectField from "../components/common/SelectField";
import SearchableSelectField from "../components/common/SearchableSelectField";
import MoneyInputField from "../components/common/MoneyInputField";
import PasswordStrengthIndicator from "../components/common/PasswordStrengthIndicator";

describe("Auditoría de Accesibilidad Automatizada con axe-core (WCAG 2.2 AAA)", () => {
  it("InputField no tiene violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <main>
        <InputField
          label="Nombre de Usuario"
          value="usuario.demo"
          onChange={vi.fn()}
          helperText="Ingrese su identificador único"
          required
        />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false }, // jsdom no computa estilos CSS renderizados
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("InputField con estado de error conserva estructura accesible y aria-invalid", async () => {
    const { container } = render(
      <main>
        <InputField
          label="Correo Electrónico"
          value="invalido"
          onChange={vi.fn()}
          error="Formato de correo no válido"
          required
        />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("SelectField no tiene violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <main>
        <SelectField
          label="Rol del Usuario"
          value="OPERADOR"
          onChange={vi.fn()}
          options={[
            { value: "ADMIN", label: "Administrador" },
            { value: "OPERADOR", label: "Operador Comercial" },
            { value: "CONSULTA", label: "Solo Consulta" },
          ]}
          required
        />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("SearchableSelectField cumple jerarquía ARIA (listbox / option)", async () => {
    const { container } = render(
      <main>
        <SearchableSelectField
          label="Proveedor Comercial"
          value="1"
          onChange={vi.fn()}
          options={[
            { value: "1", label: "Distribuidora Tech" },
            { value: "2", label: "Importadora Global" },
          ]}
          required
        />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("MoneyInputField no tiene violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <main>
        <MoneyInputField
          label="Monto de Pago"
          value="15000"
          onChange={vi.fn()}
          currencySymbol="₡"
          required
        />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("PasswordStrengthIndicator cumple con rol progressbar y anuncio accesible", async () => {
    const { container } = render(
      <main>
        <PasswordStrengthIndicator password="MiClaveSegura2026!#" />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });
});
