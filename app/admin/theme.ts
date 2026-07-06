import { siteColors, siteFonts, siteLayout, siteTypography } from "../theme";

export const adminColors = siteColors;
export const adminLayout = siteLayout;

export const adminTypography = {
  pageTitle: siteTypography.pageTitle,
  label: {
    fontFamily: siteFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: adminColors.textMuted,
  },
  input: {
    fontFamily: siteFonts.sans,
    fontSize: "14px",
    color: adminColors.textPrimary,
    backgroundColor: adminColors.paperElevated,
    border: `1px solid ${adminColors.tagPlaceholder}`,
    borderRadius: "3px",
    padding: "10px 12px",
  },
  textarea: {
    fontFamily: siteFonts.sans,
    fontSize: "14px",
    lineHeight: 1.6,
    color: adminColors.textPrimary,
    backgroundColor: adminColors.paperElevated,
    border: `1px solid ${adminColors.tagPlaceholder}`,
    borderRadius: "3px",
    padding: "12px",
  },
  buttonPrimary: {
    fontFamily: siteFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: adminColors.paper,
    backgroundColor: adminColors.textPrimary,
    borderRadius: "3px",
    padding: "11px 22px",
  },
  buttonSecondary: {
    fontFamily: siteFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: adminColors.textPrimary,
    border: `1px solid ${adminColors.tagPlaceholder}`,
    borderRadius: "3px",
    padding: "10px 21px",
  },
  tab: {
    fontFamily: siteFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: adminColors.textMuted,
  },
  tabActive: {
    fontFamily: siteFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: adminColors.textPrimary,
  },
  listTitle: {
    fontFamily: siteFonts.serif,
    fontSize: "17px",
    fontWeight: 440,
    color: adminColors.textCardTitle,
  },
  listMeta: {
    fontFamily: siteFonts.sans,
    fontSize: "10.5px",
    letterSpacing: "0.1em",
    color: adminColors.dateMono,
  },
  badge: {
    fontFamily: siteFonts.sans,
    fontSize: "10px",
    letterSpacing: "0.08em",
    color: adminColors.textMuted,
    border: `1px solid ${adminColors.tagPlaceholder}`,
    borderRadius: "3px",
    padding: "2px 7px",
  },
} as const;
