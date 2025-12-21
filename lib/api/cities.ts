import fixtureCityDetail from "@/tests/mocks/bangalore_response.json";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const USE_FIXTURE_DETAIL = false;

type CityResponse = {
  city?: string;
  region?: string;
  iso2_country_code?: string;
  iso3_country_code?: string;
  state_name?: string;
  iso2_state_code?: string;
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
  state?: string | null;
  country?: string;
  country_details?: {
    flags?: {
      png?: string;
      svg?: string;
      alt?: string;
    };
    name?: {
      common?: string;
      official?: string;
      nativeName?: Record<string, { official?: string; common?: string }>;
    };
    region?: string;
    subregion?: string;
  };
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

export async function fetchCityDetail(city: string, opts?: { state?: string | null; country?: string | null }): Promise<CityDetail> {
  if (USE_FIXTURE_DETAIL) {
    return {...(fixtureCityDetail as CityDetail), city};
  }

  const params = new URLSearchParams();
  if (opts?.state) {
    params.set("state", opts.state);
  }
  if (opts?.country) {
    params.set("country", opts.country);
  }

  const query = params.toString();
  const url = `${BASE_URL}/get-city-detail/${encodeURI(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

