"use client";

import { usePathname } from "next/navigation";
import DoodleFace from "./DoodleFace";

export default function Footer() {
  const pathname = usePathname();
  const hidden =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/");
  if (hidden) return null;

  return (
    // no bottom padding and leading-none: the face must sit flush against the
    // page's bottom edge so its cut-off slice reads as the head peeking up
    <footer className="flex items-end justify-center leading-none" style={{ paddingTop: 24 }}>
      <DoodleFace />
    </footer>
  );
}
