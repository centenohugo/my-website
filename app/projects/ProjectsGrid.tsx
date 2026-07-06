"use client";

import InfiniteCardGrid from "../InfiniteCardGrid";
import ProjectCard, { type Project } from "./ProjectCard";
import { projectColors, projectLayout, projectScrollBehavior, projectTypography } from "./theme";

export default function ProjectsGrid({ initialProjects }: { initialProjects: Project[] }) {
  return (
    <InfiniteCardGrid
      stateKey="nav:projectsGridState"
      initialItems={initialProjects}
      endpoint="/api/projects"
      initialCount={projectScrollBehavior.initialCount}
      loadMoreCount={projectScrollBehavior.loadMoreCount}
      thresholdPx={projectScrollBehavior.thresholdPx}
      gridGap={projectLayout.gridGapComfortable}
      getKey={(project) => project.slug}
      renderItem={(project) => <ProjectCard project={project} />}
      doneLabel=""
      loadingLabel="Loading more ·"
      indicatorStyle={projectTypography.scrollIndicator}
      doneColor={projectColors.archiveEndMono}
      loadingColor={projectColors.loadingMono}
    />
  );
}
