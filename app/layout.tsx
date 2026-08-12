import type { Metadata } from "next";
import { Piazzolla, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { AUTHOR_NAME, SITE_URL } from "@/lib/site";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import Footer from "./Footer";
import InternalNavTracker from "./InternalNavTracker";
import LocaleToggle from "./LocaleToggle";
import Navbar from "./Navbar";
import "./globals.css";

const piazzolla = Piazzolla({
  variable: "--font-site-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-site-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = getDictionary(locale);
  return {
    // Every relative URL in a child segment's metadata resolves against this;
    // without it, a relative canonical or OG image is a build error.
    metadataBase: new URL(SITE_URL),
    title: {
      default: t.meta.title,
      // Child pages set a bare title ("Blog", a post headline) and get the
      // site name appended.
      template: `%s · ${t.meta.title}`,
    },
    description: t.meta.description,
    applicationName: t.meta.title,
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    creator: AUTHOR_NAME,
    openGraph: {
      type: "website",
      siteName: t.meta.title,
      locale: locale === "es" ? "es_ES" : "en_US",
      title: t.meta.title,
      description: t.meta.description,
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={locale}
      className={`${piazzolla.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale}>
          <InternalNavTracker />
          <Navbar>{children}</Navbar>
          <Footer />
          <LocaleToggle />
        </LocaleProvider>
      </body>
    </html>
  );
}
