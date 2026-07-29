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
      <label className="mb-2 block text-sm font-semibold text-zinc-800">
        {label}
      </label>

      <div className="relative">
        <LuSearch
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
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
          className="h-12 w-full rounded-xl border border-zinc-300 bg-white pl-11 pr-11 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Limpiar filtro de producto"
          >
            <IoClose className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {isOpen && filteredOptions.length > 0 ? (
        <div className="absolute z-40 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/10">
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
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-lg">
          No hay productos registrados que coincidan.
        </div>
      ) : null}
    </div>
  );
}

export default ProductoPedidoFilter;
