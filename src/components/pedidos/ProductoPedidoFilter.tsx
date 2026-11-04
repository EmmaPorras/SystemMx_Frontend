import { useEffect, useMemo, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";

type ProductoPedidoFilterProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

function ProductoPedidoFilter({
  label,
  value,
  options,
  onChange,
  placeholder = "Buscar producto",
}: ProductoPedidoFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const term = value.trim().toLowerCase();

    if (!term) {
      return options.slice(0, 8);
    }

    return options
      .filter((option) => option.toLowerCase().includes(term))
      .slice(0, 8);
  }, [options, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function seleccionarProducto(producto: string) {
    onChange(producto);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-xs font-semibold text-zinc-700">
        {label}
      </label>

      <div className="relative">
        <LuSearch
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />

        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-zinc-200/90 bg-white py-2 pl-9 pr-9 text-xs sm:text-sm text-zinc-900 shadow-2xs outline-none transition hover:border-zinc-300 placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Limpiar filtro de producto"
          >
            <IoClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && filteredOptions.length > 0 ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/10">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => seleccionarProducto(option)}
              className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-800"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {isOpen && value.trim() && filteredOptions.length === 0 ? (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-lg">
          No hay productos registrados que coincidan.
        </div>
      ) : null}
    </div>
  );
}

export default ProductoPedidoFilter;
