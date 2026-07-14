import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import AboutFlipFace from "./AboutFlipFace";
import SocialLinks from "./SocialLinks";
import { aboutLayout, aboutTypography } from "./theme";

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
