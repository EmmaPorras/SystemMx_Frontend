import { useTranslation } from "react-i18next";

import DataTableShell from "../common/DataTableShell";
import SectionCard from "../common/SectionCard";
import { formatNumber } from "../common/formatters";
import i18n from "../../i18n";

type ReportRow =
  Record<string, unknown>;

type ReportResultViewProps = {
  data: unknown;
};

function isRecord(
  value: unknown,
): value is ReportRow {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function humanize(
  value: string,
): string {
  return value
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(/_/g, " ")
    .replace(/^./, (char) =>
      char.toUpperCase(),
    );
}

function formatValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? i18n.t("common.yes") : i18n.t("common.no");
  }

  if (typeof value === "number") {
    return formatNumber(value, { maximumFractionDigits: 2 });
  }

  if (typeof value === "string") {
    return value || "—";
  }

  if (Array.isArray(value)) {
    return i18n.t("reportExport.recordsCount", { count: value.length });
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(
        ([key, nested]) =>
          `${humanize(key)}: ${formatValue(
            nested,
          )}`,
      )
      .join(" · ");
  }

  return String(value);
}

function ArrayResult({
  value,
}: {
  value: unknown[];
}) {
  const { t } = useTranslation();

  const rows: ReportRow[] =
    value.map((item, index) =>
      isRecord(item)
        ? item
        : {
            indice: index + 1,
            valor: item,
          },
    );

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
        {t("reports.emptyReport")}
      </div>
    );
  }

  const keys = Array.from(
    new Set(
      rows.flatMap((row) =>
        Object.keys(row),
      ),
    ),
  );

  return (
    <DataTableShell
      data={rows}
      emptyMessage={t("common.noData")}
      getRowKey={(row) => {
        const idEntry =
          Object.entries(row).find(
            ([key]) =>
              key.startsWith("id"),
          );

        return idEntry
          ? String(idEntry[1])
          : JSON.stringify(row);
      }}
      columns={keys.map((key) => ({
        key,
        header: humanize(key),
        render: (row: ReportRow) =>
          formatValue(
            row[key],
          ),
      }))}
    />
  );
}

function ObjectResult({
  value,
}: {
  value: ReportRow;
}) {
  const primitives =
    Object.entries(value).filter(
      ([, nested]) =>
        !Array.isArray(nested) &&
        !isRecord(nested),
    );

  const nested =
    Object.entries(value).filter(
      ([, item]) =>
        Array.isArray(item) ||
        isRecord(item),
    );

  return (
    <div className="space-y-5">
      {primitives.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {primitives.map(
            ([key, nestedValue]) => (
              <div
                key={key}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {humanize(key)}
                </p>

                <p className="mt-1 break-words text-sm font-bold text-zinc-950">
                  {formatValue(
                    nestedValue,
                  )}
                </p>
              </div>
            ),
          )}
        </div>
      ) : null}

      {nested.map(
        ([key, nestedValue]) => (
          <SectionCard
            key={key}
            title={humanize(key)}
          >
            <ReportResultView
              data={nestedValue}
            />
          </SectionCard>
        ),
      )}
    </div>
  );
}

function ReportResultView({
  data,
}: ReportResultViewProps) {
  const { t } = useTranslation();

  if (
    data === null ||
    data === undefined
  ) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        {t("reports.noInfoAvailable")}
      </p>
    );
  }

  if (Array.isArray(data)) {
    return (
      <ArrayResult value={data} />
    );
  }

  if (isRecord(data)) {
    return (
      <ObjectResult value={data} />
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      {formatValue(data)}
    </div>
  );
}

export default ReportResultView;
