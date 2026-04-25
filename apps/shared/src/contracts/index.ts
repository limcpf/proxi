import { z } from "zod";

export const sharedContractVersion = "0.1.0" as const;

export const proxiEntityIdSchema = z
  .string()
  .trim()
  .min(1, "id must not be empty.")
  .max(128, "id must be 128 characters or fewer.")
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, {
    message: "id can contain only letters, numbers, underscores, and hyphens.",
  })
  .brand<"ProxiEntityId">();

export const apiErrorSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "error code must not be empty.")
    .max(64, "error code must be 64 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(1, "error message must not be empty.")
    .max(240, "error message must be 240 characters or fewer."),
});

export function apiSuccessSchema<TDataSchema extends z.ZodType>(
  dataSchema: TDataSchema,
) {
  return z.object({
    ok: z.literal(true),
    data: dataSchema,
  });
}

export function apiResultSchema<TDataSchema extends z.ZodType>(
  dataSchema: TDataSchema,
) {
  return z.discriminatedUnion("ok", [
    apiSuccessSchema(dataSchema),
    z.object({
      ok: z.literal(false),
      error: apiErrorSchema,
    }),
  ]);
}
