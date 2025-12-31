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

type CityInclude = "activities" | "places" | "weather" | "wikipedia";
type CitySectionKey = "activities" | "places" | "weather" | "wikipedia_extract";
export type CitySectionErrors = Partial<Record<CitySectionKey, unknown>>;
type FetchCityDetailOptions = { state?: string | null; country?: string | null; include?: CityInclude[] };
type FetchCitySectionOptions = { state?: string | null; country?: string | null };
const DEFAULT_CITY_SECTIONS: CityInclude[] = ["activities", "places", "weather", "wikipedia"];

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
  errors?: CitySectionErrors;
};

type CityDetailPayload = {
  data?: Partial<CityDetail> & { base?: Partial<CityDetail> };
  errors?: CitySectionErrors;
};

type CitySectionPayload<T> = {
  data?: T;
  errors?: CitySectionErrors;
};

const buildParams = (opts?: { state?: string | null; country?: string | null }) => {
  const params = new URLSearchParams();
  if (opts?.state) {
    params.set("state", opts.state);
  }
  if (opts?.country) {
    params.set("country", opts.country);
  }
  return params;
};

const normalizeCityDetail = (payload: CityDetailPayload): CityDetail => {
  const data = payload?.data ?? {};
  const base = (data as { base?: Partial<CityDetail> }).base ?? data;

  return {
    ...(base as CityDetail),
    activities: (data as Partial<CityDetail>).activities ?? (base as Partial<CityDetail>).activities,
    places: (data as Partial<CityDetail>).places ?? (base as Partial<CityDetail>).places,
    weather: (data as Partial<CityDetail>).weather ?? (base as Partial<CityDetail>).weather,
    wikipedia_extract: (data as Partial<CityDetail>).wikipedia_extract ?? (base as Partial<CityDetail>).wikipedia_extract,
    errors: payload?.errors,
  };
};

export async function fetchCityDetail(city: string, opts?: FetchCityDetailOptions): Promise<CityDetail> {
  if (USE_FIXTURE_DETAIL) {
    return {...(fixtureCityDetail as CityDetail), city};
  }

  const params = buildParams(opts);
  const include = opts?.include ?? DEFAULT_CITY_SECTIONS;
  if (include.length > 0) {
    params.set("include", include.join(","));
  }

  const query = params.toString();
  const url = `${BASE_URL}/get-city-detail/${encodeURIComponent(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: CityDetailPayload = await response.json();
  return normalizeCityDetail(payload);
}

export async function fetchCityBase(city: string, opts?: FetchCitySectionOptions): Promise<CityDetail> {
  const params = buildParams(opts);
  const query = params.toString();
  const url = `${BASE_URL}/get-city-base/${encodeURIComponent(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: CityDetailPayload = await response.json();
  return normalizeCityDetail(payload);
}

export async function fetchCityWikipedia(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "wikipedia_extract" | "errors">> {
  const params = buildParams(opts);
  const query = params.toString();
  const url = `${BASE_URL}/get-city-wikipedia/${encodeURIComponent(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: CitySectionPayload<{ wikipedia_extract?: string }> = await response.json();
  return {
    wikipedia_extract: payload.data?.wikipedia_extract,
    errors: payload.errors,
  };
}

export async function fetchCityWeather(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "weather" | "errors">> {
  const params = buildParams(opts);
  const query = params.toString();
  const url = `${BASE_URL}/get-city-weather/${encodeURIComponent(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: CitySectionPayload<{ weather?: CityDetail["weather"] }> = await response.json();
  return {
    weather: payload.data?.weather,
    errors: payload.errors,
  };
}

export async function fetchCityActivities(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "activities" | "errors">> {
  const params = buildParams(opts);
  const query = params.toString();
  const url = `${BASE_URL}/get-city-activities/${encodeURIComponent(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: CitySectionPayload<{ activities?: CityDetail["activities"] }> = await response.json();
  return {
    activities: payload.data?.activities,
    errors: payload.errors,
  };
}

export async function fetchCityPlaces(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "places" | "errors">> {
  const params = buildParams(opts);
  const query = params.toString();
  const url = `${BASE_URL}/get-city-places/${encodeURIComponent(city)}/${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: CitySectionPayload<{ places?: CityDetail["places"] }> = await response.json();
  return {
    places: payload.data?.places,
    errors: payload.errors,
  };
}

type SectionHandler<T> = {
  onSuccess?: (result: T) => void;
  onError?: (message: string) => void;
  onFinally?: () => void;
};

export type LoadCityHandlers = {
  base?: SectionHandler<CityDetail>;
  wikipedia?: SectionHandler<Pick<CityDetail, "wikipedia_extract" | "errors">>;
  weather?: SectionHandler<Pick<CityDetail, "weather" | "errors">>;
  activities?: SectionHandler<Pick<CityDetail, "activities" | "errors">>;
  places?: SectionHandler<Pick<CityDetail, "places" | "errors">>;
};

export function loadCitySections(
  city: string,
  opts: FetchCitySectionOptions | undefined,
  handlers: LoadCityHandlers,
): () => void {
  let cancelled = false;

  const runSection = async <T,>(work: () => Promise<T>, handler?: SectionHandler<T>) => {
    try {
      const result = await work();
      if (cancelled) return;
      handler?.onSuccess?.(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (cancelled) return;
      handler?.onError?.(message);
    } finally {
      if (cancelled) return;
      handler?.onFinally?.();
    }
  };

  runSection(() => fetchCityBase(city, opts), handlers.base);
  runSection(() => fetchCityWikipedia(city, opts), handlers.wikipedia);
  runSection(() => fetchCityWeather(city, opts), handlers.weather);
  runSection(() => fetchCityActivities(city, opts), handlers.activities);
  runSection(() => fetchCityPlaces(city, opts), handlers.places);

  return () => {
    cancelled = true;
  };
}
