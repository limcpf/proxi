import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  createEchoRequestSchema,
  type EchoDetail,
  echoIdSchema,
  type ListEchoesResponse,
  listEchoesRequestSchema,
  updateEchoRequestSchema,
} from "@proxi/shared";
import { type EchoEntity, ownerActor } from "../domain/echo.entity.js";
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
} from "../domain/echo.errors.js";
import {
  ECHO_REPOSITORY,
  type EchoRepository,
} from "../ports/echo.repository.js";
import { toEchoDetail, toEchoSummary } from "./echo.mapper.js";

const listLimit = 20;

@Injectable()
export class EchoApplicationService {
  constructor(
    @Inject(ECHO_REPOSITORY)
    private readonly repository: EchoRepository,
  ) {}

  async createRoot(input: unknown): Promise<EchoDetail> {
    const request = parseRequest(createEchoRequestSchema, input);
    const attachmentIds = await this.validateAttachmentIds(
      request.attachmentIds,
    );

    if (request.parentEchoId !== undefined) {
      throw badRequest(
        "echo_root_parent_not_allowed",
        "root Echo 는 parentEchoId 를 가질 수 없어요.",
      );
    }

    const now = new Date();
    const created = await this.repository.create(
      {
        id: createEchoId(),
        body: request.body,
        status: "published",
        authorActorId: ownerActor.id,
        authorType: ownerActor.type,
        authorDisplayName: ownerActor.displayName,
        depth: 0,
        createdAt: now,
        updatedAt: now,
      },
      attachmentIds,
    );

    console.info("echo.created", { echoId: created.id });

    return toEchoDetail(created, []);
  }

  async listRootEchoes(input: unknown): Promise<ListEchoesResponse> {
    return this.listRootEchoesByStatus("published", input);
  }

  async listArchivedRootEchoes(input: unknown): Promise<ListEchoesResponse> {
    return this.listRootEchoesByStatus("archived", input);
  }

  private async listRootEchoesByStatus(
    status: "published" | "archived",
    input: unknown,
  ): Promise<ListEchoesResponse> {
    const request = parseRequest(listEchoesRequestSchema, input ?? {});
    const items = await this.repository.listRootEchoes({
      cursor: request.cursor,
      search: request.q,
      status,
      limit: listLimit + 1,
    });
    const visibleItems = items.slice(0, listLimit);

    return {
      items: visibleItems.map(toEchoSummary),
      nextCursor:
        items.length > listLimit ? visibleItems.at(-1)?.id : undefined,
    };
  }

  async getDetail(echoId: unknown): Promise<EchoDetail> {
    const id = parseRequest(echoIdSchema, echoId);
    const echo = await this.findRequired(id);
    const replies = await this.repository.listReplies(
      echo.rootEchoId ?? echo.id,
    );

    return toEchoDetail(echo, replies);
  }

  async update(echoId: unknown, input: unknown): Promise<EchoDetail> {
    const id = parseRequest(echoIdSchema, echoId);
    const request = parseRequest(updateEchoRequestSchema, input);
    const echo = await this.findRequired(id);

    assertOwnerCanMutate(echo.authorActorId);
    assertPublished(echo.status, "archived Echo 는 수정할 수 없어요.");

    const updated = await this.repository.updateBody(
      id,
      request.body,
      new Date(),
    );
    const replies = await this.repository.listReplies(
      updated.rootEchoId ?? updated.id,
    );

    console.info("echo.updated", { echoId: updated.id });

    return toEchoDetail(updated, replies);
  }

  async archive(echoId: unknown): Promise<void> {
    const id = parseRequest(echoIdSchema, echoId);
    const echo = await this.findRequired(id);

    assertOwnerCanMutate(echo.authorActorId);

    if (echo.status === "archived") {
      return;
    }

    const archived = await this.repository.archive(
      id,
      new Date(),
      ownerActor.id,
    );

    console.info("echo.archived", { echoId: archived.id });
  }

  async restore(echoId: unknown): Promise<EchoDetail> {
    const id = parseRequest(echoIdSchema, echoId);
    const echo = await this.findRequired(id);

    assertOwnerCanMutate(echo.authorActorId);

    if (echo.status === "published") {
      const replies = await this.repository.listReplies(
        echo.rootEchoId ?? echo.id,
      );

      return toEchoDetail(echo, replies);
    }

    const restored = await this.repository.restore(id, new Date());
    const replies = await this.repository.listReplies(
      restored.rootEchoId ?? restored.id,
    );

    console.info("echo.restored", { echoId: restored.id });

    return toEchoDetail(restored, replies);
  }

  async createReply(
    parentEchoId: unknown,
    input: unknown,
  ): Promise<EchoDetail> {
    const parentId = parseRequest(echoIdSchema, parentEchoId);
    const request = parseRequest(createEchoRequestSchema, input);
    const attachmentIds = await this.validateAttachmentIds(
      request.attachmentIds,
    );
    const parent = await this.findRequired(parentId);

    assertPublished(parent.status, "아카이브된 Echo 에는 댓글을 달 수 없어요.");

    if (parent.depth >= 1) {
      throw conflict(
        "echo_reply_depth_exceeded",
        "첫 버전에서는 댓글에 다시 답글을 달 수 없어요.",
      );
    }

    const now = new Date();
    const created = await this.repository.create(
      {
        id: createEchoId(),
        body: request.body,
        status: "published",
        authorActorId: ownerActor.id,
        authorType: ownerActor.type,
        authorDisplayName: ownerActor.displayName,
        parentEchoId: parent.id,
        rootEchoId: parent.rootEchoId ?? parent.id,
        depth: 1,
        createdAt: now,
        updatedAt: now,
      },
      attachmentIds,
    );

    console.info("echo.created", {
      echoId: created.id,
      parentEchoId: parent.id,
    });

    return toEchoDetail(created, []);
  }

  private async findRequired(echoId: string) {
    const echo = await this.repository.findById(echoId);

    if (echo === undefined) {
      throw notFound("echo_not_found", "찾는 Echo 가 없어요.");
    }

    return echo;
  }

  private async validateAttachmentIds(attachmentIds: string[]) {
    const uniqueAttachmentIds = Array.from(new Set(attachmentIds));
    const attachableCount =
      await this.repository.countAttachableAttachments(uniqueAttachmentIds);

    if (attachableCount !== uniqueAttachmentIds.length) {
      throw badRequest(
        "echo_attachment_unavailable",
        "첨부할 수 없는 파일이 포함되어 있어요.",
      );
    }

    return uniqueAttachmentIds;
  }
}

function createEchoId() {
  return `echo_${randomUUID()}`;
}

interface SafeParseSchema<TOutput> {
  safeParse(input: unknown):
    | {
        success: true;
        data: TOutput;
      }
    | {
        success: false;
        error: {
          issues: {
            message: string;
          }[];
        };
      };
}

function parseRequest<TOutput>(
  schema: SafeParseSchema<TOutput>,
  input: unknown,
): TOutput {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw badRequest("echo_validation_failed", getFirstIssue(result.error));
  }

  return result.data;
}

function getFirstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Echo 요청을 확인해 주세요.";
}

function assertOwnerCanMutate(authorActorId: string) {
  if (authorActorId !== ownerActor.id) {
    throw forbidden("echo_permission_denied", "이 Echo 를 바꿀 권한이 없어요.");
  }
}

function assertPublished(status: EchoEntity["status"], message: string) {
  if (status !== "published") {
    throw conflict("echo_not_published", message);
  }
}
