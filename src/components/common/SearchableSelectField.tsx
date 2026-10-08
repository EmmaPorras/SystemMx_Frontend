import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  id?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

function SearchableSelectField({
  label,
  value,
  onChange,
  options,
  id: customId,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = "",
}: SearchableSelectFieldProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("common.selectOption");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const generatedId = useId();
  const selectId = customId || generatedId;
  const listboxId = `${selectId}-listbox`;
  const errorId = `${selectId}-error`;

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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value);
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
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

      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
          error
            ? "border-red-400 bg-red-50/50 text-zinc-900 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200"
            : "border-zinc-300 bg-white text-zinc-900 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-200"
        }`}
      >
        <span className={`truncate ${selectedOption ? "font-medium text-zinc-900" : "text-zinc-400"}`}>
          {selectedOption?.label ?? resolvedPlaceholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute z-40 mt-1.5 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-100 p-2">
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("common.searchPlaceholder")}
                aria-label={t("common.searchIn", { field: label })}
                className="w-full rounded-lg border border-zinc-200 py-1.5 pl-8 pr-3 text-sm outline-none focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-100"
              />
            </div>
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  role="option"
                  type="button"
                  aria-selected={option.value === value}
                  onClick={() => selectOption(option)}
                  className={`block w-full px-3.5 py-2 text-left text-sm transition ${
                    option.value === value
                      ? "bg-zinc-950 font-semibold text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-3.5 py-3 text-center text-xs text-zinc-500">
                {t("common.noOptionsFound")}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default SearchableSelectField;