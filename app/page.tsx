import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { absoluteUrl, AUTHOR_NAME, AUTHOR_PROFILES, SITE_URL } from "@/lib/site";
import JsonLd from "./JsonLd";
import LandingHero from "./LandingHero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  const SECTIONS = [
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.about, href: "/about" },
  ];

  return (
    <main className="h-dvh overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": absoluteUrl("/#website"),
          url: SITE_URL,
          name: t.meta.title,
          description: t.meta.description,
          inLanguage: locale,
          author: {
            "@type": "Person",
            "@id": absoluteUrl("/about#person"),
            name: AUTHOR_NAME,
            url: absoluteUrl("/about"),
            sameAs: AUTHOR_PROFILES,
          },
        }}
      />

      <LandingHero sections={SECTIONS} />
      <SpeedInsights />
      <Analytics />
    </main>
  );
}
