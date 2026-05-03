import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../../../prisma/prisma.service.js";
import { PrismaEchoRepository } from "./prisma-echo.repository.js";

describe("PrismaEchoRepository", () => {
  it("root 목록 replyCount 를 row 별 count 쿼리 없이 조회 결과에서 매핑한다", async () => {
    const prisma = createPrismaMock([
      createPrismaEchoRow({
        id: "echo_root",
        _count: {
          replies: 2,
        },
      }),
    ]);
    const repository = new PrismaEchoRepository(
      prisma as unknown as PrismaService,
    );

    const rows = await repository.listRootEchoes({
      limit: 20,
      status: "published",
    });

    expect(rows[0]?.replyCount).toBe(2);
    expect(prisma.echo.count).not.toHaveBeenCalled();
    expect(prisma.echo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          _count: {
            select: {
              replies: {
                where: {
                  status: "published",
                },
              },
            },
          },
        }),
      }),
    );
  });

  it("댓글 목록 replyCount 도 row 별 count 쿼리 없이 조회 결과에서 매핑한다", async () => {
    const prisma = createPrismaMock([
      createPrismaEchoRow({
        id: "echo_reply",
        parentEchoId: "echo_root",
        rootEchoId: "echo_root",
        depth: 1,
        _count: {
          replies: 0,
        },
      }),
    ]);
    const repository = new PrismaEchoRepository(
      prisma as unknown as PrismaService,
    );

    const rows = await repository.listReplies("echo_root");

    expect(rows[0]?.replyCount).toBe(0);
    expect(prisma.echo.count).not.toHaveBeenCalled();
  });
});

function createPrismaMock(rows: unknown[]) {
  return {
    echo: {
      findMany: vi.fn().mockResolvedValue(rows),
      count: vi.fn(),
    },
  };
}

function createPrismaEchoRow(overrides: Record<string, unknown> = {}) {
  return {
    ...createBasePrismaEchoRow(),
    ...overrides,
  };
}

function createBasePrismaEchoRow() {
  const now = new Date("2026-05-03T00:00:00.000Z");

  return {
    id: "echo_default",
    body: "본문",
    status: "published",
    authorActorId: "actor_owner",
    authorType: "owner",
    authorDisplayName: "Owner",
    parentEchoId: null,
    rootEchoId: null,
    depth: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    deletedByActorId: null,
    attachments: [],
    _count: {
      replies: 0,
    },
  };
}
