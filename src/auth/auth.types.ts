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
  nombre: string;
  rol: BackendRole;
  activo: boolean;
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
