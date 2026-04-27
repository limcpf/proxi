import type { ReactNode } from "react";

export function MarkdownPreview({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((block) => ({
    key: `block-${block.length}-${block.slice(0, 24)}`,
    text: block,
  }));

  return (
    <div className="echo-markdown">
      {blocks.map((block) => (
        <p key={block.key}>{renderInline(block.text)}</p>
      ))}
    </div>
  );
}

function renderInline(block: string): ReactNode[] {
  let cursor = 0;
  const parts = block
    .split(/(`[^`]+`|#e_[A-Za-z0-9_-]+|@[A-Za-z0-9_-]+)/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      const start = block.indexOf(part, cursor);
      cursor = start + part.length;

      return {
        key: `inline-${start}-${part}`,
        text: part,
      };
    });

  return parts.map((part) => {
    if (part.text.startsWith("`") && part.text.endsWith("`")) {
      return (
        <code key={part.key} className="echo-inline-code">
          {part.text.slice(1, -1)}
        </code>
      );
    }

    if (part.text.startsWith("#e_") || part.text.startsWith("@")) {
      return (
        <span key={part.key} className="echo-reference">
          {part.text}
        </span>
      );
    }

    return part.text;
  });
}
