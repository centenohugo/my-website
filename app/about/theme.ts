import { siteColors, siteFonts, siteTypography } from "../theme";

export const aboutColors = siteColors;
export const aboutFonts = siteFonts;

export const aboutTypography = {
  name: siteTypography.pageTitle,
  bio: siteTypography.bodyParagraph,
} as const;

export const aboutLayout = {
  sidePadding: "44px",
  // diameter of the flip circle (doodle face / photo)
  faceSize: 208,
  // gap between the circle and the text column
  columnGap: "56px",
  maxTextWidth: "26rem",
} as const;
