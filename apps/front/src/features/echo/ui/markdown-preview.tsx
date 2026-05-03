import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ body }: { body: string }) {
  return (
    <div className="echo-markdown">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        skipHtml
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
