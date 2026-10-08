import { ApiError } from "./ApiError";
import type {
  ApiErrorResponse,
  QueryParams,
} from "./api.types";
import {
  clearAccessToken,
  getAccessToken,
} from "../auth/tokenStorage";
import i18n from "../i18n";

export const AUTH_UNAUTHORIZED_EVENT = "systemmx:unauthorized";

type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  auth?: boolean;
  body?: unknown;
};

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "VITE_API_URL no está configurado. Revise el archivo .env.local.",
    );
  }

  return API_URL;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(`${getApiUrl()}${normalizePath(path)}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isApiErrorResponse(
  value: unknown,
): value is ApiErrorResponse {
  return typeof value === "object" && value !== null;
}

function getBackendMessage(
  payload: ApiErrorResponse | null,
): string | null {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(" ");
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  return null;
}

function getDefaultErrorMessage(status: number): string {
  const translate = (key: string, defaultValue: string): string => {
    return i18n.isInitialized
      ? i18n.t(key, { defaultValue })
      : defaultValue;
  };

  switch (status) {
    case 400:
      return translate(
        "errors.badRequest",
        "Los datos enviados no son válidos.",
      );

    case 401:
      return translate(
        "errors.unauthorized",
        "La sesión no es válida o ha expirado.",
      );

    case 403:
      return translate(
        "errors.forbidden",
        "No tiene permiso para realizar esta acción.",
      );

    case 404:
      return translate(
        "errors.notFound",
        "El recurso solicitado no fue encontrado.",
      );

    case 409:
      return translate(
        "errors.conflict",
        "La operación no pudo completarse por un conflicto.",
      );

    case 429:
      return translate(
        "errors.tooManyRequests",
        "Se realizaron demasiadas solicitudes. Intente nuevamente más tarde.",
      );

    default:
      if (status >= 500) {
        return translate(
          "errors.serverError",
          "Ocurrió un error en el servidor.",
        );
      }

      return translate(
        "errors.generic",
        "Ocurrió un error inesperado.",
      );
  }
}

async function request<T>(
  method: string,
  path: string,
  options: ApiRequestOptions = {},
  query?: QueryParams,
): Promise<T> {
  const {
    auth = true,
    body,
    headers: providedHeaders,
    ...requestInit
  } = options;

  const headers = new Headers(providedHeaders);

  headers.set("Accept", "application/json");

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const parsedBody = await parseBody(response);

  if (!response.ok) {
    const errorPayload = isApiErrorResponse(parsedBody)
      ? parsedBody
      : null;

    if (response.status === 401 && auth) {
      clearAccessToken();

      window.dispatchEvent(
        new Event(AUTH_UNAUTHORIZED_EVENT),
      );
    }

    throw new ApiError(
      response.status,
      getBackendMessage(errorPayload) ??
        getDefaultErrorMessage(response.status),
      errorPayload,
    );
  }

  return parsedBody as T;
}

export const apiClient = {
  get<T>(
    path: string,
    query?: QueryParams,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return request<T>("GET", path, options, query);
  },

  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>("POST", path, {
      ...options,
      body,
    });
  },

  patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>("PATCH", path, {
      ...options,
      body,
    });
  },

  delete<TResponse>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>("DELETE", path, options);
  },
};
