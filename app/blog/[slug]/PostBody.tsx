import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogColors, blogTypography } from "../theme";

export default function PostBody({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p style={blogTypography.bodyParagraph}>{children}</p>,
          h1: ({ children }) => (
            <h1 className="mt-4" style={blogTypography.bodyHeading1}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-4" style={blogTypography.bodyHeading2}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-2" style={blogTypography.bodyHeading3}>
              {children}
            </h3>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{ color: blogColors.textCardTitle, textDecoration: "underline" }}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5" style={blogTypography.bodyParagraph}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5" style={blogTypography.bodyParagraph}>
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-2 pl-4"
              style={{ ...blogTypography.bodyQuote, borderColor: blogColors.dateMono }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code
              className="rounded px-1 py-0.5"
              style={{ ...blogTypography.bodyCode, backgroundColor: blogColors.paperElevated }}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre
              className="overflow-x-auto rounded p-4"
              style={{ ...blogTypography.bodyCode, backgroundColor: blogColors.paperElevated }}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ""} className="w-full rounded" style={{ borderRadius: "3px" }} />
          ),
          hr: () => <hr style={{ borderColor: blogColors.dateMono }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
