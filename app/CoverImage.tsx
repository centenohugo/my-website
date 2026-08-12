import Image from "next/image";

/**
 * The artwork on a card or an article header.
 *
 * These used to be CSS `background-image`, which cost three things: the URL was
 * invisible to the preload scanner (it isn't found until the stylesheet is
 * parsed, which delays LCP on the article header), no optimized/resized variant
 * was ever served, and there was no <img> for image search to index.
 *
 * `alt` is empty by design. Every place this renders sits next to the title it
 * belongs to — a card's own link text, or the <h1> beside the header image — so
 * the picture adds no information a screen reader isn't already given, and an
 * empty alt is the correct way to say so. Body images inside an article are
 * different: those carry the caption the author wrote (see MarkdownContent).
 */
export default function CoverImage({
  src,
  sizes,
  className,
  radius,
  fallbackColor,
  fallbackPattern,
  eager = false,
}: {
  src: string | null;
  /** Rendered width at each breakpoint, so the optimizer picks the right file. */
  sizes: string;
  /** Must establish a positioning context — `fill` needs a non-static parent. */
  className: string;
  radius: string;
  fallbackColor: string;
  fallbackPattern: string;
  /** Set on the article header image: it is the LCP element, so never lazy. */
  eager?: boolean;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: radius,
        backgroundColor: src ? "var(--background)" : fallbackColor,
        // The doodle pattern stands in for entries that have no artwork yet.
        backgroundImage: src ? undefined : fallbackPattern,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover object-center"
          // `priority` is deprecated in Next 16; eager + high fetchPriority is
          // the replacement for an above-the-fold LCP image.
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
        />
      )}
    </div>
  );
}
