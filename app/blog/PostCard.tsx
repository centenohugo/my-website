import Link from "next/link";
import { blogLayout, blogTypography } from "./theme";

export type Post = {
  slug: string;
  title: string;
  subtitle: string | null;
  published_at: string | null;
  image_url: string | null;
};

function formatDate(published_at: string | null) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString("es-ES", { month: "short", year: "numeric" })
    .toUpperCase()
    .replace(".", "");
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col gap-[13px] text-inherit no-underline"
    >
      <div
        className="relative aspect-[3/2] w-full overflow-hidden"
        style={{
          borderRadius: blogLayout.thumbnailRadius,
          backgroundColor: blogLayout.thumbnailColor,
          backgroundImage: post.image_url
            ? `url(${post.image_url})`
            : blogLayout.thumbnailPattern,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={blogTypography.cardDate}>
          {formatDate(post.published_at)}
        </span>

        <h3 style={{ ...blogTypography.cardTitle, textWrap: "pretty" }}>
          {post.title}
        </h3>

        {post.subtitle && (
          <p style={{ ...blogTypography.cardSubtitle, textWrap: "pretty" }}>
            {post.subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
