// Convention: each new section (app/<seccion>/theme.ts) reexports these token
// and adds what is specific for that section (typography/specific layours).

export const siteColors = {
  paper: "#ece5d7",
  paperElevated: "#f4efe5",
  textPrimary: "#262019",
  textCardTitle: "#282219",
  textMuted: "#877d6c",
  textSecondary: "#857b6b",
  dateMono: "#a2977f",
  tagPlaceholder: "rgba(30,24,14,0.26)",
  loadingMono: "#a89d87",
  archiveEndMono: "#c0b6a0",
} as const;

export const siteFonts = {
  serif: "var(--font-site-serif)",
  sans: "var(--font-site-sans)",
} as const;

export const siteTypography = {
  pageTitle: {
    fontFamily: siteFonts.serif,
    fontSize: "32px",
    fontWeight: 440,
    letterSpacing: "-0.015em",
    color: siteColors.textPrimary,
  },
  pageDescription: {
    fontFamily: siteFonts.serif,
    fontSize: "15px",
    fontWeight: 400,
    color: siteColors.textSecondary,
  },
  sectionLink: {
    fontFamily: siteFonts.serif,
    fontSize: "19px",
    fontWeight: 440,
    letterSpacing: "-0.01em",
    color: siteColors.textCardTitle,
  },
  backLink: {
    fontFamily: siteFonts.sans,
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: siteColors.textCardTitle,
    cursor: "pointer",
  },
} as const;

export const siteLayout = {
  sidePadding: "44px",
  headerTopSpace: "44px",
  navbarHeight: "56px",
} as const;
