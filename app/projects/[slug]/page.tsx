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
import { projectColors, projectLayout, projectTypography, type ProjectStage } from "../theme";

type ProjectDetail = {
  title: string;
  subtitle: string | null;
  content: string;
  title_es: string | null;
  subtitle_es: string | null;
  content_es: string | null;
  published_at: string | null;
  updated_at: string;
  image_url: string | null;
  stage: ProjectStage;
  repo_url: string | null;
  live_url: string | null;
  status: "draft" | "published";
};

// Shared by generateMetadata and the page so the row is fetched once.
const getProject = cache(async function getProject(
  slug: string,
  shareToken: string | null,
  isAdmin: boolean
): Promise<ProjectDetail | null> {
  const [project] = await sql<ProjectDetail[]>`
    select title, subtitle, content, title_es, subtitle_es, content_es,
           published_at, updated_at, image_url, stage, repo_url, live_url, status
    from projects
    where slug = ${slug}
      and (status = 'published' or ${isAdmin} or share_token = ${shareToken})
  `;
  return project ?? null;
});

/** Title/subtitle/body in the requested locale, falling back field by field. */
function localize(project: ProjectDetail, locale: "en" | "es") {
  const es = locale === "es";
  return {
    title: es && project.title_es ? project.title_es : project.title,
    subtitle: es && project.subtitle_es ? project.subtitle_es : project.subtitle,
    content: es && project.content_es ? project.content_es : project.content,
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
  const project = await getProject(slug, toShareToken(share), await hasAdminSession());

  if (!project) return {};

  const { title, subtitle, content } = localize(project, locale);
  const description = subtitle ?? excerpt(content);
  const canonical = `/projects/${slug}`;

  // Share links point at unpublished drafts; keep them out of search indexes.
  if (share || project.status !== "published") {
    return { title, description, robots: { index: false, follow: false } };
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      // The Markdown mirror of this write-up, which agents prefer to the page.
      types: { "text/markdown": `${canonical}.md` },
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonical),
      title,
      description,
      publishedTime: isoDateTime(project.published_at),
      modifiedTime: isoDateTime(project.updated_at),
      images: project.image_url ? [project.image_url] : undefined,
    },
  };
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

  const project = await getProject(slug, shareToken, isAdmin);

  if (!project) {
    notFound();
  }

  const { title, subtitle, content } = localize(project, locale);

  return (
    <main className="pb-16" style={{ paddingTop: projectLayout.headerTopSpace }}>
      {project.status === "published" && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: title,
            description: subtitle ?? excerpt(content),
            url: absoluteUrl(`/projects/${slug}`),
            datePublished: isoDateTime(project.published_at),
            dateModified: isoDateTime(project.updated_at),
            inLanguage: locale,
            image: project.image_url ?? undefined,
            // The stage is a badge on the page; spelled out here so an agent
            // does not have to guess what the badge attaches to.
            creativeWorkStatus: t.projects.stages[project.stage],
            codeRepository: project.repo_url ?? undefined,
            author: { "@type": "Person", name: t.about.name, url: absoluteUrl("/about") },
          }}
        />
      )}

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
              {project.status === "published" ? (
                <time dateTime={isoDateTime(project.published_at)}>
                  {formatFullDate(project.published_at, locale)}
                </time>
              ) : (
                t.common.draftBadge
              )}
            </span>
            <span className="uppercase" style={projectTypography.stageBadge}>
              {t.projects.stages[project.stage]}
            </span>
          </div>
          <h1 style={{ ...projectTypography.postTitle, textWrap: "pretty" }}>{title}</h1>
          {subtitle && (
            <p style={{ ...projectTypography.postSubtitle, textWrap: "pretty" }}>{subtitle}</p>
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

      <article
        className="mx-auto w-full max-w-3xl"
        style={{ paddingLeft: projectLayout.sidePadding, paddingRight: projectLayout.sidePadding }}
      >
        <hr className="my-8" style={{ borderColor: projectColors.dateMono }} />

        <MarkdownContent content={content} />
      </article>
    </main>
  );
}
