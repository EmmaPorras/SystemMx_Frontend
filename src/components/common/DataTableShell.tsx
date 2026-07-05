import type { ReactNode } from "react";

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
  actions?: (row: T, rowIndex: number) => ReactNode;
  actionsHeader?: string;
  getRowKey?: (row: T, rowIndex: number) => string | number;
};

function DataTableShell<T>({
  data,
  columns,
  emptyMessage = "No hay datos para mostrar.",
  actions,
  actionsHeader = "Acciones",
  getRowKey,
}: DataTableShellProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${
                    column.headerClassName ?? ""
                  }`}
                >
                  {column.header}
                </th>
              ))}

              {actions ? (
                <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  {actionsHeader}
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => {
              const rowKey = getRowKey
                ? getRowKey(row, rowIndex)
                : rowIndex;

              return (
                <tr
                  key={rowKey}
                  className="transition hover:bg-slate-50/80"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 align-middle text-slate-700 ${
                        column.className ?? ""
                      }`}
                    >
                      {column.render(row, rowIndex)}
                    </td>
                  ))}

                  {actions ? (
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}

export default DataTableShell;