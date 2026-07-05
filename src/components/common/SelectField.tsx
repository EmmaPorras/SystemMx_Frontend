type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  placeholder?: string;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition ${
          error
            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
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
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export default SelectField;