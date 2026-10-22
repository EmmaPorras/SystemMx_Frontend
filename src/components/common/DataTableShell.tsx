import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import EmptyState from "./EmptyState";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T, rowIndex: number) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableShellProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  emptyDescription?: string;
  actions?: (row: T, rowIndex: number) => ReactNode;
  actionsHeader?: string;
  getRowKey?: (row: T, rowIndex: number) => string | number;
  tableName?: string;
};

function DataTableShell<T>({
  data,
  columns,
  emptyMessage,
  emptyDescription,
  actions,
  actionsHeader,
  getRowKey,
  tableName,
}: DataTableShellProps<T>) {
  const { t } = useTranslation();

  const resolvedEmptyMessage =
    emptyMessage ?? t("dataTable.noData");

  const resolvedEmptyDescription =
    emptyDescription ?? t("dataTable.emptySubtitle");

  const resolvedActionsHeader =
    actionsHeader ?? t("dataTable.actions");

  if (data.length === 0) {
    return (
      <EmptyState
        title={resolvedEmptyMessage}
        description={resolvedEmptyDescription}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse text-left text-xs sm:text-[13px]"
          aria-label={tableName}
        >
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90 text-zinc-600">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-zinc-500 sm:px-5 sm:py-3.5 ${
                    column.headerClassName ?? ""
                  }`}
                >
                  {column.header}
                </th>
              ))}

              {actions ? (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-center text-[10.5px] font-bold uppercase tracking-[0.08em] text-zinc-500 sm:px-5 sm:py-3.5"
                >
                  {resolvedActionsHeader}
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {data.map((row, rowIndex) => {
              const rowKey = getRowKey
                ? getRowKey(row, rowIndex)
                : rowIndex;

              return (
                <tr
                  key={rowKey}
                  className="group bg-white transition-colors duration-150 hover:bg-slate-50/80"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-2.5 align-middle text-zinc-700 transition-colors duration-150 sm:px-5 sm:py-3 first:font-medium first:text-zinc-950 ${
                        column.className ?? ""
                      }`}
                    >
                      {column.render(row, rowIndex)}
                    </td>
                  ))}

                  {actions ? (
                    <td className="whitespace-nowrap px-4 py-2.5 align-middle sm:px-5 sm:py-3">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {actions(row, rowIndex)}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-zinc-100 bg-zinc-50/60 px-4 py-2.5 sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">
          {t("dataTable.showingRecords")}
        </p>

        <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-zinc-200/80 bg-white px-2 py-0.5 text-[11px] font-bold text-zinc-700 shadow-2xs">
          {data.length}
        </span>
      </div>
    </div>
  );
}

export default DataTableShell;