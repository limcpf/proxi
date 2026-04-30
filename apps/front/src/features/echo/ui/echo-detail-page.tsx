import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  archiveEcho,
  createReply,
  getEcho,
  restoreEcho,
  updateEcho,
  uploadAttachmentFile,
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
    mutationFn: async (input: { body: string; files: File[] }) => {
      const attachments = await Promise.all(
        input.files.map((file) => uploadAttachmentFile(file)),
      );

      return createReply(echoId, {
        body: input.body,
        attachmentIds: attachments.map((attachment) => attachment.id),
      });
    },
    onSuccess: () => invalidateEchoQueries(queryClient, echoId),
  });

  if (detailQuery.isPending) {
    return (
      <main className="page-shell">
        <p className="status-note">메아리를 불러오는 중이에요.</p>
      </main>
    );
  }

  if (detailQuery.isError) {
    return (
      <main className="page-shell">
        <section className="surface-panel grid gap-4">
          <p className="section-heading">
            찾는 Echo 가 없어요. 피드로 돌아갈까요?
          </p>
          <Button asChild variant="secondary">
            <a href="/echoes">피드로 돌아가기</a>
          </Button>
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
    <main className="page-shell echo-page">
      <section className="surface-panel">
        <div className="action-strip">
          <Button asChild size="sm" variant="ghost">
            <a href="/echoes">피드로 돌아가기</a>
          </Button>
          {echo.isArchived ? (
            <Badge tone="muted">아카이브된 Echo 입니다.</Badge>
          ) : null}
        </div>

        <article className="grid gap-4">
          <div>
            <p className="kicker">{echo.authorLabel}</p>
            <h1 className="section-heading">Echo 상세</h1>
            <p className="caption-copy">
              {echo.createdAtLabel}
              {echo.updatedLabel ? ` · ${echo.updatedLabel}` : ""}
            </p>
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
            <div className="grid gap-3">
              <MarkdownPreview body={detailQuery.data.body} />
              <AttachmentList echo={echo} />
            </div>
          )}

          <div className="action-strip">
            <Button
              disabled={echo.isArchived}
              onClick={() => setIsEditing(true)}
              size="sm"
              type="button"
              variant="tertiary"
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
          {mutationError ? (
            <p className="status-note status-note-danger">
              {mutationErrorMessage}
            </p>
          ) : null}
        </article>
      </section>

      <section className="surface-panel">
        <div>
          <p className="kicker">Replies</p>
          <h2 className="section-heading">{echo.replyCountLabel}</h2>
        </div>

        {echo.replies.length === 0 ? (
          <p className="status-note">아직 이어진 메아리가 없어요.</p>
        ) : (
          <div className="list-grid">
            {echo.replies.map((reply) => (
              <article className="echo-card" key={reply.id}>
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
