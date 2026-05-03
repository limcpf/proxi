import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../prisma/prisma.service.js";
import type { EchoEntity } from "../../domain/echo.entity.js";
import { PrismaEchoRepository } from "./prisma-echo.repository.js";

const runIntegration =
  process.env.PROXI_INTEGRATION_TESTS === "1" ? describe : describe.skip;

runIntegration("PrismaEchoRepository integration", () => {
  const prisma = new PrismaService();
  const repository = new PrismaEchoRepository(prisma);
  const now = new Date("2026-04-30T00:00:00.000Z");

  beforeAll(() => {
    assertTestDatabaseUrl();
  });

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

  it("create, findById, updateBody 를 실제 DB 값으로 반환한다", async () => {
    const createdAt = new Date("2026-04-30T00:10:00.000Z");
    const updatedAt = new Date("2026-04-30T00:11:00.000Z");

    const created = await repository.create(
      createRootEcho({
        id: "echo_create_find_update",
        body: "생성 본문",
        createdAt,
        updatedAt: createdAt,
      }),
    );
    const found = await repository.findById(created.id);
    const updated = await repository.updateBody(
      created.id,
      "수정 본문",
      updatedAt,
    );
    const refetched = await repository.findById(created.id);

    expect(created.body).toBe("생성 본문");
    expect(found?.id).toBe(created.id);
    expect(found?.body).toBe("생성 본문");
    expect(updated.body).toBe("수정 본문");
    expect(updated.updatedAt).toEqual(updatedAt);
    expect(refetched?.body).toBe("수정 본문");
    expect(refetched?.updatedAt).toEqual(updatedAt);
  });

  it("root 목록의 정렬, 페이지네이션, 검색, status 분리를 처리한다", async () => {
    const oldDate = new Date("2026-04-30T00:20:00.000Z");
    const tieDate = new Date("2026-04-30T00:21:00.000Z");
    const archivedDate = new Date("2026-04-30T00:22:00.000Z");

    await repository.create(
      createRootEcho({
        id: "echo_old",
        body: "Needle old",
        createdAt: oldDate,
        updatedAt: oldDate,
      }),
    );
    await repository.create(
      createRootEcho({
        id: "echo_b",
        body: "Needle beta",
        createdAt: tieDate,
        updatedAt: tieDate,
      }),
    );
    await repository.create(
      createRootEcho({
        id: "echo_c",
        body: "Needle gamma",
        createdAt: tieDate,
        updatedAt: tieDate,
      }),
    );
    await repository.create(
      createRootEcho({
        id: "echo_archived",
        body: "Needle archived",
        status: "archived",
        createdAt: archivedDate,
        updatedAt: archivedDate,
        deletedAt: archivedDate,
        deletedByActorId: "actor_owner",
      }),
    );
    await repository.create(
      createReplyEcho("echo_c", {
        id: "echo_reply_hidden_from_root",
        body: "Needle reply",
        createdAt: new Date("2026-04-30T00:23:00.000Z"),
        updatedAt: new Date("2026-04-30T00:23:00.000Z"),
      }),
    );

    const firstPage = await repository.listRootEchoes({
      limit: 2,
      search: "needle",
      status: "published",
    });
    const secondPage = await repository.listRootEchoes({
      cursor: "echo_b",
      limit: 2,
      search: "needle",
      status: "published",
    });
    const archived = await repository.listRootEchoes({
      limit: 10,
      search: "needle",
      status: "archived",
    });

    expect(firstPage.map((echo) => echo.id)).toEqual(["echo_c", "echo_b"]);
    expect(secondPage.map((echo) => echo.id)).toEqual(["echo_old"]);
    expect(archived.map((echo) => echo.id)).toEqual(["echo_archived"]);
  });

  it("댓글 목록과 replyCount 는 published 댓글만 반영한다", async () => {
    const root = await repository.create(
      createRootEcho({
        id: "echo_reply_root",
        body: "댓글 root",
      }),
    );
    await repository.create(
      createReplyEcho(root.id, {
        id: "echo_reply_old",
        body: "오래된 댓글",
        createdAt: new Date("2026-04-30T00:30:00.000Z"),
        updatedAt: new Date("2026-04-30T00:30:00.000Z"),
      }),
    );
    await repository.create(
      createReplyEcho(root.id, {
        id: "echo_reply_new",
        body: "새 댓글",
        createdAt: new Date("2026-04-30T00:31:00.000Z"),
        updatedAt: new Date("2026-04-30T00:31:00.000Z"),
      }),
    );
    await repository.create(
      createReplyEcho(root.id, {
        id: "echo_reply_archived",
        body: "보관된 댓글",
        status: "archived",
        createdAt: new Date("2026-04-30T00:32:00.000Z"),
        updatedAt: new Date("2026-04-30T00:32:00.000Z"),
        deletedAt: new Date("2026-04-30T00:33:00.000Z"),
        deletedByActorId: "actor_owner",
      }),
    );

    const replies = await repository.listReplies(root.id);
    const foundRoot = await repository.findById(root.id);

    expect(replies.map((reply) => reply.id)).toEqual([
      "echo_reply_old",
      "echo_reply_new",
    ]);
    expect(foundRoot?.replyCount).toBe(2);
  });

  it("없는 첨부와 이미 연결된 첨부가 있으면 Echo 생성을 원자적으로 실패시킨다", async () => {
    await createAttachment("attachment_available");
    await createAttachment("attachment_claimed");
    await repository.create(
      createRootEcho({
        id: "echo_attachment_owner",
        body: "이미 첨부를 가진 Echo",
      }),
      ["attachment_claimed"],
    );

    const attachableCount = await repository.countAttachableAttachments([
      "attachment_available",
      "attachment_claimed",
      "attachment_missing",
    ]);
    const createWithUnavailableAttachments = repository.create(
      createRootEcho({
        id: "echo_attachment_negative",
        body: "첨부 negative",
      }),
      ["attachment_available", "attachment_claimed", "attachment_missing"],
    );

    await expect(createWithUnavailableAttachments).rejects.toMatchObject({
      code: "echo_attachment_unavailable",
      httpStatus: 400,
    });

    const unavailableEcho = await prisma.echo.findUnique({
      where: {
        id: "echo_attachment_negative",
      },
    });
    const available = await prisma.attachment.findUniqueOrThrow({
      where: {
        id: "attachment_available",
      },
    });
    const claimed = await prisma.attachment.findUniqueOrThrow({
      where: {
        id: "attachment_claimed",
      },
    });

    expect(attachableCount).toBe(1);
    expect(unavailableEcho).toBeNull();
    expect(available.echoId).toBeNull();
    expect(claimed.echoId).toBe("echo_attachment_owner");
  });

  it("archive, restore 후 published 와 archived 목록을 분리한다", async () => {
    const created = await repository.create(
      createRootEcho({
        id: "echo_archive_restore",
        body: "상태 분리",
      }),
    );

    await repository.archive(
      created.id,
      new Date("2026-04-30T00:40:00.000Z"),
      "actor_owner",
    );

    const publishedAfterArchive = await repository.listRootEchoes({
      limit: 10,
      status: "published",
    });
    const archivedAfterArchive = await repository.listRootEchoes({
      limit: 10,
      status: "archived",
    });

    await repository.restore(created.id, new Date("2026-04-30T00:41:00.000Z"));

    const publishedAfterRestore = await repository.listRootEchoes({
      limit: 10,
      status: "published",
    });
    const archivedAfterRestore = await repository.listRootEchoes({
      limit: 10,
      status: "archived",
    });

    expect(publishedAfterArchive.map((echo) => echo.id)).not.toContain(
      created.id,
    );
    expect(archivedAfterArchive.map((echo) => echo.id)).toEqual([created.id]);
    expect(publishedAfterRestore.map((echo) => echo.id)).toEqual([created.id]);
    expect(archivedAfterRestore).toEqual([]);
  });

  async function createAttachment(id: string) {
    await prisma.attachment.create({
      data: {
        id,
        originalFileName: `${id}.txt`,
        mimeType: "text/plain",
        sizeBytes: 5,
        checksum: `${id}_checksum`,
        relativePath: `2026/04/${id}.txt`,
      },
    });
  }
});

function assertTestDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (
    databaseUrl === undefined ||
    !databaseUrl.toLowerCase().includes("test")
  ) {
    throw new Error(
      "PROXI_INTEGRATION_TESTS=1 requires DATABASE_URL to include 'test'.",
    );
  }
}

function createRootEcho(overrides: Partial<EchoEntity> = {}): EchoEntity {
  const createdAt = overrides.createdAt ?? new Date("2026-04-30T00:00:00.000Z");

  return {
    id: "echo_default",
    body: "기본 본문",
    status: "published",
    authorActorId: "actor_owner",
    authorType: "owner",
    authorDisplayName: "Owner",
    depth: 0,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

function createReplyEcho(
  rootEchoId: string,
  overrides: Partial<EchoEntity> = {},
): EchoEntity {
  const createdAt = overrides.createdAt ?? new Date("2026-04-30T00:00:00.000Z");

  return createRootEcho({
    id: "echo_reply_default",
    body: "댓글 본문",
    parentEchoId: rootEchoId,
    rootEchoId,
    depth: 1,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  });
}
