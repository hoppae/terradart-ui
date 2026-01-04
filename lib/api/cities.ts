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

type CitySection = "base" | "summary" | "weather" | "activities" | "places";
type CityInclude = CitySection;
type CitySectionKey = CitySection;
export type CitySectionErrors = Partial<Record<CitySectionKey, unknown>>;
type FetchCityDetailOptions = { state?: string | null; country?: string | null; includes?: CityInclude[] };
type FetchCitySectionOptions = { state?: string | null; country?: string | null };
const DEFAULT_CITY_SECTIONS: CityInclude[] = ["base", "summary", "weather", "activities", "places"];

export async function fetchCityByRegion(region: string, wantsCapital: boolean): Promise<CityResponse> {
  const capitalSuffix = wantsCapital ? "?capital=true" : "";
  const url = `${BASE_URL}/get-city/region/${region}/${capitalSuffix}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();

}

export type CountryEntry = {
  code: string; // iso2
  code3?: string; // iso3
  name: string;
};

export type StateEntry = {
  code: string;
  name: string;
};

export type CityOption = {
  id: string | number;
  name: string;
};

export async function fetchCountries(): Promise<CountryEntry[]> {
  const url = `${BASE_URL}/countries/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: Array<{ name?: { common?: string }; cca2?: string; cca3?: string }> = await response.json();

  return (payload ?? [])
    .filter((item) => item?.cca2)
    .map((item) => ({
      code: (item.cca2 ?? "").toUpperCase(),
      code3: item.cca3 ? item.cca3.toUpperCase() : undefined,
      name: item.name?.common ?? item.cca2 ?? "Unknown",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchStates(countryIso2: string): Promise<StateEntry[]> {
  const code = countryIso2.trim().toUpperCase();
  if (!code) return [];

  const url = `${BASE_URL}/country/${encodeURIComponent(code)}/states/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: Array<{ name?: string; iso2?: string }> = await response.json();

  return (payload ?? [])
    .filter((item) => item?.iso2)
    .map((item) => ({
      code: (item.iso2 ?? "").toUpperCase(),
      name: item.name ?? item.iso2 ?? "Unknown",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCitiesByCountry(countryIso2: string): Promise<CityOption[]> {
  const code = countryIso2.trim().toUpperCase();
  if (!code) return [];

  const url = `${BASE_URL}/country/${encodeURIComponent(code)}/cities/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: Array<{ id?: string | number; name?: string; iso2?: string }> = await response.json();

  return (payload ?? [])
    .filter((item) => item?.id && item?.name)
    .map((item) => ({
      id: item.id ?? "Unknown",
      name: item.name ?? "Unknown",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCitiesByState(countryIso2: string, stateIso2: string): Promise<CityOption[]> {
  const country = countryIso2.trim().toUpperCase();
  const state = stateIso2.trim().toUpperCase();
  if (!country || !state) return [];

  const url = `${BASE_URL}/country/${encodeURIComponent(country)}/state/${encodeURIComponent(state)}/cities/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload: Array<{ id?: string | number; name?: string; iso2?: string }> = await response.json();

  return (payload ?? [])
    .filter((item) => item?.id && item?.name)
    .map((item) => ({
      id: item.id ?? "Unknown",
      name: item.name ?? "Unknown",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type CityDetail = {
  city?: string;
  state?: string | null;
  country?: string;
  summary?: string;
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
    summary: (data as Partial<CityDetail>).summary ?? (base as Partial<CityDetail>).summary,
    weather: (data as Partial<CityDetail>).weather ?? (base as Partial<CityDetail>).weather,
    activities: (data as Partial<CityDetail>).activities ?? (base as Partial<CityDetail>).activities,
    places: (data as Partial<CityDetail>).places ?? (base as Partial<CityDetail>).places,
    errors: payload?.errors,
  };
};

export async function fetchCityDetail(city: string, opts?: FetchCityDetailOptions): Promise<CityDetail> {
  if (USE_FIXTURE_DETAIL) {
    return {...(fixtureCityDetail as CityDetail), city};
  }

  const params = buildParams(opts);
  const includes = opts?.includes ?? DEFAULT_CITY_SECTIONS;
  if (includes.length > 0) {
    params.set("includes", includes.join(","));
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
  return fetchCityDetail(city, { ...opts, includes: ["base"] });
}

export async function fetchCitySummary(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "summary" | "errors">> {
  const detail = await fetchCityDetail(city, { ...opts, includes: ["summary"] });
  return { summary: detail.summary, errors: detail.errors };
}

export async function fetchCityWeather(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "weather" | "errors">> {
  const detail = await fetchCityDetail(city, { ...opts, includes: ["weather"] });
  return { weather: detail.weather, errors: detail.errors };
}

export async function fetchCityActivities(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "activities" | "errors">> {
  const detail = await fetchCityDetail(city, { ...opts, includes: ["activities"] });
  return { activities: detail.activities, errors: detail.errors };
}

export async function fetchCityPlaces(
  city: string,
  opts?: FetchCitySectionOptions,
): Promise<Pick<CityDetail, "places" | "errors">> {
  const detail = await fetchCityDetail(city, { ...opts, includes: ["places"] });
  return { places: detail.places, errors: detail.errors };
}

type SectionHandler<T> = {
  onSuccess?: (result: T) => void;
  onError?: (message: string) => void;
  onFinally?: () => void;
};

export type LoadCityHandlers = {
  base?: SectionHandler<CityDetail>;
  summary?: SectionHandler<Pick<CityDetail, "summary" | "errors">>;
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
      if (message.toLowerCase().includes("aborted")) return;
      if (cancelled) return;
      handler?.onError?.(message);
    } finally {
      if (cancelled) return;
      handler?.onFinally?.();
    }
  };

  runSection(() => fetchCityBase(city, opts), handlers.base);
  runSection(() => fetchCitySummary(city, opts), handlers.summary);
  runSection(() => fetchCityWeather(city, opts), handlers.weather);
  runSection(() => fetchCityActivities(city, opts), handlers.activities);
  runSection(() => fetchCityPlaces(city, opts), handlers.places);

  return () => {
    cancelled = true;
  };
}
