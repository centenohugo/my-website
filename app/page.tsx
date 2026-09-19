import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { absoluteUrl, SITE_AUTHOR } from "@/lib/site";
import JsonLd from "./JsonLd";
import LandingHero from "./LandingHero";

export async function generateMetadata(): Promise<Metadata> {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  const SECTIONS = [
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.about, href: "/about" },
  ];

  return (
    <main className="h-dvh overflow-hidden">
      {/* The landing screen is three words and a drawing. A screen reader or a
          fetch-only agent needs a heading and a sentence saying whose site this
          is, so both live here, visible only to them. */}
      <h1 className="sr-only">{t.meta.title}</h1>
      <p className="sr-only">{t.about.bio}</p>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: t.meta.title,
          url: absoluteUrl("/"),
          description: t.meta.description,
          inLanguage: locale,
          author: {
            "@type": "Person",
            name: SITE_AUTHOR.name,
            url: absoluteUrl("/about"),
          },
        }}
      />

      <LandingHero sections={SECTIONS} />
      <SpeedInsights />
      <Analytics />
    </main>
  );
}
