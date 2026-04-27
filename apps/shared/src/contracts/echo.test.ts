import { describe, expect, it } from "vitest";
import {
  createEchoRequestSchema,
  echoDetailSchema,
  echoIdSchema,
  echoStatusSchema,
  listEchoesResponseSchema,
  updateEchoRequestSchema,
} from "./index";

const now = "2026-04-28T00:00:00.000Z";

const author = {
  id: "actor_owner",
  type: "owner",
  displayName: "Owner",
};

describe("Echo contracts", () => {
  it("safe branded id 형식을 고정한다", () => {
    expect(echoIdSchema.parse(" echo_abc-123 ")).toBe("echo_abc-123");
    expect(() => echoIdSchema.parse("abc-123")).toThrow();
    expect(() => echoIdSchema.parse("echo abc")).toThrow();
  });

  it("EchoStatus 공개 enum 을 고정한다", () => {
    expect(echoStatusSchema.options).toEqual([
      "draft",
      "published",
      "archived",
    ]);
  });

  it("빈 본문 작성을 거부하고 배열 필드 기본값을 제공한다", () => {
    expect(() => createEchoRequestSchema.parse({ body: "   " })).toThrow();
    expect(createEchoRequestSchema.parse({ body: " 첫 Echo " })).toEqual({
      body: "첫 Echo",
      mentionedAgentIds: [],
      referencedEchoIds: [],
    });
  });

  it("수정 요청도 같은 본문 검증을 적용한다", () => {
    expect(() => updateEchoRequestSchema.parse({ body: "" })).toThrow();
    expect(updateEchoRequestSchema.parse({ body: "수정" })).toEqual({
      body: "수정",
      mentionedAgentIds: [],
      referencedEchoIds: [],
    });
  });

  it("EchoDetail 필수 응답 필드와 replies 필드를 검증한다", () => {
    const detail = echoDetailSchema.parse({
      id: "echo_root",
      body: "본문",
      status: "published",
      author,
      replyCount: 1,
      createdAt: now,
      updatedAt: now,
      replies: [
        {
          id: "echo_reply",
          body: "댓글",
          status: "published",
          author,
          parentEchoId: "echo_root",
          rootEchoId: "echo_root",
          replyCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    expect(detail.id).toBe("echo_root");
    expect(detail.replies).toHaveLength(1);
  });

  it("응답 필드 이름 변경을 계약 테스트로 방지한다", () => {
    expect(
      listEchoesResponseSchema.safeParse({
        items: [
          {
            id: "echo_root",
            body: "본문",
            status: "published",
            author,
            replyCount: 0,
            createdAt: now,
            updatedAt: now,
          },
        ],
        nextCursor: "echo_next",
      }).success,
    ).toBe(true);
    expect(
      listEchoesResponseSchema.safeParse({
        echoes: [],
      }).success,
    ).toBe(false);
  });
});
