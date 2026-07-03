"use client";

import { usePathname } from "next/navigation";
import BackLink from "./BackLink";
import { siteColors, siteLayout } from "./theme";

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // No navbar on the home page
  const showNavbar = pathname !== "/";

  return (
    <>
      {showNavbar && (
        <div
          className="fixed inset-x-0 top-0 z-50 flex items-center"
          style={{
            height: siteLayout.navbarHeight,
            paddingLeft: siteLayout.sidePadding,
            paddingRight: siteLayout.sidePadding,
            backgroundColor: siteColors.paper,
          }}
        >
          <BackLink />
        </div>
      )}
      <div
        className="flex flex-1 flex-col"
        style={{ paddingTop: showNavbar ? siteLayout.navbarHeight : 0 }}
      >
        {children}
      </div>
    </>
  );
}
