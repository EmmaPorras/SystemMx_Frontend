import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

type InputFieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  id?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  prefix?: string;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autoComplete?: string;
  name?: string;
  className?: string;
};

function InputField({
  label,
  value,
  onChange,
  id: customId,
  type = "text",
  placeholder,
  required = false,
  error,
  helperText,
  maxLength,
  showCharacterCount = false,
  prefix,
  disabled = false,
  min,
  max,
  step,
  autoComplete,
  name,
  className = "",
}: InputFieldProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const countId = `${inputId}-count`;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

  const hasPrefix = Boolean(prefix);
  const stringValue = String(value ?? "");
  const valueLength = stringValue.length;

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
    showCharacterCount && maxLength ? countId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-semibold text-zinc-700"
      >
        {label}
        {required ? (
          <span className="ml-1 text-rose-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div className="relative">
        {hasPrefix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400"
          >
            {prefix}
          </span>
        ) : null}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          required={required}
          autoComplete={autoComplete}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border py-2 text-xs sm:text-sm outline-none shadow-2xs transition disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
            hasPrefix ? "pl-8 pr-3" : isPassword ? "pl-3 pr-10" : "px-3"
          } ${
            error
              ? "border-rose-300 bg-rose-50/40 text-zinc-900 focus-visible:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200"
              : "border-zinc-200/90 bg-white text-zinc-900 hover:border-zinc-300 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
          }`}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword
                ? t("auth.hidePassword", "Ocultar contraseña")
                : t("auth.showPassword", "Mostrar contraseña")
            }
            title={
              showPassword
                ? t("auth.hidePassword", "Ocultar contraseña")
                : t("auth.showPassword", "Mostrar contraseña")
            }
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-lg p-1 transition"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : null}
      </div>

      <div className="mt-1.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {error ? (
            <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-xs text-zinc-500">
              {helperText}
            </p>
          ) : null}
        </div>

        {showCharacterCount && maxLength ? (
          <p
            id={countId}
            aria-live="polite"
            className={`shrink-0 text-xs font-medium ${
              valueLength >= maxLength ? "text-red-500" : "text-zinc-400"
            }`}
          >
            {valueLength}/{maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default InputField;