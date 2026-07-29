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
      <div
        className="
          flex
          min-h-[190px]
          flex-col
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-zinc-300
          bg-zinc-50
          px-6
          py-10
          text-center
        "
      >
        <div
          aria-hidden="true"
          className="
            mb-4
            grid
            h-12
            w-12
            place-items-center
            rounded-2xl
            border
            border-zinc-200
            bg-white
            shadow-sm
          "
        >
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>

        <p className="text-sm font-semibold text-zinc-700">
          {emptyMessage}
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          Los registros aparecerán aquí cuando estén disponibles.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        shadow-sm
      "
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-zinc-950">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`
                    whitespace-nowrap
                    border-b
                    border-zinc-800
                    px-5
                    py-4
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-zinc-300
                    ${column.headerClassName ?? ""}
                  `}
                >
                  {column.header}
                </th>
              ))}

              {actions ? (
                <th
                  scope="col"
                  className="
                    whitespace-nowrap
                    border-b
                    border-zinc-800
                    px-5
                    py-4
                    text-center
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-zinc-300
                  "
                >
                  {actionsHeader}
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
                  className="
                    group
                    bg-white
                    transition-colors
                    duration-200
                    hover:bg-zinc-50
                  "
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                        px-5
                        py-4
                        align-middle
                        text-zinc-700
                        transition-colors
                        duration-200
                        first:font-medium
                        first:text-zinc-950
                        ${column.className ?? ""}
                      `}
                    >
                      {column.render(row, rowIndex)}
                    </td>
                  ))}

                  {actions ? (
                    <td className="whitespace-nowrap px-5 py-4 align-middle">
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

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-zinc-100
          bg-zinc-50/70
          px-5
          py-3
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-zinc-400
          "
        >
          Registros mostrados
        </p>

        <span
          className="
            inline-flex
            min-w-8
            items-center
            justify-center
            rounded-full
            border
            border-zinc-200
            bg-white
            px-2.5
            py-1
            text-xs
            font-bold
            text-zinc-700
            shadow-sm
          "
        >
          {data.length}
        </span>
      </div>
    </div>
  );
}

export default DataTableShell;