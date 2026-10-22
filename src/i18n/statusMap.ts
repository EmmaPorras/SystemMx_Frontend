import type { TFunction } from "i18next";
import i18n from "./index";

export type StatusDomain =
  | "orders"
  | "lots"
  | "sales"
  | "saleStatus"
  | "paymentStatus"
  | "movements"
  | "paymentMethods"
  | "roles";

export function translateStatus(
  domain: StatusDomain,
  code: string | undefined | null,
  t: TFunction = i18n.t,
): string {
  if (!code) return "";
  const upper = code.toUpperCase();
  const key = `statuses.${domain}.${upper}`;
  if (domain === "saleStatus" || domain === "paymentStatus") {
    return t(key, t(`statuses.sales.${upper}`, code));
  }
  return t(key, code);
}

/**
 * Maps internal order statuses (REGISTRADO, EN_TRANSITO, RECIBIDO, CANCELADO)
 * to translated presentation labels.
 * Always falls back safely to the raw status if an unknown code arrives.
 */
export function getOrderStatusLabel(t: TFunction, status: string | undefined | null): string {
  if (!status) return "";
  const key = `statuses.orders.${status.toUpperCase()}`;
  return t(key, status);
}

export function getLotStatusLabel(t: TFunction, status: string | undefined | null): string {
  if (!status) return "";
  const key = `statuses.lots.${status.toUpperCase()}`;
  return t(key, status);
}

export function getSaleStatusLabel(t: TFunction, status: string | undefined | null): string {
  if (!status) return "";
  const upper = status.toUpperCase();
  return t(`statuses.saleStatus.${upper}`, t(`statuses.sales.${upper}`, status));
}

export function getPaymentStatusLabel(t: TFunction, status: string | undefined | null): string {
  if (!status) return "";
  const upper = status.toUpperCase();
  return t(`statuses.paymentStatus.${upper}`, t(`statuses.sales.${upper}`, status));
}

export function getPaymentMethodLabel(t: TFunction, method: string | undefined | null): string {
  if (!method) return "";
  const key = `statuses.paymentMethods.${method.toUpperCase()}`;
  return t(key, method);
}

export function getMovementTypeLabel(t: TFunction, type: string | undefined | null): string {
  if (!type) return "";
  const key = `statuses.movements.${type.toUpperCase()}`;
  return t(key, type);
}

export function getCatalogStatusLabel(t: TFunction, status: string | boolean | undefined | null): string {
  if (typeof status === "boolean") {
    return status ? t("statuses.active", "Activo") : t("statuses.inactive", "Inactivo");
  }
  if (!status) return "";
  const upper = status.toUpperCase();
  if (upper === "ACTIVO" || upper === "ACTIVA") return t("statuses.active", "Activo");
  if (upper === "INACTIVO" || upper === "INACTIVA") return t("statuses.inactive", "Inactivo");
  return status;
}

export function getUserRoleLabel(t: TFunction, role: string | undefined | null): string {
  if (!role) return "";
  const key = `statuses.roles.${role.toUpperCase()}`;
  return t(key, role);
}

