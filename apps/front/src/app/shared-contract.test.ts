import { sharedContractVersion, toApiSuccess } from "@proxi/shared";
import { describe, expect, it } from "vitest";

describe("front shared workspace contract", () => {
  it("shared public API 를 workspace 의존성으로 소비한다", () => {
    expect(sharedContractVersion).toBe("0.1.0");
    expect(toApiSuccess({ service: "proxi-front" })).toEqual({
      ok: true,
      data: {
        service: "proxi-front",
      },
    });
  });
});
