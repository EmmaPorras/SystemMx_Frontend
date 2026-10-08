export type BackendRole =
  | "ADMIN"
  | "OPERADOR"
  | "CONSULTA";

export type LoginRequest = {
  username: string;
  password: string;
};

export type CurrentUser = {
  idUsuario: number;
  username: string;
  email?: string | null;
  nombre: string;
  rol: BackendRole;
  activo: boolean;
  estadoActivacion?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  usuario: CurrentUser;
};

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export type SolicitarRecuperacionRequest = {
  email: string;
  lang?: "es" | "en" | "pt";
};

export type ValidarTokenResponse = {
  valid: boolean;
  tipo: "INVITACION" | "RECUPERACION_PASSWORD";
  nombre?: string;
  username?: string;
  email?: string;
};

export type ActivarCuentaRequest = {
  token: string;
  password: string;
};

export type RestablecerPasswordRequest = {
  token: string;
  password: string;
};
