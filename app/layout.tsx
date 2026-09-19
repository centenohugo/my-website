import type { Metadata } from "next";
import { Piazzolla, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { absoluteUrl, SITE_AUTHOR, SITE_URL } from "@/lib/site";
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
    // metadataBase lets every page below declare canonicals, Open Graph URLs
    // and image paths as relative strings.
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
    applicationName: t.meta.title,
    authors: [{ name: SITE_AUTHOR.name, url: absoluteUrl("/about") }],
    creator: SITE_AUTHOR.name,
    openGraph: {
      type: "website",
      url: absoluteUrl("/"),
      siteName: t.meta.title,
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === "es" ? "es_ES" : "en_US",
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
      <head>
        {/* Points agents at the curated index of the site before they start
            crawling it page by page. */}
        <link
          rel="alternate"
          type="text/plain"
          href={absoluteUrl("/llms.txt")}
          title="llms.txt"
        />
      </head>
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
