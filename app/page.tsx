import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { absoluteUrl, AUTHOR_NAME, AUTHOR_PROFILES, SITE_URL } from "@/lib/site";
import HashScroll from "./HashScroll";
import JsonLd from "./JsonLd";
import AboutFlipFace from "./about/AboutFlipFace";
import SocialLinks from "./about/SocialLinks";
import { aboutLayout, aboutTypography } from "./about/theme";
import type { Project } from "./projects/ProjectCard";
import ProjectsGrid from "./projects/ProjectsGrid";
import { projectLayout, projectScrollBehavior, projectTypography } from "./projects/theme";
import { siteTypography } from "./theme";

// The home page is the About page: who the site belongs to comes first, and
// the projects follow below it on the same page (/about redirects to / and
// /projects to /#projects). The previous landing is kept in
// app/_legacy-landing.
export async function generateMetadata(): Promise<Metadata> {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);
  return {
    description: t.about.bio,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      url: "/",
      title: t.about.name,
      description: t.about.bio,
      images: ["/me.jpg"],
    },
  };
}

export default async function Home() {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);

  // A database hiccup should cost the home page its project list, not the
  // whole page: the About part above it needs no data.
  let initialProjects: Project[] = [];
  try {
    initialProjects = await sql<Project[]>`
      select slug, title, subtitle, title_es, subtitle_es, published_at, image_url, stage
      from projects
      where status = 'published'
      order by published_at desc
      limit ${projectScrollBehavior.initialCount}
    `;
  } catch (error) {
    console.error("home: could not list published projects", error);
  }

  return (
    <main className="flex w-full flex-1 flex-col">
      {/* The identity record the rest of the site's author references point at. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": absoluteUrl("/#website"),
              url: SITE_URL,
              name: t.meta.title,
              description: t.meta.description,
              inLanguage: locale,
              author: { "@id": absoluteUrl("/#person") },
            },
            {
              "@type": "ProfilePage",
              url: SITE_URL,
              mainEntity: {
                "@type": "Person",
                "@id": absoluteUrl("/#person"),
                name: AUTHOR_NAME,
                alternateName: t.about.name,
                description: t.about.bio,
                url: SITE_URL,
                image: absoluteUrl("/me.jpg"),
                sameAs: AUTHOR_PROFILES,
              },
            },
          ],
        }}
      />

      <section
        className="relative mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center justify-center gap-12 pb-24 pt-8 sm:flex-row"
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

        <Link
          href="#projects"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 uppercase"
          style={siteTypography.backLink}
        >
          {t.projects.pageTitle} ↓
        </Link>
      </section>

      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="mx-auto w-full max-w-6xl pb-16"
        style={{
          paddingLeft: projectLayout.sidePadding,
          paddingRight: projectLayout.sidePadding,
          paddingTop: projectLayout.headerTopSpace,
        }}
      >
        <header className="mb-10 flex flex-col gap-2">
          <h2 id="projects-heading" style={projectTypography.pageTitle}>
            {t.projects.pageTitle}
          </h2>
        </header>

        <ProjectsGrid initialProjects={initialProjects} />
      </section>

      <HashScroll />
      <SpeedInsights />
      <Analytics />
    </main>
  );
}
