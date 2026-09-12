import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PaginationControlsProps = {
  pagina: number;
  totalPaginas: number;
  total: number;
  limite: number;
  onPageChange: (pagina: number) => void;
};

function PaginationControls({
  pagina,
  totalPaginas,
  total,
  limite,
  onPageChange,
}: PaginationControlsProps) {
  const paginas =
    totalPaginas > 0
      ? totalPaginas
      : 1;

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">
        {total === 0
          ? "Sin registros"
          : `${total} registro${total === 1 ? "" : "s"} · ${limite} por página`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina <= 1}
          onClick={() =>
            onPageChange(pagina - 1)
          }
          className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="min-w-28 text-center text-sm font-semibold text-zinc-700">
          Página {pagina} de {paginas}
        </div>

        <button
          type="button"
          aria-label="Página siguiente"
          disabled={
            totalPaginas === 0 ||
            pagina >= totalPaginas
          }
          onClick={() =>
            onPageChange(pagina + 1)
          }
          className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
