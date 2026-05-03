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
};

const echoInclude = {
  attachments: {
    orderBy: {
      createdAt: "asc",
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

    return this.withReplyCount(created);
  }

  async findById(echoId: string): Promise<EchoWithReplyCount | undefined> {
    const echo = await this.prisma.echo.findUnique({
      where: {
        id: echoId,
      },
      include: echoInclude,
    });

    return echo === null ? undefined : this.withReplyCount(echo);
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

    const rows = await this.prisma.echo.findMany({
      where,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      ...(query.cursor === undefined
        ? {}
        : {
            cursor: {
              id: query.cursor,
            },
            skip: 1,
          }),
      take: query.limit,
      include: echoInclude,
    });

    return Promise.all(rows.map((row) => this.withReplyCount(row)));
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

    return Promise.all(rows.map((row) => this.withReplyCount(row)));
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

    return this.withReplyCount(updated);
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

    return this.withReplyCount(archived);
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

    return this.withReplyCount(restored);
  }

  private async withReplyCount(
    row: PrismaEchoRow,
  ): Promise<EchoWithReplyCount> {
    const replyCount = await this.prisma.echo.count({
      where: {
        parentEchoId: row.id,
        status: "published",
      },
    });

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
      replyCount,
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
}
