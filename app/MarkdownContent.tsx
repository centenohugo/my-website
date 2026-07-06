import { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { siteColors, siteTypography } from "./theme";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => {
            // An image on its own line is parsed as a paragraph containing a single
            // <img>. Our img renderer returns a <figure>, which isn't valid inside <p>,
            // so unwrap it here to avoid the browser silently correcting the DOM.
            const items = Children.toArray(children);
            const onlyChild = items.length === 1 ? items[0] : null;
            if (onlyChild && isValidElement(onlyChild) && "src" in (onlyChild.props as object)) {
              return <>{onlyChild}</>;
            }
            return <p style={siteTypography.bodyParagraph}>{children}</p>;
          },
          h1: ({ children }) => (
            <h1 className="mt-4" style={siteTypography.bodyHeading1}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-4" style={siteTypography.bodyHeading2}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-2" style={siteTypography.bodyHeading3}>
              {children}
            </h3>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{ color: siteColors.textCardTitle, textDecoration: "underline" }}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5" style={siteTypography.bodyParagraph}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5" style={siteTypography.bodyParagraph}>
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-2 pl-4"
              style={{ ...siteTypography.bodyQuote, borderColor: siteColors.dateMono }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code
              className="rounded px-1 py-0.5"
              style={{ ...siteTypography.bodyCode, backgroundColor: siteColors.paperElevated }}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre
              className="overflow-x-auto rounded p-4"
              style={{ ...siteTypography.bodyCode, backgroundColor: siteColors.paperElevated }}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            <figure className="my-2 flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt ?? ""} className="w-full" style={{ borderRadius: "3px" }} />
              {alt && <figcaption style={siteTypography.bodyCaption}>{alt}</figcaption>}
            </figure>
          ),
          hr: () => <hr style={{ borderColor: siteColors.dateMono }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
