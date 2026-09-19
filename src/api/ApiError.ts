import type { ApiErrorResponse } from "./api.types";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorResponse | null;

  constructor(
    status: number,
    message: string,
    payload: ApiErrorResponse | null = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.payload = payload;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
