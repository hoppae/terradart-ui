import { SITE_NAME } from "@/lib/seo/site";
import { createSocialImage } from "@/lib/seo/socialImage";
import { toTitleCase } from "@/lib/utils";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ city: string }>;
};

export default async function Image({ params }: Props) {
  const { city } = await params;
  const formattedCity = toTitleCase(city);

  return createSocialImage({
    eyebrow: SITE_NAME,
    title: `Explore ${formattedCity}.`,
    description: "Get local activities, weather, places to visit, and a quick overview.",
  });
}
