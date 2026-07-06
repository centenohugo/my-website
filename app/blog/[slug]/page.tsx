import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import MarkdownContent from "../../MarkdownContent";
import { blogColors, blogLayout, blogTypography } from "../theme";

type PostDetail = {
  title: string;
  subtitle: string | null;
  content: string;
  published_at: string | null;
  image_url: string | null;
};

function formatDate(published_at: string | null) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post] = await sql<PostDetail[]>`
    select title, subtitle, content, published_at, image_url
    from posts
    where slug = ${slug} and status = 'published'
  `;

  if (!post) {
    notFound();
  }

  return (
    <main className="pb-16" style={{ paddingTop: blogLayout.headerTopSpace }}>
      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full px-[44px] md:w-1/2 md:px-0">
          <div
            className="relative aspect-[3/2] w-full overflow-hidden md:aspect-auto md:h-[85vh]"
            style={{
              borderRadius: blogLayout.thumbnailRadius,
              backgroundColor: blogLayout.thumbnailColor,
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
            {formatDate(post.published_at)}
          </span>
          <h1 style={{ ...blogTypography.postTitle, textWrap: "pretty" }}>{post.title}</h1>
          {post.subtitle && (
            <p style={{ ...blogTypography.postSubtitle, textWrap: "pretty" }}>{post.subtitle}</p>
          )}
        </div>
      </div>

      <div
        className="mx-auto max-w-3xl"
        style={{ paddingLeft: blogLayout.sidePadding, paddingRight: blogLayout.sidePadding }}
      >
        <hr className="my-8" style={{ borderColor: blogColors.dateMono }} />

        <MarkdownContent content={post.content} />
      </div>
    </main>
  );
}
