import Link from "next/link";
import { STAGE_LABELS, type ProjectStage, projectLayout, projectTypography } from "./theme";

export type Project = {
  slug: string;
  title: string;
  subtitle: string | null;
  published_at: string | null;
  image_url: string | null;
  stage: ProjectStage;
};

function formatDate(published_at: string | null) {
  if (!published_at) return "";
  const date = new Date(published_at);
  return date
    .toLocaleDateString("es-ES", { month: "short", year: "numeric" })
    .toUpperCase()
    .replace(".", "");
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex flex-col gap-[13px] text-inherit no-underline"
    >
      <div
        className="relative aspect-[3/2] w-full overflow-hidden"
        style={{
          borderRadius: projectLayout.thumbnailRadius,
          backgroundColor: projectLayout.thumbnailColor,
          backgroundImage: project.image_url
            ? `url(${project.image_url})`
            : projectLayout.thumbnailPattern,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="uppercase" style={projectTypography.cardDate}>
            {formatDate(project.published_at)}
          </span>
          <span className="uppercase" style={projectTypography.stageBadge}>
            {STAGE_LABELS[project.stage]}
          </span>
        </div>

        <h3 style={{ ...projectTypography.cardTitle, textWrap: "pretty" }}>
          {project.title}
        </h3>

        {project.subtitle && (
          <p style={{ ...projectTypography.cardSubtitle, textWrap: "pretty" }}>
            {project.subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
