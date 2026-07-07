import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { siteLayout, siteTypography } from "../../../theme";
import ContentForm, { type ContentFormInitialData } from "../../ContentForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post] = await sql<ContentFormInitialData[]>`
    select slug, title, subtitle, content, status, image_url, title_es, subtitle_es, content_es
    from posts
    where slug = ${slug}
  `;

  if (!post) {
    notFound();
  }

  return (
    <main
      className="mx-auto max-w-3xl pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <h1 className="mb-10" style={siteTypography.pageTitle}>
        Edit post
      </h1>

      <ContentForm kind="post" mode="edit" initialData={post} />
    </main>
  );
}
