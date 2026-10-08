import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

export const LANGUAGE_STORAGE_KEY = "systemmx-language";

export type SupportedLanguage = "es" | "en" | "pt";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  locale: string;
  htmlLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "es",
    name: "Español",
    locale: "es-CR",
    htmlLang: "es",
  },
  {
    code: "en",
    name: "English",
    locale: "en-US",
    htmlLang: "en",
  },
  {
    code: "pt",
    name: "Português",
    locale: "pt-BR",
    htmlLang: "pt-BR",
  },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "es";

const LANGUAGE_MAP: Record<SupportedLanguage, LanguageOption> = {
  es: SUPPORTED_LANGUAGES[0],
  en: SUPPORTED_LANGUAGES[1],
  pt: SUPPORTED_LANGUAGES[2],
};

export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    (value === "es" || value === "en" || value === "pt")
  );
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_LANGUAGE;
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) {
      return stored;
    }
  } catch {
    // Entornos con almacenamiento restringido
  }

  return DEFAULT_LANGUAGE;
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Entornos con almacenamiento restringido
  }
}

export function getLocaleForLanguage(lang?: string | null): string {
  if (isSupportedLanguage(lang)) {
    return LANGUAGE_MAP[lang].locale;
  }
  return LANGUAGE_MAP[DEFAULT_LANGUAGE].locale;
}

export function getHtmlLangForLanguage(lang?: string | null): string {
  if (isSupportedLanguage(lang)) {
    return LANGUAGE_MAP[lang].htmlLang;
  }
  return LANGUAGE_MAP[DEFAULT_LANGUAGE].htmlLang;
}

export function syncDocumentLang(lang?: string | null): void {
  if (typeof document === "undefined" || !document.documentElement) {
    return;
  }

  const htmlLang = getHtmlLangForLanguage(lang ?? i18n.language);
  document.documentElement.lang = htmlLang;
}

export function getUserWayLanguage(lang?: string | null): string {
  if (lang === "en") {
    return "en-US";
  }
  if (lang === "pt") {
    return "pt-BR";
  }
  return "es";
}

export function syncUserWayLanguage(lang?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const userWayCode = getUserWayLanguage(lang ?? i18n.language);

  type UserWayInstance = {
    changeWidgetLanguage?: (code: string) => void;
  };

  const userWayApi = window as unknown as {
    UserWay?: UserWayInstance;
    userway?: UserWayInstance;
  };

  const changeWidgetLanguage =
    userWayApi.UserWay?.changeWidgetLanguage ??
    userWayApi.userway?.changeWidgetLanguage;

  if (typeof changeWidgetLanguage === "function") {
    try {
      changeWidgetLanguage(userWayCode);
    } catch {
      // Ignorar de forma segura si el widget de UserWay aún se está cargando
    }
  }
}

export function getActiveLocale(): string {
  const currentLang = i18n.language || getStoredLanguage();
  return getLocaleForLanguage(currentLang);
}

export async function changeLanguage(
  lang: SupportedLanguage,
): Promise<void> {
  setStoredLanguage(lang);
  syncDocumentLang(lang);
  syncUserWayLanguage(lang);
  await i18n.changeLanguage(lang);
}

const initialLanguage = getStoredLanguage();

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
    },
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

syncDocumentLang(initialLanguage);
syncUserWayLanguage(initialLanguage);

i18n.on("languageChanged", (lng: string) => {
  if (isSupportedLanguage(lng)) {
    setStoredLanguage(lng);
    syncDocumentLang(lng);
    syncUserWayLanguage(lng);
  }
});

export default i18n;
