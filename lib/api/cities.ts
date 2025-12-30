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
  wikipedia_extract?: string;
  weather?: {
    current?: {
      time?: string;
      temperature?: number;
      apparent_temperature?: number;
      humidity?: number;
      precipitation?: number;
      precipitation_probability?: number;
      windspeed?: number;
      winddirection?: number;
      cloudcover?: number;
      weathercode?: number;
    };
    next_day?: {
      date?: string;
      temperature_max?: number;
      temperature_min?: number;
      precipitation_sum?: number;
      precipitation_probability_max?: number;
      weathercode?: number;
    };
    raw?: {
      current_weather_units?: {
        time?: string;
        interval?: string;
        temperature?: string;
        windspeed?: string;
        winddirection?: string;
        is_day?: string;
        weathercode?: string;
      };
      current_weather?: {
        time?: string;
        interval?: number;
        temperature?: number;
        windspeed?: number;
        winddirection?: number;
        is_day?: number;
        weathercode?: number;
      };
    };
  };
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
  places?: Array<{
    fsq_place_id?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
    link?: string;
    description?: string;
    popularity?: number;
    rating?: number;
    price?: number;
    attributes?: Record<string, unknown>;
    hours?: {
      display?: string;
      is_local_holiday?: boolean;
      open_now?: boolean;
      regular?: Array<{ day?: number; open?: string; close?: string }>;
    };
    categories?: Array<{
      fsq_category_id?: string;
      name?: string;
      short_name?: string;
      plural_name?: string;
      icon?: { prefix?: string; suffix?: string };
    }>;
    location?: {
      address?: string;
      locality?: string;
      region?: string;
      admin_region?: string;
      postcode?: string;
      country?: string;
      formatted_address?: string;
    };
    photos?: Array<{
      fsq_photo_id?: string;
      created_at?: string;
      prefix?: string;
      suffix?: string;
      width?: number;
      height?: number;
      classifications?: string[];
    }>;
    stats?: {
      total_photos?: number;
      total_ratings?: number;
      total_tips?: number;
    };
    tastes?: string[];
    social_media?: Record<string, string>;
    tel?: string;
    website?: string;
    email?: string;
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

