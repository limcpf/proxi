import { afterEach, describe, expect, it, vi } from "vitest";
import { createEchoWithFiles } from "./echo.api";

const now = "2026-05-03T00:00:00.000Z";

describe("Echo API attachment rollback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Echo 생성 실패 시 먼저 업로드한 attachment 를 삭제한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createAttachment("attachment_one")))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            code: "echo_validation_failed",
            message: "Echo 본문을 입력해 주세요.",
          },
          400,
        ),
      )
      .mockResolvedValueOnce(noContentResponse());
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createEchoWithFiles({
        body: "본문",
        files: [new File(["memo"], "memo.txt", { type: "text/plain" })],
      }),
    ).rejects.toThrow("Echo 본문을 입력해 주세요.");

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/attachments/attachment_one",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("일부 upload 실패 시 성공한 attachment 만 삭제한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createAttachment("attachment_one")))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            code: "attachment_validation_failed",
            message: "업로드할 파일을 확인해 주세요.",
          },
          400,
        ),
      )
      .mockResolvedValueOnce(noContentResponse());
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createEchoWithFiles({
        body: "본문",
        files: [
          new File(["memo"], "memo.txt", { type: "text/plain" }),
          new File(["bad"], "bad.txt", { type: "text/plain" }),
        ],
      }),
    ).rejects.toThrow("업로드할 파일을 확인해 주세요.");

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/attachments/attachment_one",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});

function createAttachment(id: string) {
  return {
    id,
    originalFileName: `${id}.txt`,
    mimeType: "text/plain",
    sizeBytes: 4,
    checksum: `${id}_checksum`,
    downloadUrl: `/attachments/${id}/download`,
    createdAt: now,
  };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
    },
    status,
  });
}

function noContentResponse() {
  return new Response(null, {
    status: 204,
  });
}
