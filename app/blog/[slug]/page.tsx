import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { formatFullDate } from "@/lib/i18n/formatDate";
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
  image_url: string | null;
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  const [post] = await sql<PostDetail[]>`
    select title, subtitle, content, title_es, subtitle_es, content_es, published_at, image_url
    from posts
    where slug = ${slug} and status = 'published'
  `;

  if (!post) {
    notFound();
  }

  const title = locale === "es" && post.title_es ? post.title_es : post.title;
  const subtitle = locale === "es" && post.subtitle_es ? post.subtitle_es : post.subtitle;
  const content = locale === "es" && post.content_es ? post.content_es : post.content;

  return (
    <main className="pb-16" style={{ paddingTop: blogLayout.headerTopSpace }}>
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
            {formatFullDate(post.published_at, locale)}
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
