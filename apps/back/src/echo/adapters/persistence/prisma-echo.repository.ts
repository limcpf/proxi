import { Inject, Injectable } from "@nestjs/common";
import type {
  Prisma,
  Attachment as PrismaAttachment,
  EchoAuthorType as PrismaEchoAuthorType,
  EchoStatus as PrismaEchoStatus,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service.js";
import type {
  EchoEntity,
  EchoWithReplyCount,
} from "../../domain/echo.entity.js";
import { badRequest } from "../../domain/echo.errors.js";
import type {
  EchoRepository,
  ListRootEchoesQuery,
} from "../../ports/echo.repository.js";

type PrismaEchoRow = {
  id: string;
  body: string;
  status: PrismaEchoStatus;
  authorActorId: string;
  authorType: PrismaEchoAuthorType;
  authorDisplayName: string;
  parentEchoId: string | null;
  rootEchoId: string | null;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedByActorId: string | null;
  attachments: PrismaAttachment[];
  _count: {
    replies: number;
  };
};

type PrismaRootCursorRow = {
  id: string;
  createdAt: Date;
};

const echoInclude = {
  attachments: {
    orderBy: {
      createdAt: "asc",
    },
  },
  _count: {
    select: {
      replies: {
        where: {
          status: "published",
        },
      },
    },
  },
} satisfies Prisma.EchoInclude;

@Injectable()
export class PrismaEchoRepository implements EchoRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async countAttachableAttachments(attachmentIds: string[]): Promise<number> {
    if (attachmentIds.length === 0) {
      return 0;
    }

    return this.prisma.attachment.count({
      where: {
        id: {
          in: attachmentIds,
        },
        echoId: null,
      },
    });
  }

  async create(
    echo: EchoEntity,
    attachmentIds: string[] = [],
  ): Promise<EchoWithReplyCount> {
    const created = await this.prisma.$transaction(async (transaction) => {
      await transaction.echo.create({
        data: {
          id: echo.id,
          body: echo.body,
          status: echo.status,
          authorActorId: echo.authorActorId,
          authorType: echo.authorType,
          authorDisplayName: echo.authorDisplayName,
          parentEchoId: echo.parentEchoId,
          rootEchoId: echo.rootEchoId,
          depth: echo.depth,
          createdAt: echo.createdAt,
          updatedAt: echo.updatedAt,
          deletedAt: echo.deletedAt,
          deletedByActorId: echo.deletedByActorId,
        },
      });

      if (attachmentIds.length > 0) {
        const updatedAttachments = await transaction.attachment.updateMany({
          where: {
            id: {
              in: attachmentIds,
            },
            echoId: null,
          },
          data: {
            echoId: echo.id,
          },
        });

        if (updatedAttachments.count !== attachmentIds.length) {
          throw badRequest(
            "echo_attachment_unavailable",
            "첨부할 수 없는 파일이 포함되어 있어요.",
          );
        }
      }

      return transaction.echo.findUniqueOrThrow({
        where: {
          id: echo.id,
        },
        include: echoInclude,
      });
    });

    return this.toEntity(created);
  }

  async findById(echoId: string): Promise<EchoWithReplyCount | undefined> {
    const echo = await this.prisma.echo.findUnique({
      where: {
        id: echoId,
      },
      include: echoInclude,
    });

    return echo === null ? undefined : this.toEntity(echo);
  }

  async listRootEchoes(
    query: ListRootEchoesQuery,
  ): Promise<EchoWithReplyCount[]> {
    const where: Prisma.EchoWhereInput = {
      parentEchoId: null,
      depth: 0,
      status: query.status,
    };

    if (query.search !== undefined) {
      where.body = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    const cursor = await this.findValidRootCursor(query.cursor, where);

    const rows = await this.prisma.echo.findMany({
      where: withCursorWindow(where, cursor),
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      take: query.limit,
      include: echoInclude,
    });

    return rows.map((row) => this.toEntity(row));
  }

  async listReplies(rootEchoId: string): Promise<EchoWithReplyCount[]> {
    const rows = await this.prisma.echo.findMany({
      where: {
        rootEchoId,
        status: "published",
      },
      orderBy: [
        {
          createdAt: "asc",
        },
        {
          id: "asc",
        },
      ],
      include: echoInclude,
    });

    return rows.map((row) => this.toEntity(row));
  }

  async updateBody(
    echoId: string,
    body: string,
    updatedAt: Date,
  ): Promise<EchoWithReplyCount> {
    const updated = await this.prisma.echo.update({
      where: {
        id: echoId,
      },
      data: {
        body,
        updatedAt,
      },
      include: echoInclude,
    });

    return this.toEntity(updated);
  }

  async archive(
    echoId: string,
    deletedAt: Date,
    deletedByActorId: string,
  ): Promise<EchoWithReplyCount> {
    const archived = await this.prisma.echo.update({
      where: {
        id: echoId,
      },
      data: {
        status: "archived",
        deletedAt,
        deletedByActorId,
        updatedAt: deletedAt,
      },
      include: echoInclude,
    });

    return this.toEntity(archived);
  }

  async restore(echoId: string, restoredAt: Date): Promise<EchoWithReplyCount> {
    const restored = await this.prisma.echo.update({
      where: {
        id: echoId,
      },
      data: {
        status: "published",
        deletedAt: null,
        deletedByActorId: null,
        updatedAt: restoredAt,
      },
      include: echoInclude,
    });

    return this.toEntity(restored);
  }

  private toEntity(row: PrismaEchoRow): EchoWithReplyCount {
    return {
      id: row.id,
      body: row.body,
      status: row.status,
      authorActorId: row.authorActorId,
      authorType: row.authorType,
      authorDisplayName: row.authorDisplayName,
      parentEchoId: row.parentEchoId ?? undefined,
      rootEchoId: row.rootEchoId ?? undefined,
      depth: row.depth,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
      deletedByActorId: row.deletedByActorId ?? undefined,
      replyCount: row._count.replies,
      attachments: row.attachments.map((attachment) => ({
        id: attachment.id,
        originalFileName: attachment.originalFileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        checksum: attachment.checksum,
        relativePath: attachment.relativePath,
        createdAt: attachment.createdAt,
      })),
    };
  }

  private async findValidRootCursor(
    cursor: string | undefined,
    where: Prisma.EchoWhereInput,
  ): Promise<PrismaRootCursorRow | undefined> {
    if (cursor === undefined) {
      return undefined;
    }

    const cursorEcho = await this.prisma.echo.findFirst({
      where: {
        ...where,
        id: cursor,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (cursorEcho === null) {
      throw badRequest(
        "echo_cursor_invalid",
        "목록 cursor 가 유효하지 않아요.",
      );
    }

    return cursorEcho;
  }
}

function withCursorWindow(
  where: Prisma.EchoWhereInput,
  cursor: PrismaRootCursorRow | undefined,
): Prisma.EchoWhereInput {
  if (cursor === undefined) {
    return where;
  }

  return {
    AND: [
      where,
      {
        OR: [
          {
            createdAt: {
              lt: cursor.createdAt,
            },
          },
          {
            createdAt: cursor.createdAt,
            id: {
              lt: cursor.id,
            },
          },
        ],
      },
    ],
  };
}
