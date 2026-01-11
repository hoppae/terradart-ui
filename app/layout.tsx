import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/seo/site";
import { Analytics } from "./Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s / Terradart",
    default: `${SITE_TAGLINE} / ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: getSiteUrl(),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${SITE_TAGLINE} / ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_TAGLINE} / ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
