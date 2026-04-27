import type {
  EchoEntity,
  EchoWithReplyCount,
} from "../../domain/echo.entity.js";
import type {
  EchoRepository,
  ListRootEchoesQuery,
} from "../../ports/echo.repository.js";

export class InMemoryEchoRepository implements EchoRepository {
  private readonly echoes = new Map<string, EchoEntity>();

  async create(echo: EchoEntity): Promise<EchoWithReplyCount> {
    this.echoes.set(echo.id, { ...echo });

    return this.withReplyCount(echo);
  }

  async findById(echoId: string): Promise<EchoWithReplyCount | undefined> {
    const echo = this.echoes.get(echoId);

    return echo === undefined ? undefined : this.withReplyCount(echo);
  }

  async listRootEchoes(
    query: ListRootEchoesQuery,
  ): Promise<EchoWithReplyCount[]> {
    const sorted = Array.from(this.echoes.values())
      .filter(
        (echo) =>
          echo.depth === 0 &&
          echo.parentEchoId === undefined &&
          echo.status === query.status,
      )
      .sort(compareNewestFirst);

    const startIndex =
      query.cursor === undefined
        ? 0
        : Math.max(sorted.findIndex((echo) => echo.id === query.cursor) + 1, 0);

    return sorted.slice(startIndex, startIndex + query.limit).map((echo) => ({
      ...echo,
      replyCount: this.countReplies(echo.id),
    }));
  }

  async listReplies(rootEchoId: string): Promise<EchoWithReplyCount[]> {
    return Array.from(this.echoes.values())
      .filter(
        (echo) => echo.rootEchoId === rootEchoId && echo.status === "published",
      )
      .sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
      )
      .map((echo) => ({
        ...echo,
        replyCount: this.countReplies(echo.id),
      }));
  }

  async updateBody(
    echoId: string,
    body: string,
    updatedAt: Date,
  ): Promise<EchoWithReplyCount> {
    const echo = this.requireEcho(echoId);
    const updated = {
      ...echo,
      body,
      updatedAt,
    };

    this.echoes.set(echoId, updated);

    return this.withReplyCount(updated);
  }

  async archive(
    echoId: string,
    deletedAt: Date,
    deletedByActorId: string,
  ): Promise<EchoWithReplyCount> {
    const echo = this.requireEcho(echoId);
    const archived = {
      ...echo,
      status: "archived" as const,
      deletedAt,
      deletedByActorId,
      updatedAt: deletedAt,
    };

    this.echoes.set(echoId, archived);

    return this.withReplyCount(archived);
  }

  private requireEcho(echoId: string) {
    const echo = this.echoes.get(echoId);

    if (echo === undefined) {
      throw new Error(`Echo ${echoId} was not found in memory repository.`);
    }

    return echo;
  }

  private withReplyCount(echo: EchoEntity): EchoWithReplyCount {
    return {
      ...echo,
      replyCount: this.countReplies(echo.id),
    };
  }

  private countReplies(echoId: string) {
    return Array.from(this.echoes.values()).filter(
      (echo) => echo.parentEchoId === echoId && echo.status === "published",
    ).length;
  }
}

function compareNewestFirst(left: EchoEntity, right: EchoEntity) {
  const dateDiff = right.createdAt.getTime() - left.createdAt.getTime();

  return dateDiff === 0 ? right.id.localeCompare(left.id) : dateDiff;
}
