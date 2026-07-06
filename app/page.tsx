import Link from "next/link";
import { siteLayout, siteTypography } from "./theme";

const SECTIONS = [
  { label: "Blog", href: "/blog" },
  { label: "Proyectos", href: "/projects" },
];

export default function Home() {
  return (
    <main
      className="mx-auto max-w-6xl pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <header className="mb-10 flex flex-col gap-2">
        <h1 style={siteTypography.pageTitle}>Secciones</h1>
      </header>

      <ul className="flex flex-col gap-4">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              style={siteTypography.sectionLink}
              className="no-underline"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
