"use client";

import Link from "next/link";
import { formatCardDate } from "@/lib/i18n/formatDate";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { blogLayout, blogTypography } from "./theme";

export type Post = {
  slug: string;
  title: string;
  subtitle: string | null;
  title_es?: string | null;
  subtitle_es?: string | null;
  published_at: string | null;
  image_url: string | null;
};

export default function PostCard({ post }: { post: Post }) {
  const { locale } = useLocale();
  const title = locale === "es" && post.title_es ? post.title_es : post.title;
  const subtitle = locale === "es" && post.subtitle_es ? post.subtitle_es : post.subtitle;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col gap-[13px] text-inherit no-underline"
    >
      <div
        className="relative aspect-[3/2] w-full overflow-hidden"
        style={{
          borderRadius: blogLayout.thumbnailRadius,
          backgroundColor: post.image_url
            ? "var(--background)"
            : blogLayout.thumbnailColor,
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
          {formatCardDate(post.published_at, locale)}
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
