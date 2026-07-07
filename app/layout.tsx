import type { Metadata } from "next";
import { Piazzolla, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, toLocale } from "@/lib/i18n/dictionary";
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
    title: t.meta.title,
    description: t.meta.description,
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
