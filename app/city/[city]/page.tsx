import { notFound } from "next/navigation";
import { fetchCityInitial } from "@/lib/api/cities";
import CityDetailClient from "./CityDetailClient";

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ state?: string; country?: string }>;
};

export default async function CityDetailPage({ params, searchParams }: Props) {
  const { city: cityParam } = await params;
  const { state: stateParam, country: countryParam } = await searchParams;

  let decodedCity: string;
  try {
    decodedCity = decodeURIComponent(cityParam);
  } catch {
    notFound();
  }

  const initialData = await fetchCityInitial(decodedCity, {
    state: stateParam,
    country: countryParam,
  });

  if (!initialData) {
    notFound();
  }

  const subHeader = `Explore local activities, weather forecasts, popular places, and everything you need to plan your visit.`;

  return (
    <CityDetailClient
      initialData={initialData}
      cityParam={decodedCity}
      stateParam={stateParam}
      countryParam={countryParam}
      subHeader={subHeader}
    />
  );
}
