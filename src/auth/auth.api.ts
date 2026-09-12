import { apiClient } from "../api/apiClient";

import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
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
