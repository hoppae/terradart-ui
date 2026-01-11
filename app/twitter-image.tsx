import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
import { createSocialImage } from "@/lib/seo/socialImage";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return createSocialImage({
    eyebrow: SITE_NAME,
    title: `${SITE_TAGLINE}.`,
    description: "Discover activities, places, and a quick overview for any city.",
  });
}

