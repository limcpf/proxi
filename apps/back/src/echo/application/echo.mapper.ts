import type {
  EchoDetail,
  EchoSummary,
  PersistedEchoStatus,
} from "@proxi/shared";
import { echoDetailSchema, echoSummarySchema } from "@proxi/shared";
import type { EchoWithReplyCount } from "../domain/echo.entity.js";

export function toEchoSummary(echo: EchoWithReplyCount): EchoSummary {
  return echoSummarySchema.parse({
    id: echo.id,
    body: echo.body,
    status: echo.status,
    author: {
      id: echo.authorActorId,
      type: echo.authorType,
      displayName: echo.authorDisplayName,
    },
    parentEchoId: echo.parentEchoId,
    rootEchoId: echo.rootEchoId,
    replyCount: echo.replyCount,
    createdAt: echo.createdAt.toISOString(),
    updatedAt: echo.updatedAt.toISOString(),
    deletedAt: echo.deletedAt?.toISOString(),
  });
}

export function toEchoDetail(
  echo: EchoWithReplyCount,
  replies: EchoWithReplyCount[],
): EchoDetail {
  return echoDetailSchema.parse({
    ...toEchoSummary(echo),
    replies: replies.map(toEchoSummary),
  });
}

export function parsePersistedStatus(value: unknown): PersistedEchoStatus {
  return value === "archived" ? "archived" : "published";
}
