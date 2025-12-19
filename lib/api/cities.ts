const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type CityResponse = {
  city?: string;
  region?: string;
};

export async function fetchCityByRegion(region: string, wantsCapital: boolean): Promise<CityResponse> {
  const capitalSuffix = wantsCapital ? "?capital=true" : "";
  const url = `${BASE_URL}/get-city/region/${region}/${capitalSuffix}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();

}

