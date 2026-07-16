import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { formatFullDate } from "@/lib/i18n/formatDate";
import { hasAdminSession, toShareToken } from "@/lib/share";
import MarkdownContent from "../../MarkdownContent";
import { projectColors, projectLayout, projectTypography, type ProjectStage } from "../theme";

type ProjectDetail = {
  title: string;
  subtitle: string | null;
  content: string;
  published_at: string | null;
  image_url: string | null;
  stage: ProjectStage;
  repo_url: string | null;
  live_url: string | null;
  status: "draft" | "published";
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  // Share links point at unpublished drafts; keep them out of search indexes.
  const { share } = await searchParams;
  return share ? { robots: { index: false, follow: false } } : {};
}

export default async function ProjectPage({
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

  const [project] = await sql<ProjectDetail[]>`
    select title, subtitle, content, published_at, image_url, stage, repo_url, live_url, status
    from projects
    where slug = ${slug}
      and (status = 'published' or ${isAdmin} or share_token = ${shareToken})
  `;

  if (!project) {
    notFound();
  }

  return (
    <main className="pb-16" style={{ paddingTop: projectLayout.headerTopSpace }}>
      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full px-[44px] md:w-1/2 md:px-0">
          <div
            className="relative aspect-[3/2] w-full overflow-hidden md:aspect-auto md:h-[85vh]"
            style={{
              borderRadius: projectLayout.thumbnailRadius,
              backgroundColor: project.image_url
                ? "var(--background)"
                : projectLayout.thumbnailColor,
              backgroundImage: project.image_url
                ? `url(${project.image_url})`
                : projectLayout.thumbnailPattern,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div
          className="flex w-full flex-col justify-center gap-3 py-8 md:w-1/2 md:py-0"
          style={{ paddingLeft: projectLayout.sidePadding, paddingRight: projectLayout.sidePadding }}
        >
          <div className="flex items-center gap-2">
            <span className="uppercase" style={projectTypography.postDate}>
              {project.status === "published"
                ? formatFullDate(project.published_at, locale)
                : t.common.draftBadge}
            </span>
            <span className="uppercase" style={projectTypography.stageBadge}>
              {t.projects.stages[project.stage]}
            </span>
          </div>
          <h1 style={{ ...projectTypography.postTitle, textWrap: "pretty" }}>{project.title}</h1>
          {project.subtitle && (
            <p style={{ ...projectTypography.postSubtitle, textWrap: "pretty" }}>{project.subtitle}</p>
          )}

          {(project.repo_url || project.live_url) && (
            <div className="mt-2 flex items-center gap-4">
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="uppercase"
                  style={{ ...projectTypography.postDate, textDecoration: "underline" }}
                >
                  {t.projects.codeLink}
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="uppercase"
                  style={{ ...projectTypography.postDate, textDecoration: "underline" }}
                >
                  {t.projects.liveLink}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="mx-auto w-full max-w-3xl"
        style={{ paddingLeft: projectLayout.sidePadding, paddingRight: projectLayout.sidePadding }}
      >
        <hr className="my-8" style={{ borderColor: projectColors.dateMono }} />

        <MarkdownContent content={project.content} />
      </div>
    </main>
  );
}
