import type { z } from "zod";
import type { apiErrorSchema, proxiEntityIdSchema } from "../contracts/index";

export * from "./echo.js";

export type ProxiEntityId = z.infer<typeof proxiEntityIdSchema>;

export type ApiError = z.infer<typeof apiErrorSchema>;

export type ApiResult<TData> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      error: ApiError;
    };

export type MaybePromise<TValue> = TValue | Promise<TValue>;
