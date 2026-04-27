import { Injectable } from "@nestjs/common";
import type {
  EchoAuthorType as PrismaEchoAuthorType,
  EchoStatus as PrismaEchoStatus,
} from "@prisma/client";
import type { PrismaService } from "../../../prisma/prisma.service.js";
import type {
  EchoEntity,
  EchoWithReplyCount,
} from "../../domain/echo.entity.js";
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
};

@Injectable()
export class PrismaEchoRepository implements EchoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(echo: EchoEntity): Promise<EchoWithReplyCount> {
    const created = await this.prisma.echo.create({
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

    return this.withReplyCount(created);
  }

  async findById(echoId: string): Promise<EchoWithReplyCount | undefined> {
    const echo = await this.prisma.echo.findUnique({
      where: {
        id: echoId,
      },
    });

    return echo === null ? undefined : this.withReplyCount(echo);
  }

  async listRootEchoes(
    query: ListRootEchoesQuery,
  ): Promise<EchoWithReplyCount[]> {
    const rows = await this.prisma.echo.findMany({
      where: {
        parentEchoId: null,
        depth: 0,
        status: query.status,
      },
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
    });

    return this.withReplyCount(archived);
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
    };
  }
}
