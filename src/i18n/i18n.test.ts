import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import i18n, {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  changeLanguage,
  getActiveLocale,
  getHtmlLangForLanguage,
  getLocaleForLanguage,
  getStoredLanguage,
  getUserWayLanguage,
  isSupportedLanguage,
  setStoredLanguage,
  syncDocumentLang,
  syncUserWayLanguage,
} from "./index";

describe("i18n Infrastructure", () => {
  beforeEach(async () => {
    localStorage.clear();
    await changeLanguage("es");
  });

  afterEach(async () => {
    localStorage.clear();
    await changeLanguage("es");
  });

  it("1. tiene español como idioma predeterminado", () => {
    expect(DEFAULT_LANGUAGE).toBe("es");
    expect(i18n.language).toBe("es");
    expect(document.documentElement.lang).toBe("es");
  });

  it("2. valida y reconoce correctamente idiomas soportados", () => {
    expect(isSupportedLanguage("es")).toBe(true);
    expect(isSupportedLanguage("en")).toBe(true);
    expect(isSupportedLanguage("pt")).toBe(true);
    expect(isSupportedLanguage("fr")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });

  it("3. lee idioma válido desde localStorage", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    expect(getStoredLanguage()).toBe("en");

    localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt");
    expect(getStoredLanguage()).toBe("pt");
  });

  it("4. aplica fallback a español ante valor inexistente o inválido en localStorage", () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    expect(getStoredLanguage()).toBe("es");

    localStorage.setItem(LANGUAGE_STORAGE_KEY, "aleman");
    expect(getStoredLanguage()).toBe("es");

    localStorage.setItem(LANGUAGE_STORAGE_KEY, "");
    expect(getStoredLanguage()).toBe("es");
  });

  it("5. cambia a inglés, persiste en localStorage y sincroniza document.documentElement.lang con 'en'", async () => {
    await changeLanguage("en");

    expect(i18n.language).toBe("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(getActiveLocale()).toBe("en-US");
  });

  it("6. cambia a portugués, persiste en localStorage y sincroniza document.documentElement.lang con 'pt-BR'", async () => {
    await changeLanguage("pt");

    expect(i18n.language).toBe("pt");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pt");
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(getActiveLocale()).toBe("pt-BR");
  });

  it("7. mapea idiomas a sus locales y htmlLang respectivos", () => {
    expect(getLocaleForLanguage("es")).toBe("es-CR");
    expect(getLocaleForLanguage("en")).toBe("en-US");
    expect(getLocaleForLanguage("pt")).toBe("pt-BR");
    expect(getLocaleForLanguage("desconocido")).toBe("es-CR");

    expect(getHtmlLangForLanguage("es")).toBe("es");
    expect(getHtmlLangForLanguage("en")).toBe("en");
    expect(getHtmlLangForLanguage("pt")).toBe("pt-BR");
    expect(getHtmlLangForLanguage("desconocido")).toBe("es");
  });

  it("8. sincroniza el atributo lang del documento con syncDocumentLang", () => {
    syncDocumentLang("es");
    expect(document.documentElement.lang).toBe("es");

    syncDocumentLang("en");
    expect(document.documentElement.lang).toBe("en");

    syncDocumentLang("pt");
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("9. setStoredLanguage guarda el valor en localStorage de forma segura", () => {
    setStoredLanguage("pt");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pt");

    setStoredLanguage("es");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("es");
  });

  it("10. mapea correctamente el idioma a los códigos de UserWay (es -> es, en -> en-US, pt -> pt-BR)", () => {
    expect(getUserWayLanguage("es")).toBe("es");
    expect(getUserWayLanguage("en")).toBe("en-US");
    expect(getUserWayLanguage("pt")).toBe("pt-BR");
    expect(getUserWayLanguage(null)).toBe("es");
  });

  it("11. syncUserWayLanguage invoca changeWidgetLanguage de UserWay si la API está disponible", () => {
    const changeWidgetLanguageMock = vi.fn();
    (window as unknown as { UserWay: { changeWidgetLanguage: typeof changeWidgetLanguageMock } }).UserWay = {
      changeWidgetLanguage: changeWidgetLanguageMock,
    };

    syncUserWayLanguage("en");
    expect(changeWidgetLanguageMock).toHaveBeenCalledWith("en-US");

    syncUserWayLanguage("pt");
    expect(changeWidgetLanguageMock).toHaveBeenCalledWith("pt-BR");

    syncUserWayLanguage("es");
    expect(changeWidgetLanguageMock).toHaveBeenCalledWith("es");

    delete (window as unknown as { UserWay?: unknown }).UserWay;
  });
});
