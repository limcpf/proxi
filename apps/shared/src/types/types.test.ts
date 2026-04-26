import { describe, expectTypeOf, it } from "vitest";
import type { proxiEntityIdSchema } from "../contracts/index";
import type { ApiResult, ProxiEntityId } from "./index";

describe("shared types", () => {
  it("keeps schema-inferred ids aligned with the public id type", () => {
    expectTypeOf<
      ReturnType<typeof proxiEntityIdSchema.parse>
    >().toEqualTypeOf<ProxiEntityId>();
    expectTypeOf<ProxiEntityId>().toMatchTypeOf<string>();
    expectTypeOf<string>().not.toMatchTypeOf<ProxiEntityId>();
  });

  it("models shared API result success and failure branches", () => {
    type Result = ApiResult<{ id: ProxiEntityId }>;

    expectTypeOf<Result>().toMatchTypeOf<
      | {
          ok: true;
          data: {
            id: ProxiEntityId;
          };
        }
      | {
          ok: false;
          error: {
            code: string;
            message: string;
          };
        }
    >();
  });
});
