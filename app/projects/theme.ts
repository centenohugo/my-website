import {
  blogColors,
  blogFonts,
  blogLayout,
  blogScrollBehavior,
  blogTypography,
} from "../blog/theme";

// Projects share the exact visual language of the blog (same card/post layout,
// same fonts and colors) — reuse those tokens directly and add what's specific
// to projects: the stage badge.
export const projectColors = blogColors;
export const projectFonts = blogFonts;
export const projectLayout = blogLayout;
export const projectScrollBehavior = blogScrollBehavior;

export const projectTypography = {
  ...blogTypography,
  stageBadge: {
    fontFamily: projectFonts.sans,
    fontSize: "10px",
    letterSpacing: "0.08em",
    color: projectColors.textMuted,
    border: `1px solid ${projectColors.tagPlaceholder}`,
    borderRadius: "3px",
    padding: "2px 7px",
  },
} as const;

export type ProjectStage = "in_progress" | "completed" | "archived";
