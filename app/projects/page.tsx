import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import ProjectsGrid from "./ProjectsGrid";
import type { Project } from "./ProjectCard";
import { projectLayout, projectScrollBehavior, projectTypography } from "./theme";

export default async function ProjectsPage() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  const initialProjects = await sql<Project[]>`
    select slug, title, subtitle, published_at, image_url, stage
    from projects
    where status = 'published'
    order by published_at desc
    limit ${projectScrollBehavior.initialCount}
  `;

  return (
    <main
      className="mx-auto max-w-6xl pb-16"
      style={{
        paddingLeft: projectLayout.sidePadding,
        paddingRight: projectLayout.sidePadding,
        paddingTop: projectLayout.headerTopSpace,
      }}
    >
      <header className="mb-10 flex flex-col gap-2">
        <h1 style={projectTypography.pageTitle}>{t.projects.pageTitle}</h1>
      </header>

      <ProjectsGrid initialProjects={initialProjects} />
    </main>
  );
}
