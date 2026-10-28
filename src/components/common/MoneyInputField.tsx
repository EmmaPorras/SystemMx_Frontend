import { useId, useState, useEffect, type ChangeEvent } from "react";
import { formatDisplayMoney, cleanRawMoney } from "./moneyFormatters";

type MoneyInputFieldProps = {
  label: string;
  value: string | number;
  onChange: (rawValue: string) => void;
  prefix?: string;
  currencySymbol?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  maxDigits?: number;
  allowDecimals?: boolean;
  maxDecimals?: number;
  className?: string;
  id?: string;
  name?: string;
};

function MoneyInputField({
  label,
  value,
  onChange,
  prefix,
  currencySymbol = "₡",
  placeholder = "0",
  required = false,
  disabled = false,
  error,
  helperText,
  maxDigits = 12,
  allowDecimals = true,
  maxDecimals = 2,
  className = "",
  id: customId,
  name,
}: MoneyInputFieldProps) {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const effectivePrefix = prefix ?? currencySymbol;

  // Convert incoming value to display string
  const rawString = String(value ?? "");
  const [displayValue, setDisplayValue] = useState(() =>
    formatDisplayMoney(rawString, allowDecimals),
  );

  useEffect(() => {
    setDisplayValue(formatDisplayMoney(rawString, allowDecimals));
  }, [rawString, allowDecimals]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const incomingText = event.target.value;
    const raw = cleanRawMoney(incomingText, maxDecimals);

    // Limit maximum integer digits
    const parts = raw.split(".");
    if (parts[0].length > maxDigits) {
      return;
    }

    setDisplayValue(formatDisplayMoney(raw, allowDecimals));
    onChange(raw);
  }

  return (
    <div className={className}>
      {label ? (
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
      ) : null}

      <div className="relative">
        {effectivePrefix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400"
          >
            {effectivePrefix}
          </span>
        ) : null}

        <input
          id={inputId}
          name={name}
          type="text"
          inputMode={allowDecimals ? "decimal" : "numeric"}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full rounded-xl border py-2 text-xs sm:text-sm outline-none shadow-2xs transition disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
            effectivePrefix ? "pl-8 pr-3" : "px-3"
          } ${
            error
              ? "border-rose-300 bg-rose-50/40 text-zinc-900 focus-visible:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200"
              : "border-zinc-200/90 bg-white text-zinc-900 hover:border-zinc-300 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
          }`}
        />
      </div>

      {error || helperText ? (
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {error ? (
              <p id={errorId} role="alert" className="text-xs font-medium text-red-800">
                {error}
              </p>
            ) : helperText ? (
              <p id={helperId} className="text-xs text-zinc-600">
                {helperText}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MoneyInputField;
