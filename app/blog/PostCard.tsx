"use client";

import Link from "next/link";
import { formatCardDate } from "@/lib/formatDate";
import CoverImage from "../CoverImage";
import { blogLayout, blogTypography } from "./theme";

export type Post = {
  slug: string;
  title: string;
  subtitle: string | null;
  published_at: string | null;
  image_url: string | null;
};

export default function PostCard({
  post,
  eager = false,
}: {
  post: Post;
  /** Set on the first card in the grid — it is the listing page's LCP element. */
  eager?: boolean;
}) {
  const { title, subtitle } = post;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col gap-[13px] text-inherit no-underline"
    >
      <CoverImage
        src={post.image_url}
        className="relative aspect-[3/2] w-full overflow-hidden"
        radius={blogLayout.thumbnailRadius}
        fallbackColor={blogLayout.thumbnailColor}
        fallbackPattern={blogLayout.thumbnailPattern}
        // Grid is 1 column, then 2 at sm, then 3 at lg inside a max-w-6xl page.
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        eager={eager}
      />

      <div className="flex flex-col gap-1.5">
        <span className="uppercase" style={blogTypography.cardDate}>
          {formatCardDate(post.published_at)}
        </span>

        <h3 style={{ ...blogTypography.cardTitle, textWrap: "pretty" }}>
          {title}
        </h3>

        {subtitle && (
          <p style={{ ...blogTypography.cardSubtitle, textWrap: "pretty" }}>
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
