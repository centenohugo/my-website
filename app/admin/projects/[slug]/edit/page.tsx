import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { siteLayout, siteTypography } from "../../../../theme";
import ContentForm, { type ContentFormInitialData } from "../../../ContentForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [project] = await sql<ContentFormInitialData[]>`
    select slug, title, subtitle, content, status, image_url, repo_url, live_url, stage
    from projects
    where slug = ${slug}
  `;

  if (!project) {
    notFound();
  }

  return (
    <main
      className="mx-auto w-full max-w-3xl pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <h1 className="mb-10" style={siteTypography.pageTitle}>
        Edit project
      </h1>

      <ContentForm kind="project" mode="edit" initialData={project} />
    </main>
  );
}
