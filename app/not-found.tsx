import type { Metadata } from "next";
import Link from "next/link";
import t from "@/lib/copy";
import LandingFace from "./LandingFace";
import { siteColors, siteFonts, siteTypography } from "./theme";

// Uncovers the straight mouth (see faceGeometry), which the landing face's
// default slice keeps hidden below the page edge.
const FACE_VISIBLE_FRAC = 0.78;

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    // Fixed overlay above the site chrome: the root layout always renders the
    // navbar/footer around route content, and the 404 screen
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
