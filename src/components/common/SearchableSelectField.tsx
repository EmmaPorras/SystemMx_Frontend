import { useEffect, useMemo, useRef, useState } from "react";

type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
};

function SearchableSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccione una opción",
  required = false,
  error,
}: SearchableSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(term),
    );
  }, [options, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value);
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-2.5 text-left text-sm outline-none transition ${
          error
            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
        }`}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="text-slate-400">⌄</span>
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-slate-100 ${
                    option.value === value
                      ? "bg-slate-900 font-semibold text-white hover:bg-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-slate-500">
                No hay resultados.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export default SearchableSelectField;