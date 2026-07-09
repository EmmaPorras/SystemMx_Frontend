type InputFieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number | string;
  helperText?: string;
  showCharacterCount?: boolean;
  prefix?: string;
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error,
  maxLength,
  min,
  max,
  step,
  helperText,
  showCharacterCount = false,
  prefix,
}: InputFieldProps) {
  const stringValue = String(value ?? "");

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-center text-sm font-bold text-slate-500">
            {prefix}
          </span>
        ) : null}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={type === "number" ? undefined : maxLength}
          min={min}
          max={max}
          step={step}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-2xl border py-2.5 pr-4 text-sm outline-none transition ${
            prefix ? "pl-16" : "px-4"
          } ${
            error
              ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
          }`}
        />
      </div>

      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          {error ? (
            <p className="text-xs font-medium text-red-600">{error}</p>
          ) : helperText ? (
            <p className="text-xs text-slate-500">{helperText}</p>
          ) : null}
        </div>

        {showCharacterCount && maxLength && type !== "number" ? (
          <p
            className={`shrink-0 text-xs ${
              stringValue.length >= maxLength ? "text-red-500" : "text-slate-400"
            }`}
          >
            {stringValue.length}/{maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default InputField;