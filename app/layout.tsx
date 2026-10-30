import type { Metadata } from "next";
import { IBM_Plex_Mono, Piazzolla, Inter } from "next/font/google";
import t from "@/lib/copy";
import { absoluteUrl, AUTHOR_NAME, SITE_URL } from "@/lib/site";
import Footer from "./Footer";
import InternalNavTracker from "./InternalNavTracker";
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

const plexMono = IBM_Plex_Mono({
  variable: "--font-site-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export function generateMetadata(): Metadata {
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
      locale: "en_US",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${piazzolla.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="alternate"
          type="text/plain"
          href={absoluteUrl("/llms.txt")}
          title="llms.txt"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <InternalNavTracker />
        <Navbar>{children}</Navbar>
        <Footer />
      </body>
    </html>
  );
}
