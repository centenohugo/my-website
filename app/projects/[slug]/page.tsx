import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { toExcerpt } from "@/lib/excerpt";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { formatFullDate } from "@/lib/i18n/formatDate";
import { toIsoString } from "@/lib/publishedDate";
import { hasAdminSession, toShareToken } from "@/lib/share";
import { absoluteUrl, AUTHOR_NAME, AUTHOR_PROFILES } from "@/lib/site";
import CoverImage from "../../CoverImage";
import JsonLd from "../../JsonLd";
import MarkdownContent from "../../MarkdownContent";
import { projectColors, projectLayout, projectTypography } from "../theme";
import { getProject, type ProjectDetail } from "./getProject";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** The Spanish column when it exists and Spanish is selected, else the original. */
function localized(project: ProjectDetail, locale: "en" | "es") {
  const useEs = locale === "es";
  return {
    title: useEs && project.title_es ? project.title_es : project.title,
    subtitle: useEs && project.subtitle_es ? project.subtitle_es : project.subtitle,
    content: useEs && project.content_es ? project.content_es : project.content,
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

  const project = await getProject(slug, isAdmin, shareToken);
  if (!project) return {};

  const { title, subtitle, content } = localized(project, locale);
  const description = subtitle || toExcerpt(content);
  const url = absoluteUrl(`/projects/${slug}`);

  // A draft is only reachable through a share link or an admin session. Either
  // way it is not public, so it must never enter an index.
  const isPublic = project.status === "published" && !shareToken;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    robots: isPublic ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: toIsoString(project.published_at),
      modifiedTime: toIsoString(project.updated_at),
      authors: [AUTHOR_NAME],
      images: project.image_url ? [project.image_url] : undefined,
    },
    twitter: {
      card: project.image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: project.image_url ? [project.image_url] : undefined,
    },
  };
}

export default async function ProjectPage({
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

  const project = await getProject(slug, isAdmin, shareToken);

  if (!project) {
    notFound();
  }

  const { title, subtitle, content } = localized(project, locale);
  const isPublic = project.status === "published" && !shareToken;

  return (
    <main className="pb-16" style={{ paddingTop: projectLayout.headerTopSpace }}>
      {isPublic && (
        <>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": absoluteUrl(`/projects/${slug}#project`),
              mainEntityOfPage: absoluteUrl(`/projects/${slug}`),
              name: title,
              headline: title,
              description: subtitle || toExcerpt(content),
              inLanguage: locale,
              datePublished: toIsoString(project.published_at),
              dateModified: toIsoString(project.updated_at ?? project.published_at),
              image: project.image_url ? [project.image_url] : undefined,
              // The repo and live site are the same work published elsewhere.
              sameAs: [project.repo_url, project.live_url].filter(Boolean),
              creativeWorkStatus: t.projects.stages[project.stage],
              author: {
                "@type": "Person",
                name: AUTHOR_NAME,
                url: absoluteUrl("/about"),
                sameAs: AUTHOR_PROFILES,
              },
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: t.nav.projects,
                  item: absoluteUrl("/projects"),
                },
                { "@type": "ListItem", position: 2, name: title },
              ],
            }}
          />
        </>
      )}

      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full px-[44px] md:w-1/2 md:px-0">
          <CoverImage
            src={project.image_url}
            className="relative aspect-[3/2] w-full overflow-hidden md:aspect-auto md:h-[85vh]"
            radius={projectLayout.thumbnailRadius}
            fallbackColor={projectLayout.thumbnailColor}
            fallbackPattern={projectLayout.thumbnailPattern}
            // Full width stacked on mobile, half the viewport once the header
            // splits into two columns at md.
            sizes="(max-width: 768px) 100vw, 50vw"
            eager
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

      <div
        className="mx-auto w-full max-w-3xl"
        style={{ paddingLeft: projectLayout.sidePadding, paddingRight: projectLayout.sidePadding }}
      >
        <hr className="my-8" style={{ borderColor: projectColors.dateMono }} />

        <MarkdownContent content={content} />
      </div>
    </main>
  );
}
