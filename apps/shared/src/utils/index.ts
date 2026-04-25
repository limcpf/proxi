import type { ApiError, ApiResult } from "../types/index";

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function createIsoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function toApiSuccess<TData>(data: TData): ApiResult<TData> {
  return {
    ok: true,
    data,
  };
}

export function toApiFailure(error: ApiError): ApiResult<never> {
  return {
    ok: false,
    error,
  };
}
