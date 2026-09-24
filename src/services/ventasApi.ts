import { apiClient } from "../api/apiClient";

import type { QueryParams } from "../api/api.types";

import type {
  CrearVentaPayload,
  InventarioDisponibleVenta,
  PagoVenta,
  RegistrarPagoVentaPayload,
  Venta,
  VentasQuery,
} from "../components/ventas/ventas.types";

export function obtenerVentasApi(
  query: VentasQuery = {},
): Promise<Venta[]> {
  return apiClient.get<Venta[]>(
    "/ventas",
    query as unknown as QueryParams,
  );
}

export function obtenerSiguienteNumeroVentaApi(): Promise<{
  numeroVenta: number;
}> {
  return apiClient.get<{ numeroVenta: number }>(
    "/ventas/siguiente-numero",
  );
}

export function obtenerVentaApi(
  id: number,
): Promise<Venta> {
  return apiClient.get<Venta>(
    `/ventas/${id}`,
  );
}

export function obtenerInventarioDisponibleVentaApi(): Promise<
  InventarioDisponibleVenta[]
> {
  return apiClient.get<
    InventarioDisponibleVenta[]
  >(
    "/ventas/inventario-disponible",
  );
}

export function crearVentaApi(
  payload: CrearVentaPayload,
): Promise<Venta> {
  return apiClient.post<
    Venta,
    CrearVentaPayload
  >(
    "/ventas",
    payload,
  );
}

export function obtenerPagosVentaApi(
  id: number,
): Promise<PagoVenta[]> {
  return apiClient.get<PagoVenta[]>(
    `/ventas/${id}/pagos`,
  );
}

export function registrarPagoVentaApi(
  id: number,
  payload: RegistrarPagoVentaPayload,
): Promise<Venta> {
  return apiClient.post<
    Venta,
    RegistrarPagoVentaPayload
  >(
    `/ventas/${id}/pagos`,
    payload,
  );
}

export function enviarVentaPapeleraApi(
  id: number,
): Promise<Venta> {
  return apiClient.patch<
    Venta,
    Record<string, never>
  >(
    `/ventas/${id}/papelera`,
    {},
  );
}

export function restaurarVentaApi(
  id: number,
): Promise<Venta> {
  return apiClient.patch<
    Venta,
    Record<string, never>
  >(
    `/ventas/${id}/restaurar`,
    {},
  );
}

export function anularVentaApi(
  id: number,
): Promise<Venta> {
  return apiClient.patch<
    Venta,
    Record<string, never>
  >(
    `/ventas/${id}/anular`,
    {},
  );
}
