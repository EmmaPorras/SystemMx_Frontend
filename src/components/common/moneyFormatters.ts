/**
 * Helper functions for money input formatting and raw numerical conversion.
 */

export function formatDisplayMoney(
  val: string | number,
  allowDecimals = true,
): string {
  const str = String(val ?? "").trim();
  if (!str) return "";

  const isNegative = str.startsWith("-");
  const clean = str.replace(/[^0-9.]/g, "");
  if (!clean) return isNegative ? "-" : "";

  const parts = clean.split(".");
  const integerDigits = parts[0];
  const integerPart = integerDigits
    ? integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : "0";

  if (allowDecimals && parts.length > 1) {
    return `${isNegative ? "-" : ""}${integerPart}.${parts.slice(1).join("")}`;
  }

  return `${isNegative ? "-" : ""}${integerPart}`;
}

export function cleanRawMoney(
  displayVal: string,
  maxDecimals = 2,
): string {
  if (!displayVal) return "";

  const isNegative = displayVal.trim().startsWith("-");
  const clean = displayVal.replace(/\s/g, "").replace(",", ".");
  const parts = clean.split(".");

  if (parts.length > 1) {
    const intPart = parts[0].replace(/\D/g, "");
    const decPart = parts
      .slice(1)
      .join("")
      .replace(/\D/g, "")
      .slice(0, maxDecimals);

    const result = `${intPart}.${decPart}`;
    return isNegative ? `-${result}` : result;
  }

  const intPart = parts[0].replace(/\D/g, "");
  return isNegative && intPart ? `-${intPart}` : intPart;
}

export function formatMoneyWithSymbol(
  amount: number | string,
  currency = "CRC",
): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(num)) return "₡ 0";

  const symbols: Record<string, string> = {
    CRC: "₡",
    USD: "$",
    EUR: "€",
    COP: "COP",
    BRL: "R$",
  };

  const symbol = symbols[currency.toUpperCase()] ?? currency;
  const formatted = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: currency === "CRC" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${symbol} ${formatted}`;
}
