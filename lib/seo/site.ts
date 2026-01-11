export const SITE_NAME = "Terradart";

export const SITE_TAGLINE = "Find your next spot";

export const SITE_DESCRIPTION = "Explore any city worldwide. Get local activities, weather, places to visit, and a quick overview to plan your trip.";

export function getSiteUrl(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isVercel = !!process.env.VERCEL;

  if (isVercel && !siteUrl) {
    throw new Error("Set NEXT_PUBLIC_SITE_URL for production.");
  }

  return new URL(siteUrl || "http://localhost:3000");
}

