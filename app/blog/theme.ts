import { siteColors, siteFonts, siteTypography } from "../theme";

export const blogColors = siteColors;
export const blogFonts = siteFonts;

export const blogTypography = {
  pageTitle: siteTypography.pageTitle,
  pageDescription: siteTypography.pageDescription,
  cardDate: {
    fontFamily: blogFonts.sans,
    fontSize: "10.5px",
    letterSpacing: "0.14em",
    color: blogColors.dateMono,
  },
  cardTitle: {
    fontFamily: blogFonts.serif,
    fontSize: "19px",
    fontWeight: 440,
    lineHeight: 1.28,
    letterSpacing: "-0.01em",
    color: blogColors.textCardTitle,
  },
  cardSubtitle: {
    fontFamily: blogFonts.serif,
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.5,
    color: blogColors.textCardTitle,
  },
  scrollIndicator: {
    fontFamily: blogFonts.sans,
    fontSize: "10.5px",
    letterSpacing: "0.14em",
  },
  postDate: {
    fontFamily: blogFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: blogColors.dateMono,
  },
  postTitle: {
    fontFamily: blogFonts.serif,
    fontSize: "38px",
    fontWeight: 440,
    lineHeight: 1.18,
    letterSpacing: "-0.015em",
    color: blogColors.textCardTitle,
  },
  postSubtitle: {
    fontFamily: blogFonts.serif,
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: 1.5,
    color: blogColors.textSecondary,
  },
  bodyParagraph: siteTypography.bodyParagraph,
  bodyHeading1: siteTypography.bodyHeading1,
  bodyHeading2: siteTypography.bodyHeading2,
  bodyHeading3: siteTypography.bodyHeading3,
  bodyQuote: siteTypography.bodyQuote,
  bodyCode: siteTypography.bodyCode,
  bodyCaption: siteTypography.bodyCaption,
} as const;

export const blogLayout = {
  gridGapComfortable: "38px",
  gridGapCompact: "26px",
  sidePadding: "44px",
  headerTopSpace: "44px",
  thumbnailRadius: "3px",
  thumbnailColor: "oklch(0.83 0.028 66)",
  thumbnailPattern:
    "repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 10px)",
} as const;

export const blogScrollBehavior = {
  initialCount: 9,
  loadMoreCount: 6,
  thresholdPx: 520,
} as const;
