import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../../../prisma/prisma.service.js";
import { EchoApplicationError } from "../../domain/echo.errors.js";
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

  it("현재 목록 조건에 없는 cursor 를 400 오류로 변환한다", async () => {
    const prisma = createPrismaMock([]);
    prisma.echo.findFirst.mockResolvedValue(null);
    const repository = new PrismaEchoRepository(
      prisma as unknown as PrismaService,
    );

    await expect(
      repository.listRootEchoes({
        cursor: "echo_missing",
        limit: 20,
        status: "published",
      }),
    ).rejects.toMatchObject({
      code: "echo_cursor_invalid",
      httpStatus: 400,
    });
    await expect(
      repository.listRootEchoes({
        cursor: "echo_missing",
        limit: 20,
        status: "published",
      }),
    ).rejects.toBeInstanceOf(EchoApplicationError);
    expect(prisma.echo.findMany).not.toHaveBeenCalled();
  });

  it("유효한 cursor 는 Prisma cursor 대신 정렬 window 조건으로 조회한다", async () => {
    const cursorCreatedAt = new Date("2026-05-03T00:00:00.000Z");
    const prisma = createPrismaMock([]);
    prisma.echo.findFirst.mockResolvedValue({
      id: "echo_cursor",
      createdAt: cursorCreatedAt,
    });
    const repository = new PrismaEchoRepository(
      prisma as unknown as PrismaService,
    );

    await repository.listRootEchoes({
      cursor: "echo_cursor",
      limit: 20,
      status: "published",
    });

    expect(prisma.echo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            expect.objectContaining({
              parentEchoId: null,
              depth: 0,
              status: "published",
            }),
            {
              OR: [
                {
                  createdAt: {
                    lt: cursorCreatedAt,
                  },
                },
                {
                  createdAt: cursorCreatedAt,
                  id: {
                    lt: "echo_cursor",
                  },
                },
              ],
            },
          ],
        },
      }),
    );
    expect(prisma.echo.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({
        cursor: expect.anything(),
      }),
    );
  });
});

function createPrismaMock(rows: unknown[]) {
  return {
    echo: {
      findMany: vi.fn().mockResolvedValue(rows),
      findFirst: vi.fn().mockResolvedValue({
        id: "echo_cursor",
        createdAt: new Date("2026-05-03T00:00:00.000Z"),
      }),
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
