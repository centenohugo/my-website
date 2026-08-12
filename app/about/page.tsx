import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { absoluteUrl, AUTHOR_NAME, AUTHOR_PROFILES, SITE_URL } from "@/lib/site";
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
      url: "/about",
      title: `${t.nav.about} — ${t.about.name}`,
      description: t.about.bio,
      images: ["/me.jpg"],
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
      {/* The identity record the rest of the site's author references point at. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            "@id": absoluteUrl("/about#person"),
            name: AUTHOR_NAME,
            alternateName: t.about.name,
            description: t.about.bio,
            url: SITE_URL,
            image: absoluteUrl("/me.jpg"),
            sameAs: AUTHOR_PROFILES,
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
