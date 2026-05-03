import type {
  EchoAttachmentEntity,
  EchoEntity,
  EchoWithReplyCount,
} from "../domain/echo.entity.js";
import { badRequest } from "../domain/echo.errors.js";
import type {
  EchoRepository,
  ListRootEchoesQuery,
} from "../ports/echo.repository.js";

// 테스트 전용 EchoRepository fake 이며 런타임 모듈에 바인딩하면 안 된다.
export class FakeEchoRepository implements EchoRepository {
  private readonly echoes = new Map<string, EchoEntity>();
  private readonly attachments = new Map<
    string,
    EchoAttachmentEntity & { echoId?: string }
  >();

  addAttachmentForTest(attachment: EchoAttachmentEntity) {
    this.attachments.set(attachment.id, { ...attachment });
  }

  async countAttachableAttachments(attachmentIds: string[]): Promise<number> {
    return this.countAttachableAttachmentIds(attachmentIds);
  }

  async create(
    echo: EchoEntity,
    attachmentIds: string[] = [],
  ): Promise<EchoWithReplyCount> {
    if (
      this.countAttachableAttachmentIds(attachmentIds) !== attachmentIds.length
    ) {
      throw badRequest(
        "echo_attachment_unavailable",
        "첨부할 수 없는 파일이 포함되어 있어요.",
      );
    }

    this.echoes.set(echo.id, { ...echo });
    this.attachAttachments(echo.id, attachmentIds);

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
          echo.status === query.status &&
          matchesSearch(echo, query.search),
      )
      .sort(compareNewestFirst);

    const startIndex = getCursorStartIndex(query.cursor, sorted);

    return sorted
      .slice(startIndex, startIndex + query.limit)
      .map((echo) => this.withReplyCount(echo));
  }

  async listReplies(rootEchoId: string): Promise<EchoWithReplyCount[]> {
    return Array.from(this.echoes.values())
      .filter(
        (echo) => echo.rootEchoId === rootEchoId && echo.status === "published",
      )
      .sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
      )
      .map((echo) => this.withReplyCount(echo));
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

  async restore(echoId: string, restoredAt: Date): Promise<EchoWithReplyCount> {
    const echo = this.requireEcho(echoId);
    const restored = {
      ...echo,
      status: "published" as const,
      deletedAt: undefined,
      deletedByActorId: undefined,
      updatedAt: restoredAt,
    };

    this.echoes.set(echoId, restored);

    return this.withReplyCount(restored);
  }

  private requireEcho(echoId: string) {
    const echo = this.echoes.get(echoId);

    if (echo === undefined) {
      throw new Error(`Echo ${echoId} was not found in fake repository.`);
    }

    return echo;
  }

  private withReplyCount(echo: EchoEntity): EchoWithReplyCount {
    return {
      ...echo,
      replyCount: this.countReplies(echo.id),
      attachments: this.listAttachments(echo.id),
    };
  }

  private countReplies(echoId: string) {
    return Array.from(this.echoes.values()).filter(
      (echo) => echo.parentEchoId === echoId && echo.status === "published",
    ).length;
  }

  private countAttachableAttachmentIds(attachmentIds: string[]) {
    return attachmentIds.filter((attachmentId) => {
      const attachment = this.attachments.get(attachmentId);

      return attachment !== undefined && attachment.echoId === undefined;
    }).length;
  }

  private listAttachments(echoId: string) {
    return Array.from(this.attachments.values())
      .filter((attachment) => attachment.echoId === echoId)
      .map(({ echoId: _echoId, ...attachment }) => attachment);
  }

  private attachAttachments(echoId: string, attachmentIds: string[]) {
    for (const attachmentId of attachmentIds) {
      const attachment = this.attachments.get(attachmentId);

      if (attachment !== undefined && attachment.echoId === undefined) {
        this.attachments.set(attachmentId, {
          ...attachment,
          echoId,
        });
      }
    }
  }
}

function compareNewestFirst(left: EchoEntity, right: EchoEntity) {
  const dateDiff = right.createdAt.getTime() - left.createdAt.getTime();

  return dateDiff === 0 ? right.id.localeCompare(left.id) : dateDiff;
}

function matchesSearch(echo: EchoEntity, search: string | undefined) {
  if (search === undefined) {
    return true;
  }

  return echo.body.toLowerCase().includes(search.toLowerCase());
}

function getCursorStartIndex(
  cursor: string | undefined,
  sortedEchoes: EchoEntity[],
) {
  if (cursor === undefined) {
    return 0;
  }

  const cursorIndex = sortedEchoes.findIndex((echo) => echo.id === cursor);

  if (cursorIndex === -1) {
    throw badRequest("echo_cursor_invalid", "목록 cursor 가 유효하지 않아요.");
  }

  return cursorIndex + 1;
}
