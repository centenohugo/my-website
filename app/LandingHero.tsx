"use client";

import Link from "next/link";
import { useState } from "react";
import StickmanDoodle from "./StickmanDoodle";
import { LEAN_TRANSITION_MS, STICKMAN_PARAMS, leanAngleForIndex } from "./stickmanConfig";
import { siteTypography } from "./theme";

export default function LandingHero({
  sections,
}: {
  sections: { label: string; href: string }[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const activeIndex = focusIndex ?? hoverIndex;
  const leanDeg = activeIndex === null ? 0 : leanAngleForIndex(activeIndex, sections.length);

  return (
    <div className="flex items-center justify-between gap-12">
      <ul
        className="flex flex-col gap-4"
        // mouseleave lives on the whole list, not each item: moving the
        // cursor through the gap between two labels must not pass through
        // a "nothing hovered" state, or the figure snaps back to idle and
        // out again between every pair of items instead of leaning
        // smoothly from one to the next.
        onMouseLeave={() => setHoverIndex(null)}
      >
        {sections.map((section, i) => (
          <li key={section.href}>
            <Link
              href={section.href}
              style={{
                ...siteTypography.sectionLink,
                opacity: activeIndex === i ? 1 : 0.62,
                transition: "opacity 180ms ease",
              }}
              className="no-underline outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-4 focus-visible:outline-[#262019]"
              onMouseEnter={() => setHoverIndex(i)}
              onFocus={() => setFocusIndex(i)}
              onBlur={() => setFocusIndex(null)}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block shrink-0" style={{ width: 220, height: 293 }}>
        <StickmanDoodle
          leanDeg={leanDeg}
          leanTransitionMs={LEAN_TRANSITION_MS}
          params={STICKMAN_PARAMS}
        />
      </div>
    </div>
  );
}
