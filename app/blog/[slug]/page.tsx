import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { toExcerpt } from "@/lib/excerpt";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { formatFullDate } from "@/lib/i18n/formatDate";
import { toIsoString } from "@/lib/publishedDate";
import { hasAdminSession, toShareToken } from "@/lib/share";
import { absoluteUrl, AUTHOR_NAME, AUTHOR_PROFILES, SITE_URL } from "@/lib/site";
import CoverImage from "../../CoverImage";
import JsonLd from "../../JsonLd";
import MarkdownContent from "../../MarkdownContent";
import { blogColors, blogLayout, blogTypography } from "../theme";
import { getPost, type PostDetail } from "./getPost";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** The Spanish column when it exists and Spanish is selected, else the original. */
function localized(post: PostDetail, locale: "en" | "es") {
  const useEs = locale === "es";
  return {
    title: useEs && post.title_es ? post.title_es : post.title,
    subtitle: useEs && post.subtitle_es ? post.subtitle_es : post.subtitle,
    content: useEs && post.content_es ? post.content_es : post.content,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const shareToken = toShareToken((await searchParams).share);
  const isAdmin = await hasAdminSession();
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  const post = await getPost(slug, isAdmin, shareToken);
  if (!post) return {};

  const { title, subtitle, content } = localized(post, locale);
  const description = subtitle || toExcerpt(content);
  const url = absoluteUrl(`/blog/${slug}`);

  // A draft is only reachable through a share link or an admin session. Either
  // way it is not public, so it must never enter an index.
  const isPublic = post.status === "published" && !shareToken;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    robots: isPublic ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: toIsoString(post.published_at),
      modifiedTime: toIsoString(post.updated_at),
      authors: [AUTHOR_NAME],
      images: post.image_url ? [post.image_url] : undefined,
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);
  const shareToken = toShareToken((await searchParams).share);
  const isAdmin = await hasAdminSession();

  const post = await getPost(slug, isAdmin, shareToken);

  if (!post) {
    notFound();
  }

  const { title, subtitle, content } = localized(post, locale);
  const isPublic = post.status === "published" && !shareToken;

  return (
    <main className="pb-16" style={{ paddingTop: blogLayout.headerTopSpace }}>
      {isPublic && (
        <>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "@id": absoluteUrl(`/blog/${slug}#article`),
              mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
              headline: title,
              description: subtitle || toExcerpt(content),
              inLanguage: locale,
              datePublished: toIsoString(post.published_at),
              dateModified: toIsoString(post.updated_at ?? post.published_at),
              image: post.image_url ? [post.image_url] : undefined,
              author: {
                "@type": "Person",
                name: AUTHOR_NAME,
                url: absoluteUrl("/about"),
                sameAs: AUTHOR_PROFILES,
              },
              publisher: {
                "@type": "Person",
                name: AUTHOR_NAME,
                url: SITE_URL,
              },
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: t.nav.blog, item: absoluteUrl("/blog") },
                { "@type": "ListItem", position: 2, name: title },
              ],
            }}
          />
        </>
      )}

      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full px-[44px] md:w-1/2 md:px-0">
          <CoverImage
            src={post.image_url}
            className="relative aspect-[3/2] w-full overflow-hidden md:aspect-auto md:h-[85vh]"
            radius={blogLayout.thumbnailRadius}
            fallbackColor={blogLayout.thumbnailColor}
            fallbackPattern={blogLayout.thumbnailPattern}
            // Full width stacked on mobile, half the viewport once the header
            // splits into two columns at md.
            sizes="(max-width: 768px) 100vw, 50vw"
            eager
          />
        </div>

        <div
          className="flex w-full flex-col justify-center gap-3 py-8 md:w-1/2 md:py-0"
          style={{ paddingLeft: blogLayout.sidePadding, paddingRight: blogLayout.sidePadding }}
        >
          <span className="uppercase" style={blogTypography.postDate}>
            {post.status === "published"
              ? formatFullDate(post.published_at, locale)
              : t.common.draftBadge}
          </span>
          <h1 style={{ ...blogTypography.postTitle, textWrap: "pretty" }}>{title}</h1>
          {subtitle && (
            <p style={{ ...blogTypography.postSubtitle, textWrap: "pretty" }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div
        className="mx-auto w-full max-w-3xl"
        style={{ paddingLeft: blogLayout.sidePadding, paddingRight: blogLayout.sidePadding }}
      >
        <hr className="my-8" style={{ borderColor: blogColors.dateMono }} />

        <MarkdownContent content={content} />
      </div>
    </main>
  );
}
