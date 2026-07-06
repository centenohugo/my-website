import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import BlogGrid from "./BlogGrid";
import type { Post } from "./PostCard";
import { blogLayout, blogScrollBehavior, blogTypography } from "./theme";

export default async function BlogPage() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  const initialPosts = await sql<Post[]>`
    select slug, title, subtitle, published_at, image_url
    from posts
    where status = 'published'
    order by published_at desc
    limit ${blogScrollBehavior.initialCount}
  `;

  return (
    <main
      className="mx-auto max-w-6xl pb-16"
      style={{
        paddingLeft: blogLayout.sidePadding,
        paddingRight: blogLayout.sidePadding,
        paddingTop: blogLayout.headerTopSpace,
      }}
    >
      <header className="mb-10 flex flex-col gap-2">
        <h1 style={blogTypography.pageTitle}>{t.blog.pageTitle}</h1>
      </header>

      <BlogGrid initialPosts={initialPosts} />
    </main>
  );
}
