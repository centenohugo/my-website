import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { absoluteUrl, SITE_AUTHOR } from "@/lib/site";
import JsonLd from "../JsonLd";
import AboutFlipFace from "./AboutFlipFace";
import SocialLinks from "./SocialLinks";
import { aboutLayout, aboutTypography } from "./theme";

export async function generateMetadata(): Promise<Metadata> {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);
  return {
    title: t.nav.about,
    description: t.about.bio,
    alternates: { canonical: "/about" },
    openGraph: {
      type: "profile",
      url: absoluteUrl("/about"),
      title: `${t.nav.about} · ${t.meta.title}`,
      description: t.about.bio,
    },
  };
}

export default async function AboutPage() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  return (
    <main
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-12 pb-24 pt-8 sm:flex-row"
      style={{
        paddingLeft: aboutLayout.sidePadding,
        paddingRight: aboutLayout.sidePadding,
        columnGap: aboutLayout.columnGap,
      }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/about"),
          inLanguage: locale,
          mainEntity: {
            "@type": "Person",
            name: SITE_AUTHOR.name,
            description: t.about.bio,
            email: `mailto:${SITE_AUTHOR.email}`,
            url: absoluteUrl("/about"),
            sameAs: SITE_AUTHOR.sameAs,
          },
        }}
      />

      <AboutFlipFace photoAlt={t.about.photoAlt} flipLabel={t.about.flipLabel} />

      <div
        className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left"
        style={{ maxWidth: aboutLayout.maxTextWidth }}
      >
        <h1 style={aboutTypography.name}>{t.about.name}</h1>
        <p style={aboutTypography.bio}>{t.about.bio}</p>
        <SocialLinks />
      </div>
    </main>
  );
}
