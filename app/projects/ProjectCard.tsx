"use client";

import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { formatCardDate } from "@/lib/i18n/formatDate";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import CoverImage from "../CoverImage";
import { type ProjectStage, projectLayout, projectTypography } from "./theme";

export type Project = {
  slug: string;
  title: string;
  subtitle: string | null;
  title_es?: string | null;
  subtitle_es?: string | null;
  published_at: string | null;
  image_url: string | null;
  stage: ProjectStage;
};

export default function ProjectCard({
  project,
  eager = false,
}: {
  project: Project;
  /** Set on the first card in the grid — it is the listing page's LCP element. */
  eager?: boolean;
}) {
  const { locale } = useLocale();
  const t = getDictionary(locale);
  const title = locale === "es" && project.title_es ? project.title_es : project.title;
  const subtitle =
    locale === "es" && project.subtitle_es ? project.subtitle_es : project.subtitle;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex flex-col gap-[13px] text-inherit no-underline"
    >
      <CoverImage
        src={project.image_url}
        className="relative aspect-[3/2] w-full overflow-hidden"
        radius={projectLayout.thumbnailRadius}
        fallbackColor={projectLayout.thumbnailColor}
        fallbackPattern={projectLayout.thumbnailPattern}
        // Grid is 1 column, then 2 at sm, then 3 at lg inside a max-w-6xl page.
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        eager={eager}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="uppercase" style={projectTypography.cardDate}>
            {formatCardDate(project.published_at, locale)}
          </span>
          <span className="uppercase" style={projectTypography.stageBadge}>
            {t.projects.stages[project.stage]}
          </span>
        </div>

        <h3 style={{ ...projectTypography.cardTitle, textWrap: "pretty" }}>
          {title}
        </h3>

        {subtitle && (
          <p style={{ ...projectTypography.cardSubtitle, textWrap: "pretty" }}>
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
