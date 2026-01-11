import type { Metadata } from "next";
import type React from "react";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";
import { toTitleCase } from "@/lib/utils";

type CityRouteParams = { city?: string };
type MetadataProps = {
  params: Promise<CityRouteParams>;
};
type CityLayoutProps = {
  children: React.ReactNode;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { city } = await params;

  const formattedCity = city ? toTitleCase(city) : undefined;

  const title = formattedCity ? `Discover ${formattedCity}` : "Discover cities";
  const description = formattedCity
    ? `Explore ${formattedCity}. Get local activities, weather, places to visit, and a quick overview to plan your trip.`
    : SITE_DESCRIPTION;

  const canonicalPath = city ? `/city/${encodeURIComponent(city)}` : "/";

  return {
    title,
    description,
    metadataBase: getSiteUrl(),
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CityLayout({ children }: CityLayoutProps) {
  return children;
}