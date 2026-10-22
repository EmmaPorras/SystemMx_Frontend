import { getActiveLocale } from "../../i18n";
export { getActiveLocale };

export function formatCurrency(
  value: number,
  locale?: string,
  currency = "CRC",
): string {
  const targetLocale = locale ?? getActiveLocale();
  return new Intl.NumberFormat(targetLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  const targetLocale = locale ?? getActiveLocale();
  return new Intl.NumberFormat(targetLocale, options).format(value);
}

export function formatDate(
  value: string | number | Date,
  locale?: string,
): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);

  const targetLocale = locale ?? getActiveLocale();
  return new Intl.DateTimeFormat(targetLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(
  value: string | number | Date,
  locale?: string,
): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);

  const targetLocale = locale ?? getActiveLocale();
  return new Intl.DateTimeFormat(targetLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
