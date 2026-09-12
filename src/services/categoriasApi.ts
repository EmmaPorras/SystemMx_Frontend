import { apiClient } from "../api/apiClient";

import type {
  Categoria,
  CategoriaFormData,
} from "../components/categorias/categorias.types";

export type DesactivarCategoriaResponse = {
  message: string;
  id: number;
};

type CategoriaCreatePayload = {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

type CategoriaUpdatePayload = {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
};

function mapFormToPayload(
  form: CategoriaFormData,
): CategoriaCreatePayload {
  return {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    activo: form.activo,
  };
}

export function obtenerCategorias(): Promise<Categoria[]> {
  return apiClient.get<Categoria[]>("/categorias");
}

export function obtenerCategoria(
  id: number,
): Promise<Categoria> {
  return apiClient.get<Categoria>(`/categorias/${id}`);
}

export function crearCategoriaApi(
  form: CategoriaFormData,
): Promise<Categoria> {
  return apiClient.post<Categoria, CategoriaCreatePayload>(
    "/categorias",
    mapFormToPayload(form),
  );
}

export function actualizarCategoriaApi(
  id: number,
  form: CategoriaFormData,
): Promise<Categoria> {
  const payload: CategoriaUpdatePayload =
    mapFormToPayload(form);

  return apiClient.patch<Categoria, CategoriaUpdatePayload>(
    `/categorias/${id}`,
    payload,
  );
}

export function desactivarCategoriaApi(
  id: number,
): Promise<DesactivarCategoriaResponse> {
  return apiClient.delete<DesactivarCategoriaResponse>(
    `/categorias/${id}`,
  );
}
