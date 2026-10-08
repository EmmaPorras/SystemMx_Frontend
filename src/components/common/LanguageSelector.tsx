import { type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  changeLanguage,
  isSupportedLanguage,
} from "../../i18n";

export interface LanguageSelectorProps {
  id?: string;
  className?: string;
}

export function LanguageSelector({
  id = "language-selector",
  className = "",
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();

  const currentLang: SupportedLanguage = isSupportedLanguage(i18n.language)
    ? i18n.language
    : "es";

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLang = event.target.value;
    if (isSupportedLanguage(nextLang)) {
      void changeLanguage(nextLang);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      role="group"
      aria-label={t("language.selectLanguage", {
        defaultValue: "Seleccionar idioma",
      })}
    >
      <label htmlFor={id} className="sr-only">
        {t("language.label", { defaultValue: "Idioma" })}
      </label>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
      >
        <Globe size={16} />
      </span>

      <select
        id={id}
        value={currentLang}
        onChange={handleChange}
        aria-label={t("language.selectLanguage", {
          defaultValue: "Seleccionar idioma",
        })}
        title={t("language.changeLanguage", {
          defaultValue: "Cambiar idioma",
        })}
        className="
          h-9
          cursor-pointer
          appearance-none
          rounded-xl
          border
          border-zinc-200
          bg-white
          pl-9
          pr-8
          text-xs
          font-semibold
          text-zinc-700
          transition
          hover:border-zinc-300
          hover:bg-zinc-50
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-zinc-950
        "
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 flex items-center text-zinc-400"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </div>
  );
}

export default LanguageSelector;
