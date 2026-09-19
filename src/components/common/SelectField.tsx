import { useId } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  id: customId,
  required = false,
  disabled = false,
  error,
  placeholder,
  className = "",
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={selectId}
        className="mb-1.5 block text-sm font-semibold text-zinc-700"
      >
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
          error
            ? "border-red-400 bg-red-50/50 text-zinc-900 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200"
            : "border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-200"
        }`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default SelectField;