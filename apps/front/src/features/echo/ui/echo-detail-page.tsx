import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  archiveEcho,
  createReplyWithFiles,
  EchoApiError,
  getEcho,
  restoreEcho,
  updateEcho,
} from "../api/echo.api";
import { echoEditDraftKey, echoReplyDraftKey } from "../lib/draft-storage";
import {
  type EchoFeedItemViewModel,
  echoQueryKeys,
  toEchoViewModel,
} from "../model";
import { EchoComposer } from "./echo-composer";
import { MarkdownPreview } from "./markdown-preview";

interface EchoDetailPageProps {
  echoId: string;
}

export function EchoDetailPage({ echoId }: EchoDetailPageProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const detailQuery = useQuery({
    queryKey: echoQueryKeys.detail(echoId),
    queryFn: () => getEcho(echoId),
  });
  const updateMutation = useMutation({
    mutationFn: (body: string) => updateEcho(echoId, { body }),
    onSuccess: () => {
      setIsEditing(false);
      invalidateEchoQueries(queryClient, echoId);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => archiveEcho(echoId),
    onSuccess: () => {
      setIsDeleteOpen(false);
      invalidateEchoQueries(queryClient, echoId);
      queryClient.invalidateQueries({
        queryKey: ["echoes", "archive"],
      });
    },
  });
  const restoreMutation = useMutation({
    mutationFn: () => restoreEcho(echoId),
    onSuccess: () => {
      invalidateEchoQueries(queryClient, echoId);
      queryClient.invalidateQueries({
        queryKey: ["echoes", "archive"],
      });
    },
  });
  const replyMutation = useMutation({
    mutationFn: (input: { body: string; files: File[] }) =>
      createReplyWithFiles(echoId, input),
    onSuccess: () => invalidateEchoQueries(queryClient, echoId),
  });

  if (detailQuery.isPending) {
    return (
      <main className="page-shell echo-page detail-page">
        <p className="status-note">메아리를 불러오는 중이에요.</p>
      </main>
    );
  }

  if (detailQuery.isError) {
    const isNotFound =
      detailQuery.error instanceof EchoApiError &&
      detailQuery.error.code === "echo_not_found";

    return (
      <main className="page-shell echo-page detail-page">
        <section className="surface-panel">
          <p className="section-heading">
            {isNotFound
              ? "찾는 Echo 가 없어요. 피드로 돌아갈까요?"
              : "Echo 를 불러오지 못했어요."}
          </p>
          {isNotFound ? null : (
            <p className="status-note">잠시 뒤 다시 시도해 주세요.</p>
          )}
          <div className="action-strip">
            {isNotFound ? null : (
              <Button
                onClick={() => {
                  void detailQuery.refetch();
                }}
                type="button"
                variant="primary"
              >
                다시 시도
              </Button>
            )}
            <Button asChild variant="secondary">
              <a href="/echoes">피드로 돌아가기</a>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const echo = toEchoViewModel(detailQuery.data);
  const mutationError =
    updateMutation.error ??
    deleteMutation.error ??
    restoreMutation.error ??
    replyMutation.error;
  const mutationErrorMessage =
    mutationError instanceof Error
      ? mutationError.message
      : "메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.";

  return (
    <main className="page-shell echo-page detail-page">
      <section className="surface-panel">
        <div className="detail-toolbar">
          <Button asChild size="sm" variant="ghost">
            <a href="/echoes">피드로 돌아가기</a>
          </Button>
          {echo.isArchived ? (
            <Badge tone="muted">아카이브된 Echo 입니다.</Badge>
          ) : null}
        </div>

        <article className="grid gap-3">
          <h1 className="sr-only">Echo 상세</h1>
          <div className="detail-meta">
            <span className="echo-card-author">{echo.authorLabel}</span>
            <span className="caption-copy">
              {echo.createdAtLabel}
              {echo.updatedLabel ? ` · ${echo.updatedLabel}` : ""}
            </span>
          </div>

          {isEditing ? (
            <EchoComposer
              draftKey={echoEditDraftKey(echo.id)}
              initialBody={detailQuery.data.body}
              mode="edit"
              onCancel={() => setIsEditing(false)}
              onSubmit={(body) => updateMutation.mutateAsync(body)}
            />
          ) : (
            <div className="detail-body">
              <MarkdownPreview body={detailQuery.data.body} />
              <AttachmentList echo={echo} />
            </div>
          )}

          <div className="detail-actions">
            <div className="action-strip">
              <Button
                disabled={echo.isArchived}
                onClick={() => setIsEditing(true)}
                size="sm"
                type="button"
                variant="secondary"
              >
                수정
              </Button>
              <Button
                disabled={echo.isArchived || deleteMutation.isPending}
                onClick={() => setIsDeleteOpen(true)}
                size="sm"
                type="button"
                variant="danger"
              >
                삭제
              </Button>
              {echo.isArchived ? (
                <Button
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate()}
                  size="sm"
                  type="button"
                  variant="primary"
                >
                  복구
                </Button>
              ) : null}
            </div>
          </div>
          {mutationError ? (
            <p className="status-note status-note-danger">
              {mutationErrorMessage}
            </p>
          ) : null}
        </article>
      </section>

      <section className="reply-panel">
        <div className="feed-toolbar">
          <div className="feed-title-row">
            <h2 className="feed-title">댓글</h2>
            <span className="feed-count">{echo.replyCountLabel}</span>
          </div>
        </div>

        {echo.replies.length === 0 ? (
          <p className="status-note">아직 이어진 메아리가 없어요.</p>
        ) : (
          <div className="reply-list">
            {echo.replies.map((reply) => (
              <article className="reply-card" key={reply.id}>
                <p className="caption-copy">
                  {reply.authorLabel} · {reply.createdAtLabel}
                </p>
                <MarkdownPreview body={reply.body} />
                <AttachmentList echo={reply} />
              </article>
            ))}
          </div>
        )}

        {echo.isArchived ? (
          <p className="status-note">
            아카이브된 Echo 에는 새 댓글을 달 수 없어요.
          </p>
        ) : (
          <EchoComposer
            disabled={replyMutation.isPending}
            draftKey={echoReplyDraftKey(echo.id)}
            mode="reply"
            onSubmit={(body, files) =>
              replyMutation.mutateAsync({ body, files })
            }
          />
        )}
      </section>

      {isDeleteOpen ? (
        <section
          aria-modal="true"
          className="echo-modal-backdrop"
          role="dialog"
        >
          <div className="echo-modal">
            <h2 className="section-heading">이 Echo 를 아카이브로 보낼까요?</h2>
            <p className="muted-copy">
              아카이브에서 다시 볼 수 있지만, 피드에서는 사라지고 새 댓글은
              막힙니다.
            </p>
            <div className="action-strip">
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                type="button"
                variant="danger"
              >
                아카이브로 보내기
              </Button>
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => setIsDeleteOpen(false)}
                type="button"
                variant="secondary"
              >
                취소
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function AttachmentList({ echo }: { echo: EchoFeedItemViewModel }) {
  if (echo.attachments.length === 0) {
    return null;
  }

  return (
    <div className="attachment-list">
      {echo.attachments.map((attachment) => (
        <a
          className="attachment-chip"
          href={attachment.downloadUrl}
          key={attachment.id}
        >
          {attachment.originalFileName}
        </a>
      ))}
    </div>
  );
}

function invalidateEchoQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  echoId: string,
) {
  queryClient.invalidateQueries({
    queryKey: echoQueryKeys.detail(echoId),
  });
  queryClient.invalidateQueries({
    queryKey: ["echoes", "list"],
  });
}
