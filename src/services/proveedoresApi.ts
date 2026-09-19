import { apiClient } from "../api/apiClient";

import type {
  EstadoProveedor,
  MonedaPreferida,
  Proveedor,
} from "../components/proveedores/proveedores.types";

type ProveedorBackend = {
  idOrigenCompra: number;
  tipoOrigen: string;
  nombreReferencia: string;
  contacto?: string | null;
  observaciones?: string | null;
  pais?: string | null;
  monedaPreferida?: MonedaPreferida | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  estado?: EstadoProveedor | null;
};

function normalizarMonedaPreferida(
  moneda: string | null | undefined,
): MonedaPreferida {
  if (
    moneda === "CRC" ||
    moneda === "USD" ||
    moneda === "EUR" ||
    moneda === "COP" ||
    moneda === "BRL"
  ) {
    return moneda;
  }

  return "CRC";
}

function mapProveedorFromBackend(item: ProveedorBackend): Proveedor {
  return {
    id: item.idOrigenCompra,
    nombre: item.nombreReferencia ?? "",
    telefono: item.telefono ?? "",
    correo: item.correo ?? "",
    pais: item.pais ?? "",
    direccion: item.direccion ?? "",
    monedaPreferida: normalizarMonedaPreferida(item.monedaPreferida),
    estado: item.estado === "INACTIVO" ? "INACTIVO" : "ACTIVO",
  };
}

function mapProveedorToBackend(proveedor: Proveedor) {
  return {
    tipoOrigen: "Proveedor",
    nombreReferencia: proveedor.nombre,
    telefono: proveedor.telefono,
    correo: proveedor.correo,
    pais: proveedor.pais,
    direccion: proveedor.direccion,
    estado: proveedor.estado,
    contacto: proveedor.correo,
    monedaPreferida: proveedor.monedaPreferida,
  };
}

export async function obtenerProveedores(): Promise<Proveedor[]> {
  const data = await apiClient.get<ProveedorBackend[]>("/proveedores");

  return data.map(mapProveedorFromBackend);
}

export async function crearProveedor(
  proveedor: Proveedor,
): Promise<Proveedor> {
  const data = await apiClient.post<
    ProveedorBackend,
    ReturnType<typeof mapProveedorToBackend>
  >("/proveedores", mapProveedorToBackend(proveedor));

  return mapProveedorFromBackend(data);
}

export async function actualizarProveedorApi(
  id: number,
  proveedor: Proveedor,
): Promise<Proveedor> {
  const data = await apiClient.patch<
    ProveedorBackend,
    ReturnType<typeof mapProveedorToBackend>
  >(`/proveedores/${id}`, mapProveedorToBackend(proveedor));

  return mapProveedorFromBackend(data);
}

export async function eliminarProveedorApi(id: number): Promise<void> {
  await apiClient.delete<unknown>(`/proveedores/${id}`);
}
