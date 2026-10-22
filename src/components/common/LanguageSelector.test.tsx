import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  LANGUAGE_STORAGE_KEY,
  changeLanguage,
} from "../../i18n";
import LanguageSelector from "./LanguageSelector";

describe("LanguageSelector Component", () => {
  beforeEach(async () => {
    localStorage.clear();
    await changeLanguage("es");
  });

  afterEach(async () => {
    localStorage.clear();
    await changeLanguage("es");
  });

  it("renderiza el selector accesible con opciones en texto y labels en español", () => {
    render(<LanguageSelector id="test-lang-selector" />);

    const select = screen.getByRole("combobox", {
      name: "Seleccionar idioma",
    });
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute("id", "test-lang-selector");
    expect(select).toHaveAttribute("title", "Cambiar idioma");

    expect(
      screen.getByRole("option", { name: "Español" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "English" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Português" }),
    ).toBeInTheDocument();
  });

  it("muestra español como opción seleccionada inicialmente", () => {
    render(<LanguageSelector id="test-lang-selector" />);

    const select = screen.getByRole("combobox", {
      name: "Seleccionar idioma",
    }) as HTMLSelectElement;

    expect(select.value).toBe("es");
  });

  it("permite cambiar a inglés y actualiza aria-label, title, label sr-only, almacenamiento y html lang", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector id="test-lang-selector" />);

    const select = screen.getByRole("combobox", {
      name: "Seleccionar idioma",
    });

    await user.selectOptions(select, "en");

    expect((select as HTMLSelectElement).value).toBe("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");

    // En inglés los textos accesibles se actualizan dinámicamente
    expect(select).toHaveAttribute("aria-label", "Select language");
    expect(select).toHaveAttribute("title", "Change language");
  });

  it("permite cambiar a portugués y actualiza aria-label a 'Selecionar idioma', title a 'Alterar idioma' y html lang a pt-BR", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector id="test-lang-selector" />);

    const select = screen.getByRole("combobox", {
      name: "Seleccionar idioma",
    });

    await user.selectOptions(select, "pt");

    expect((select as HTMLSelectElement).value).toBe("pt");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pt");
    expect(document.documentElement.lang).toBe("pt-BR");

    // En portugués los textos accesibles usan la ortografía propia
    expect(select).toHaveAttribute("aria-label", "Selecionar idioma");
    expect(select).toHaveAttribute("title", "Alterar idioma");
  });
});
