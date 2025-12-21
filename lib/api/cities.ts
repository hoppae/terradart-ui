import fixtureCityDetail from "@/tests/mocks/barcelona_response.json";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const USE_FIXTURE_DETAIL = false;

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

export type CityDetail = {
  city?: string;
  region?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  activities?: Array<{
    id?: string;
    name?: string;
    shortDescription?: string;
    description?: string;
    bookingLink?: string;
    pictures?: string[];
    price?: {
      amount?: string;
      currencyCode?: string;
    };
    minimumDuration?: string;
  }>;
};

export async function fetchCityDetail(city: string): Promise<CityDetail> {
  if (USE_FIXTURE_DETAIL) {
    return {...(fixtureCityDetail as CityDetail), city};
  }

  const url = `${BASE_URL}/get-city-detail/${encodeURIComponent(city)}/`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

