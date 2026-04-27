import "reflect-metadata";
import { describe, expect, it, vi } from "vitest";
import { InMemoryEchoRepository } from "../adapters/persistence/in-memory-echo.repository.js";
import { EchoApplicationError } from "../domain/echo.errors.js";
import { EchoApplicationService } from "./echo.application.service.js";

describe("EchoApplicationService", () => {
  it("root Echo 작성, 목록, 상세를 처리한다", async () => {
    const service = createService();

    const created = await service.createRoot({ body: " 첫 Echo " });
    const listed = await service.listRootEchoes({});
    const detail = await service.getDetail(created.id);

    expect(created.body).toBe("첫 Echo");
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]?.id).toBe(created.id);
    expect(detail.replies).toEqual([]);
  });

  it("빈 본문을 거부한다", async () => {
    const service = createService();

    await expect(service.createRoot({ body: "   " })).rejects.toMatchObject({
      code: "echo_validation_failed",
      httpStatus: 400,
    });
  });

  it("수정과 소프트 삭제를 처리하고 published 목록에서 제외한다", async () => {
    const service = createService();
    const created = await service.createRoot({ body: "수정 전" });
    const updated = await service.update(created.id, { body: "수정 후" });

    await service.archive(created.id);

    const listed = await service.listRootEchoes({});
    const archivedDetail = await service.getDetail(created.id);

    expect(updated.body).toBe("수정 후");
    expect(listed.items).toEqual([]);
    expect(archivedDetail.status).toBe("archived");
    expect(archivedDetail.deletedAt).toBeDefined();
  });

  it("댓글을 child Echo 로 저장하고 archived Echo 댓글을 차단한다", async () => {
    const service = createService();
    const root = await service.createRoot({ body: "root" });
    const reply = await service.createReply(root.id, { body: "reply" });
    const detail = await service.getDetail(root.id);

    expect(reply.parentEchoId).toBe(root.id);
    expect(detail.replyCount).toBe(1);
    expect(detail.replies[0]?.body).toBe("reply");

    await service.archive(root.id);

    await expect(
      service.createReply(root.id, { body: "blocked" }),
    ).rejects.toMatchObject({
      code: "echo_not_published",
      httpStatus: 409,
    });
  });

  it("댓글 depth 를 1로 제한한다", async () => {
    const service = createService();
    const root = await service.createRoot({ body: "root" });
    const reply = await service.createReply(root.id, { body: "reply" });

    await expect(
      service.createReply(reply.id, { body: "nested" }),
    ).rejects.toBeInstanceOf(EchoApplicationError);
    await expect(
      service.createReply(reply.id, { body: "nested" }),
    ).rejects.toMatchObject({
      code: "echo_reply_depth_exceeded",
      httpStatus: 409,
    });
  });
});

function createService() {
  vi.spyOn(console, "info").mockImplementation(() => undefined);

  return new EchoApplicationService(new InMemoryEchoRepository());
}
