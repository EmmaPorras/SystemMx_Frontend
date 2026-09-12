export type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type QueryParams = Record<string, QueryValue>;

export type PaginacionRespuesta<T> = {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
};
