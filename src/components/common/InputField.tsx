type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  prefix?: string;
  disabled?: boolean;
};

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  error,
  helperText,
  maxLength,
  showCharacterCount = false,
  prefix,
  disabled = false,
}: InputFieldProps) {
  const hasPrefix = Boolean(prefix);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      <div className="relative">
        {hasPrefix ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
            {prefix}
          </span>
        ) : null}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-2xl border py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
            hasPrefix ? "pl-10 pr-4" : "px-4"
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

        {showCharacterCount && maxLength ? (
          <p
            className={`shrink-0 text-xs ${
              value.length >= maxLength ? "text-red-500" : "text-slate-400"
            }`}
          >
            {value.length}/{maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default InputField;