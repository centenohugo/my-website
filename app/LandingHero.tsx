"use client";

import Link from "next/link";
import LandingFace from "./LandingFace";
import { siteTypography } from "./theme";

// Row layout tuned in design/prototypes/landing-face.prototype.html
const LINK_FONT_SIZE = 38;

export default function LandingHero({
  sections,
}: {
  sections: { label: string; href: string }[];
}) {
  return (
    <div className="flex h-full flex-col">
      {/* one row on desktop, stacked on small screens so the titles keep
          their size instead of shrinking to fit side by side */}
      <nav className="flex flex-1 flex-col items-center justify-center gap-[66px] sm:flex-row sm:gap-[132px]">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            style={{ ...siteTypography.sectionLink, fontSize: LINK_FONT_SIZE }}
            className="no-underline opacity-[0.62] transition-opacity duration-[180ms] hover:opacity-100 focus-visible:opacity-100 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-4 focus-visible:outline-[#262019]"
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="flex justify-center">
        <LandingFace />
      </div>
    </div>
  );
}
