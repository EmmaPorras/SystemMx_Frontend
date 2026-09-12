import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "../api/ApiError";
import { AUTH_UNAUTHORIZED_EVENT } from "../api/apiClient";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./tokenStorage";

import {
  getCurrentUserApi,
  loginApi,
} from "./auth.api";

import { AuthContext } from "./AuthContext";

import type {
  AuthStatus,
  CurrentUser,
  LoginRequest,
} from "./auth.types";

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] =
    useState<AuthStatus>("loading");
  const [sessionError, setSessionError] =
    useState<string | null>(null);

  const initialRestoreStarted = useRef(false);

  const refreshSession = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setSessionError(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");
    setSessionError(null);

    try {
      const currentUser = await getCurrentUserApi();

      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setSessionError(null);
        setStatus("unauthenticated");
        return;
      }

      setUser(null);

      setSessionError(
        error instanceof Error
          ? error.message
          : "No fue posible validar la sesión actual.",
      );

      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (initialRestoreStarted.current) {
      return;
    }

    initialRestoreStarted.current = true;

    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setSessionError(null);
      setStatus("unauthenticated");
    }

    window.addEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorized,
      );
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await loginApi(credentials);

      setAccessToken(response.accessToken);

      setUser(response.usuario);
      setSessionError(null);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(() => {
    clearAccessToken();

    setUser(null);
    setSessionError(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      sessionError,
      login,
      logout,
      refreshSession,
    }),
    [
      user,
      status,
      sessionError,
      login,
      logout,
      refreshSession,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
