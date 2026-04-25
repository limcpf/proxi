import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  apiErrorSchema,
  apiResultSchema,
  proxiEntityIdSchema,
  sharedContractVersion,
} from "./index";

describe("shared contracts", () => {
  it("exposes a code-managed contract version", () => {
    expect(sharedContractVersion).toBe("0.1.0");
  });

  it("parses trimmed shared entity ids", () => {
    expect(proxiEntityIdSchema.parse(" entity_123 ")).toBe("entity_123");
  });

  it("rejects invalid shared entity ids", () => {
    expect(() => proxiEntityIdSchema.parse("entity 123")).toThrow();
    expect(() => proxiEntityIdSchema.parse("_entity")).toThrow();
  });

  it("validates shared API errors", () => {
    expect(
      apiErrorSchema.parse({
        code: "validation_failed",
        message: "Invalid input.",
      }),
    ).toEqual({
      code: "validation_failed",
      message: "Invalid input.",
    });
  });

  it("validates shared API result contracts", () => {
    const schema = apiResultSchema(
      z.object({
        id: proxiEntityIdSchema,
      }),
    );

    expect(
      schema.safeParse({
        ok: true,
        data: {
          id: "project_1",
        },
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        ok: false,
        error: {
          code: "not_found",
          message: "Project not found.",
        },
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        ok: true,
        error: {
          code: "not_found",
          message: "Project not found.",
        },
      }).success,
    ).toBe(false);
  });
});
