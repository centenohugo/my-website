import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { excerpt, isoDateTime } from "@/lib/content";
import { sql } from "@/lib/db";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { formatFullDate } from "@/lib/i18n/formatDate";
import { hasAdminSession, toShareToken } from "@/lib/share";
import { absoluteUrl } from "@/lib/site";
import JsonLd from "../../JsonLd";
import MarkdownContent from "../../MarkdownContent";
import { blogColors, blogLayout, blogTypography } from "../theme";

type PostDetail = {
  title: string;
  subtitle: string | null;
  content: string;
  title_es: string | null;
  subtitle_es: string | null;
  content_es: string | null;
  published_at: string | null;
  updated_at: string;
  image_url: string | null;
  status: "draft" | "published";
};

// generateMetadata and the page itself both need the post; cache() makes that
// one query per request instead of two.
const getPost = cache(async function getPost(
  slug: string,
  shareToken: string | null,
  isAdmin: boolean
): Promise<PostDetail | null> {
  const [post] = await sql<PostDetail[]>`
    select title, subtitle, content, title_es, subtitle_es, content_es,
           published_at, updated_at, image_url, status
    from posts
    where slug = ${slug}
      and (status = 'published' or ${isAdmin} or share_token = ${shareToken})
  `;
  return post ?? null;
});

/** Title/subtitle/body in the requested locale, falling back field by field. */
function localize(post: PostDetail, locale: "en" | "es") {
  const es = locale === "es";
  return {
    title: es && post.title_es ? post.title_es : post.title,
    subtitle: es && post.subtitle_es ? post.subtitle_es : post.subtitle,
    content: es && post.content_es ? post.content_es : post.content,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { share } = await searchParams;
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const post = await getPost(slug, toShareToken(share), await hasAdminSession());

  if (!post) return {};

  const { title, subtitle, content } = localize(post, locale);
  const description = subtitle ?? excerpt(content);
  const canonical = `/blog/${slug}`;

  // Share links point at unpublished drafts; keep them out of search indexes.
  if (share || post.status !== "published") {
    return { title, description, robots: { index: false, follow: false } };
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      // Agents ask for Markdown far more often than HTML. Advertising the
      // mirror saves them a scrape of the rendered page.
      types: { "text/markdown": `${canonical}.md` },
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonical),
      title,
      description,
      publishedTime: isoDateTime(post.published_at),
      modifiedTime: isoDateTime(post.updated_at),
      images: post.image_url ? [post.image_url] : undefined,
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);
  const shareToken = toShareToken((await searchParams).share);
  const isAdmin = await hasAdminSession();

  const post = await getPost(slug, shareToken, isAdmin);

  if (!post) {
    notFound();
  }

  const { title, subtitle, content } = localize(post, locale);

  return (
    <main className="pb-16" style={{ paddingTop: blogLayout.headerTopSpace }}>
      {post.status === "published" && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: subtitle ?? excerpt(content),
            url: absoluteUrl(`/blog/${slug}`),
            datePublished: isoDateTime(post.published_at),
            dateModified: isoDateTime(post.updated_at),
            inLanguage: locale,
            image: post.image_url ?? undefined,
            author: { "@type": "Person", name: t.about.name, url: absoluteUrl("/about") },
          }}
        />
      )}

      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full px-[44px] md:w-1/2 md:px-0">
          <div
            className="relative aspect-[3/2] w-full overflow-hidden md:aspect-auto md:h-[85vh]"
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
          />
        </div>

        <div
          className="flex w-full flex-col justify-center gap-3 py-8 md:w-1/2 md:py-0"
          style={{ paddingLeft: blogLayout.sidePadding, paddingRight: blogLayout.sidePadding }}
        >
          <span className="uppercase" style={blogTypography.postDate}>
            {post.status === "published" ? (
              <time dateTime={isoDateTime(post.published_at)}>
                {formatFullDate(post.published_at, locale)}
              </time>
            ) : (
              t.common.draftBadge
            )}
          </span>
          <h1 style={{ ...blogTypography.postTitle, textWrap: "pretty" }}>{title}</h1>
          {subtitle && (
            <p style={{ ...blogTypography.postSubtitle, textWrap: "pretty" }}>{subtitle}</p>
          )}
        </div>
      </div>

      <article
        className="mx-auto w-full max-w-3xl"
        style={{ paddingLeft: blogLayout.sidePadding, paddingRight: blogLayout.sidePadding }}
      >
        <hr className="my-8" style={{ borderColor: blogColors.dateMono }} />

        <MarkdownContent content={content} />
      </article>
    </main>
  );
}
