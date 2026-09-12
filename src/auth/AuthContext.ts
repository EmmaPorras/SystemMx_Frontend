import { createContext } from "react";

import type {
  AuthStatus,
  CurrentUser,
  LoginRequest,
} from "./auth.types";

export type AuthContextValue = {
  user: CurrentUser | null;
  status: AuthStatus;
  sessionError: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);
