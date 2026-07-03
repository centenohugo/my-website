import { sql } from "@/lib/db";
import BlogGrid from "./BlogGrid";
import type { Post } from "./PostCard";
import { blogLayout, blogScrollBehavior, blogTypography } from "./theme";

export default async function BlogPage() {
  const initialPosts = await sql<Post[]>`
    select slug, title, subtitle, published_at
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
        <h1 style={blogTypography.pageTitle}>Escritos</h1>
      </header>

      <BlogGrid initialPosts={initialPosts} />
    </main>
  );
}
