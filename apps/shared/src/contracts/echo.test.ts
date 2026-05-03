import { describe, expect, it } from "vitest";
import {
  createEchoRequestSchema,
  echoAttachmentSchema,
  echoDetailSchema,
  echoIdSchema,
  echoStatusSchema,
  listEchoesRequestSchema,
  listEchoesResponseSchema,
  updateEchoRequestSchema,
  uploadAttachmentRequestSchema,
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
      attachmentIds: [],
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
    expect(detail.attachments).toEqual([]);
    expect(detail.replies).toHaveLength(1);
  });

  it("Attachment 업로드 요청과 응답 필드를 검증한다", () => {
    expect(
      uploadAttachmentRequestSchema.parse({
        fileName: "memo.txt",
        mimeType: "text/plain",
        sizeBytes: 5,
        contentBase64: "aGVsbG8=",
      }),
    ).toEqual({
      fileName: "memo.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      contentBase64: "aGVsbG8=",
    });

    expect(
      echoAttachmentSchema.parse({
        id: "attachment_one",
        originalFileName: "memo.txt",
        mimeType: "text/plain",
        sizeBytes: 5,
        checksum: "abc",
        downloadUrl: "/attachments/attachment_one/download",
        createdAt: now,
      }).downloadUrl,
    ).toBe("/attachments/attachment_one/download");
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

  it("목록 요청 cursor 형식을 검증하고 status 는 경로가 결정하게 둔다", () => {
    expect(
      listEchoesRequestSchema.parse({
        cursor: " echo_next ",
        q: " 검색 ",
      }),
    ).toEqual({
      cursor: "echo_next",
      q: "검색",
    });
    expect(
      listEchoesRequestSchema.parse({
        status: "archived",
      }).status,
    ).toBe("archived");
    expect(() =>
      listEchoesRequestSchema.parse({
        cursor: "not-an-echo-id",
      }),
    ).toThrow();
  });
});
