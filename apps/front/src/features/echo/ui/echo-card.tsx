import { Badge } from "../../../components/ui/badge";
import type { EchoFeedItemViewModel } from "../model";

interface EchoCardProps {
  echo: EchoFeedItemViewModel;
}

export function EchoCard({ echo }: EchoCardProps) {
  return (
    <article className="echo-card">
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
      <div className="echo-card-footer">
        <div className="echo-card-meta">
          <span className="echo-card-author">{echo.authorLabel}</span>
          <span>{echo.createdAtLabel}</span>
          {echo.updatedLabel ? <span>{echo.updatedLabel}</span> : null}
          <span>{echo.replyCountLabel}</span>
          {echo.isArchived ? <Badge tone="muted">아카이브됨</Badge> : null}
        </div>
        <div className="echo-card-actions">
          <a className="echo-card-link" href={`/echoes/${echo.id}`}>
            상세
          </a>
          <button
            className="echo-card-link"
            onClick={() => void navigator.clipboard?.writeText(echo.body)}
            type="button"
          >
            복사
          </button>
        </div>
      </div>
    </article>
  );
}
