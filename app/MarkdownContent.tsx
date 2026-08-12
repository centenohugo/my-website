import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { siteColors, siteTypography } from "./theme";
import { parseYouTubeUrl, youTubeEmbedUrl, type YouTubeVideo } from "./youtube";

function YouTubeEmbed({ video }: { video: YouTubeVideo }) {
  return (
    <div
      className="my-2 w-full"
      style={{
        // A Short at the full 768px column would stand 1365px tall, so vertical
        // videos get a narrow centred frame instead of filling the measure.
        maxWidth: video.vertical ? "400px" : undefined,
        marginInline: video.vertical ? "auto" : undefined,
      }}
    >
      <iframe
        src={youTubeEmbedUrl(video)}
        title="YouTube video player"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full"
        style={{
          aspectRatio: video.vertical ? "9 / 16" : "16 / 9",
          border: "none",
          borderRadius: "3px",
          display: "block",
        }}
      />
    </div>
  );
}

/** The visible text of an autolinked URL is the URL itself; a labelled link differs. */
function linkText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("");
}

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
            // A bare YouTube URL alone on its own line becomes a player. Giving the
            // link a label is how you keep it a link.
            if (onlyChild && isValidElement(onlyChild) && "href" in (onlyChild.props as object)) {
              const { href, children: label } = onlyChild.props as {
                href?: string;
                children?: ReactNode;
              };
              const video = linkText(label) === href ? parseYouTubeUrl(href) : null;
              if (video) return <YouTubeEmbed video={video} />;
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
          // The markdown alt text does double duty: it is the visible caption
          // and the alt attribute. An image written without one is decorative,
          // and alt="" is how you say that — omitting the attribute instead
          // makes a screen reader read out the file name.
          //
          // This stays a plain <img> rather than next/image: the intrinsic
          // dimensions aren't known at render time, and body images are below
          // the fold, so lazy loading is the win available here.
          img: ({ src, alt }) => (
            <figure className="my-2 flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt ?? ""}
                loading="lazy"
                decoding="async"
                className="w-full"
                style={{ borderRadius: "3px" }}
              />
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
