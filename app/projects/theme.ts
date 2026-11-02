import { siteColors, siteFonts, siteTypography } from "../theme";

export const projectColors = siteColors;
export const projectFonts = siteFonts;

export const projectTypography = {
  pageTitle: siteTypography.pageTitle,
  pageDescription: siteTypography.pageDescription,
  cardDate: {
    fontFamily: projectFonts.sans,
    fontSize: "10.5px",
    letterSpacing: "0.14em",
    color: projectColors.dateMono,
  },
  cardTitle: {
    fontFamily: projectFonts.serif,
    fontSize: "19px",
    fontWeight: 440,
    lineHeight: 1.28,
    letterSpacing: "-0.01em",
    color: projectColors.textCardTitle,
  },
  cardSubtitle: {
    fontFamily: projectFonts.serif,
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.5,
    color: projectColors.textCardTitle,
  },
  scrollIndicator: {
    fontFamily: projectFonts.sans,
    fontSize: "10.5px",
    letterSpacing: "0.14em",
  },
  detailDate: {
    fontFamily: projectFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: projectColors.dateMono,
  },
  detailTitle: {
    fontFamily: projectFonts.serif,
    fontSize: "38px",
    fontWeight: 440,
    lineHeight: 1.18,
    letterSpacing: "-0.015em",
    color: projectColors.textCardTitle,
  },
  detailSubtitle: {
    fontFamily: projectFonts.serif,
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: 1.5,
    color: projectColors.textSecondary,
  },
  bodyParagraph: siteTypography.bodyParagraph,
  bodyHeading1: siteTypography.bodyHeading1,
  bodyHeading2: siteTypography.bodyHeading2,
  bodyHeading3: siteTypography.bodyHeading3,
  bodyQuote: siteTypography.bodyQuote,
  bodyCode: siteTypography.bodyCode,
  bodyCaption: siteTypography.bodyCaption,
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

export const projectLayout = {
  gridGapComfortable: "38px",
  gridGapCompact: "26px",
  sidePadding: "44px",
  headerTopSpace: "44px",
  thumbnailRadius: "3px",
  thumbnailColor: "oklch(0.83 0.028 66)",
  thumbnailPattern:
    "repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 10px)",
} as const;

export const projectScrollBehavior = {
  initialCount: 9,
  loadMoreCount: 6,
  thresholdPx: 520,
} as const;

export type ProjectStage = "in_progress" | "completed" | "archived";
