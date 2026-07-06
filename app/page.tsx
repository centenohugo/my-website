import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { siteLayout, siteTypography } from "./theme";

export default async function Home() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  const SECTIONS = [
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.projects, href: "/projects" },
  ];

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
        <h1 style={siteTypography.pageTitle}>{t.home.sectionsHeading}</h1>
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
