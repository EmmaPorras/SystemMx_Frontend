import { apiClient } from "../api/apiClient";
import type { BackendRole } from "../auth/auth.types";

export type EstadoActivacion = "ACTIVO" | "PENDIENTE_ACTIVACION";

export type UsuarioItem = {
  idUsuario: number;
  username: string;
  email: string | null;
  nombre: string;
  rol: BackendRole;
  activo: boolean;
  estadoActivacion: EstadoActivacion;
  createdAt: string;
  updatedAt: string;
};

export type InvitarUsuarioRequest = {
  username: string;
  nombre: string;
  email: string;
  rol: BackendRole;
  lang?: "es" | "en" | "pt";
};

export type InvitarUsuarioResponse = {
  usuario: UsuarioItem;
  mensaje: string;
};

export function getUsuariosApi(): Promise<UsuarioItem[]> {
  return apiClient.get<UsuarioItem[]>("/usuarios");
}

export function invitarUsuarioApi(
  data: InvitarUsuarioRequest,
): Promise<InvitarUsuarioResponse> {
  return apiClient.post<InvitarUsuarioResponse, InvitarUsuarioRequest>(
    "/usuarios/invitar",
    data,
  );
}

export function reenviarInvitacionApi(
  idUsuario: number,
): Promise<{ mensaje: string }> {
  return apiClient.post<{ mensaje: string }, Record<string, never>>(
    `/usuarios/${idUsuario}/reenviar-invitacion`,
    {},
  );
}

export function cambiarEstadoUsuarioApi(
  idUsuario: number,
  activo: boolean,
): Promise<UsuarioItem> {
  return apiClient.patch<UsuarioItem, { activo: boolean }>(
    `/usuarios/${idUsuario}/estado`,
    { activo },
  );
}

export function cambiarRolUsuarioApi(
  idUsuario: number,
  rol: BackendRole,
): Promise<UsuarioItem> {
  return apiClient.patch<UsuarioItem, { rol: BackendRole }>(
    `/usuarios/${idUsuario}/rol`,
    { rol },
  );
}
