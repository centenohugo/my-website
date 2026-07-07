"use client";

import { usePathname } from "next/navigation";
import DoodleFace from "./DoodleFace";

export default function Footer() {
  const pathname = usePathname();
  const hidden =
    pathname === "/" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/");
  if (hidden) return null;

  return (
    <footer className="flex items-center justify-center" style={{ paddingTop: 24, paddingBottom: 12 }}>
      <DoodleFace />
    </footer>
  );
}
