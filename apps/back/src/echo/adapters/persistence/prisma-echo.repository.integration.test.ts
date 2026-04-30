import "reflect-metadata";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../prisma/prisma.service.js";
import { PrismaEchoRepository } from "./prisma-echo.repository.js";

const runIntegration =
  process.env.PROXI_INTEGRATION_TESTS === "1" ? describe : describe.skip;

runIntegration("PrismaEchoRepository integration", () => {
  const prisma = new PrismaService();
  const repository = new PrismaEchoRepository(prisma);
  const now = new Date("2026-04-30T00:00:00.000Z");

  beforeEach(async () => {
    await prisma.attachment.deleteMany();
    await prisma.echoMention.deleteMany();
    await prisma.echo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("실제 PostgreSQL 에 Echo attachment, 검색, 복구를 저장한다", async () => {
    await prisma.attachment.create({
      data: {
        id: "attachment_integration",
        originalFileName: "memo.txt",
        mimeType: "text/plain",
        sizeBytes: 5,
        checksum: "abc",
        relativePath: "2026/04/attachment_integration.txt",
      },
    });

    expect(
      await repository.countAttachableAttachments(["attachment_integration"]),
    ).toBe(1);

    const created = await repository.create(
      {
        id: "echo_integration",
        body: "통합 검색 본문",
        status: "published",
        authorActorId: "actor_owner",
        authorType: "owner",
        authorDisplayName: "Owner",
        depth: 0,
        createdAt: now,
        updatedAt: now,
      },
      ["attachment_integration"],
    );
    const listed = await repository.listRootEchoes({
      limit: 10,
      search: "검색",
      status: "published",
    });
    const archived = await repository.archive(
      created.id,
      new Date("2026-04-30T00:01:00.000Z"),
      "actor_owner",
    );
    const restored = await repository.restore(
      created.id,
      new Date("2026-04-30T00:02:00.000Z"),
    );

    expect(created.attachments[0]?.id).toBe("attachment_integration");
    expect(listed.map((echo) => echo.id)).toEqual(["echo_integration"]);
    expect(archived.status).toBe("archived");
    expect(restored.status).toBe("published");
    expect(restored.deletedAt).toBeUndefined();
  });
});
