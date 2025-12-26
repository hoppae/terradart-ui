import type { Metadata } from "next";
import type React from "react";

type CityRouteParams = { city?: string };
type MetadataProps = {
  params: Promise<CityRouteParams>;
};
type CityLayoutProps = {
  children: React.ReactNode;
};

const toTitleCase = (value?: string) => {
  if (!value) return undefined;
  const cleaned = decodeURIComponent(value).replace(/[-_]+/g, " ").trim();
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || cleaned;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { city } = await params;

  let formattedCity = toTitleCase(city);

  const title = "Discover " + formattedCity;
  const description = `Discover ${formattedCity}. Whether you're planning your next trip, or just exploring the world.`;

  return {
    title,
    description,
  };
}

export default function CityLayout({ children }: CityLayoutProps) {
  return children;
}