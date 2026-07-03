import type { Metadata } from "next";
import { Piazzolla, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Hugo Centeno Sanz",
  description: "Personal website of Hugo Centeno Sanz"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${piazzolla.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
