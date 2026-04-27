import type {
  EchoDetail,
  EchoId,
  EchoStatus,
  EchoSummary,
  PersistedEchoStatus,
} from "@proxi/shared";

export interface EchoFeedItemViewModel {
  id: EchoId;
  body: string;
  preview: string;
  status: EchoStatus;
  authorLabel: string;
  replyCountLabel: string;
  createdAtLabel: string;
  updatedLabel?: string;
  isArchived: boolean;
}

export interface EchoViewModel extends EchoFeedItemViewModel {
  replies: EchoFeedItemViewModel[];
}

export const echoQueryKeys = {
  list: (params: { cursor?: string; status: PersistedEchoStatus }) =>
    ["echoes", "list", params] as const,
  detail: (echoId: string) => ["echoes", "detail", echoId] as const,
  archive: (params: { cursor?: string }) =>
    ["echoes", "archive", params] as const,
};

export function toEchoFeedItemViewModel(
  echo: EchoSummary,
): EchoFeedItemViewModel {
  return {
    id: echo.id,
    body: echo.body,
    preview: createPreview(echo.body),
    status: echo.status,
    authorLabel:
      echo.author.type === "agent"
        ? `${echo.author.displayName} Agent`
        : echo.author.displayName,
    replyCountLabel:
      echo.replyCount === 0 ? "댓글 없음" : `댓글 ${echo.replyCount}개`,
    createdAtLabel: formatDateTime(echo.createdAt),
    updatedLabel:
      echo.updatedAt > echo.createdAt
        ? `수정됨 ${formatDateTime(echo.updatedAt)}`
        : undefined,
    isArchived: echo.status === "archived",
  };
}

export function toEchoViewModel(echo: EchoDetail): EchoViewModel {
  return {
    ...toEchoFeedItemViewModel(echo),
    replies: echo.replies.map(toEchoFeedItemViewModel),
  };
}

function createPreview(body: string) {
  const compact = body.replace(/\s+/g, " ").trim();

  return compact.length > 160 ? `${compact.slice(0, 157)}...` : compact;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
