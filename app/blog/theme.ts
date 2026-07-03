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
  bodyParagraph: {
    fontFamily: blogFonts.serif,
    fontSize: "17px",
    fontWeight: 400,
    lineHeight: 1.7,
    color: blogColors.textPrimary,
  },
  bodyHeading1: {
    fontFamily: blogFonts.serif,
    fontSize: "30px",
    fontWeight: 440,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    color: blogColors.textCardTitle,
  },
  bodyHeading2: {
    fontFamily: blogFonts.serif,
    fontSize: "26px",
    fontWeight: 440,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
    color: blogColors.textCardTitle,
  },
  bodyHeading3: {
    fontFamily: blogFonts.serif,
    fontSize: "21px",
    fontWeight: 440,
    lineHeight: 1.35,
    color: blogColors.textCardTitle,
  },
  bodyQuote: {
    fontFamily: blogFonts.serif,
    fontSize: "17px",
    fontStyle: "italic" as const,
    lineHeight: 1.7,
    color: blogColors.textSecondary,
  },
  bodyCode: {
    fontFamily: blogFonts.sans,
    fontSize: "13.5px",
    color: blogColors.textCardTitle,
  },
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
