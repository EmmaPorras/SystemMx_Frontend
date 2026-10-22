import { apiClient } from "../api/apiClient";

import type {
  ActivarCuentaRequest,
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RestablecerPasswordRequest,
  SolicitarRecuperacionRequest,
  ValidarTokenResponse,
} from "./auth.types";

export function loginApi(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  return apiClient.post<LoginResponse, LoginRequest>(
    "/auth/login",
    credentials,
    {
      auth: false,
    },
  );
}

export function getCurrentUserApi(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>("/auth/me");
}

export function solicitarRecuperacionApi(
  data: SolicitarRecuperacionRequest,
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }, SolicitarRecuperacionRequest>(
    "/auth/recuperar-password",
    data,
    {
      auth: false,
    },
  );
}

export function validarTokenApi(
  token: string,
  tipo?: string,
): Promise<ValidarTokenResponse> {
  const query: Record<string, string> = { token };
  if (tipo) query.tipo = tipo;

  return apiClient.get<ValidarTokenResponse>(
    "/auth/validar-token",
    query,
    {
      auth: false,
    },
  );
}

export function activarCuentaApi(
  data: ActivarCuentaRequest,
): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }, ActivarCuentaRequest>(
    "/auth/activar-cuenta",
    data,
    {
      auth: false,
    },
  );
}

export function restablecerPasswordApi(
  data: RestablecerPasswordRequest,
): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }, RestablecerPasswordRequest>(
    "/auth/restablecer-password",
    data,
    {
      auth: false,
    },
  );
}
