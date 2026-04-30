import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type { EchoFeedItemViewModel } from "../model";

interface EchoCardProps {
  echo: EchoFeedItemViewModel;
}

export function EchoCard({ echo }: EchoCardProps) {
  return (
    <article className="echo-card">
      <div className="echo-card-header">
        <span className="echo-card-author">{echo.authorLabel}</span>
        <span className="caption-copy">{echo.createdAtLabel}</span>
        {echo.updatedLabel ? (
          <span className="caption-copy">{echo.updatedLabel}</span>
        ) : null}
        {echo.isArchived ? <Badge tone="muted">아카이브됨</Badge> : null}
      </div>
      <p className="echo-card-body">{echo.preview}</p>
      {echo.attachments.length > 0 ? (
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
      ) : null}
      <div className="echo-card-actions">
        <Button asChild size="sm" variant="secondary">
          <a href={`/echoes/${echo.id}`}>상세 보기</a>
        </Button>
        <span className="muted-copy">{echo.replyCountLabel}</span>
        <Button
          onClick={() => void navigator.clipboard?.writeText(echo.body)}
          size="sm"
          type="button"
          variant="ghost"
        >
          본문 복사
        </Button>
      </div>
    </article>
  );
}
