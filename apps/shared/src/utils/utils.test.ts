import { describe, expect, it } from "vitest";
import {
  createIsoTimestamp,
  isNonEmptyString,
  toApiFailure,
  toApiSuccess,
} from "./index";

describe("shared utils", () => {
  it("detects non-empty strings after trimming", () => {
    expect(isNonEmptyString(" value ")).toBe(true);
    expect(isNonEmptyString(" ")).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });

  it("creates ISO timestamps from explicit dates", () => {
    expect(createIsoTimestamp(new Date("2026-04-25T00:00:00.000Z"))).toBe(
      "2026-04-25T00:00:00.000Z",
    );
  });

  it("wraps successful API results", () => {
    expect(toApiSuccess({ id: "project_1" })).toEqual({
      ok: true,
      data: {
        id: "project_1",
      },
    });
  });

  it("wraps failed API results", () => {
    expect(
      toApiFailure({
        code: "not_found",
        message: "Project not found.",
      }),
    ).toEqual({
      ok: false,
      error: {
        code: "not_found",
        message: "Project not found.",
      },
    });
  });
});
