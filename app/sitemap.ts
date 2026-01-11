import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { SITEMAP_CITIES } from "@/lib/seo/cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const urls: MetadataRoute.Sitemap = [
    {
      url: new URL("/", base).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...SITEMAP_CITIES.map((c) => ({
      url: new URL(`/city/${encodeURIComponent(c.name)}`, base).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return urls;
}

