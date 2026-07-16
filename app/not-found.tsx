import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import LandingFace from "./LandingFace";
import { siteColors, siteFonts, siteTypography } from "./theme";

// Uncovers the straight mouth (see faceGeometry), which the landing face's
// default slice keeps hidden below the page edge.
const FACE_VISIBLE_FRAC = 0.78;

export default async function NotFound() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  return (
    // Fixed overlay above the site chrome: the root layout always renders the
    // navbar/footer/locale toggle around route content, and the 404 screen
    // should show none of them.
    <main
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ backgroundColor: siteColors.paper }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <h1
          style={{
            fontFamily: siteFonts.serif,
            fontSize: "clamp(96px, 18vw, 168px)",
            fontWeight: 440,
            letterSpacing: "-0.015em",
            lineHeight: 1,
            color: siteColors.textPrimary,
          }}
        >
          404
        </h1>
        <Link href="/" className="uppercase no-underline" style={siteTypography.backLink}>
          {t.common.notFoundHome}
        </Link>
      </div>

      <div className="flex justify-center">
        <LandingFace visibleFrac={FACE_VISIBLE_FRAC} mouth />
      </div>
    </main>
  );
}
