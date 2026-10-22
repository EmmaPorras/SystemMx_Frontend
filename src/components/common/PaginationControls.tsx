import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const paginas = totalPaginas > 0 ? totalPaginas : 1;

  const recordsText =
    total === 0
      ? t("pagination.noRecords")
      : `${t("pagination.recordsCount", { count: total })} · ${t("pagination.perPage", { count: limite })}`;

  return (
    <nav
      aria-label={t("pagination.label")}
      className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs sm:text-sm text-zinc-500">{recordsText}</p>

      <div className="flex items-center justify-between sm:justify-end gap-2">
        <button
          type="button"
          aria-label={t("pagination.previousPage")}
          title={t("pagination.previousPage")}
          disabled={pagina <= 1}
          onClick={() => onPageChange(pagina - 1)}
          className="grid h-8.5 w-8.5 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-2xs transition hover:border-zinc-950 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        <div
          aria-current="page"
          className="min-w-24 text-center text-xs font-semibold text-zinc-700"
        >
          {t("pagination.pageOf", { current: pagina, total: paginas })}
        </div>

        <button
          type="button"
          aria-label={t("pagination.nextPage")}
          title={t("pagination.nextPage")}
          disabled={totalPaginas === 0 || pagina >= totalPaginas}
          onClick={() => onPageChange(pagina + 1)}
          className="grid h-8.5 w-8.5 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-2xs transition hover:border-zinc-950 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default PaginationControls;
