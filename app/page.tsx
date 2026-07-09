import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import LandingHero from "./LandingHero";

export default async function Home() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  const SECTIONS = [
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.projects, href: "/projects" },
  ];

  return (
    <main className="h-dvh overflow-hidden">
      <LandingHero sections={SECTIONS} />
    </main>
  );
}
