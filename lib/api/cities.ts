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

type CitySection = "base" | "summary" | "weather" | "activities" | "amadeus_activities" | "viator_activities" | "places";
type CityInclude = CitySection;
type CitySectionKey = CitySection;
export type CitySectionErrors = Partial<Record<CitySectionKey, unknown>>;
type FetchCityDetailOptions = { state?: string | null; country?: string | null; includes?: CityInclude[] };
type FetchCitySectionOptions = { state?: string | null; country?: string | null };
const DEFAULT_CITY_SECTIONS: CityInclude[] = ["base", "summary", "weather", "viator_activities", "places"];

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
  activities?: Array<Activity>;
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

export type Activity = {
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
  rating?: number;
  reviewCount?: number;
  flags?: string[];
  source?: "amadeus" | "viator";
};

export type ViatorActivity = {
  productCode?: string;
  title?: string;
  description?: string;
  images?: Array<{
    imageSource?: string;
    caption?: string;
    isCover?: boolean;
    variants?: Array<{
      height?: number;
      width?: number;
      url?: string;
    }>;
  }>;
  reviews?: {
    sources?: Array<{
      provider?: string;
      totalCount?: number;
      averageRating?: number;
    }>;
    totalReviews?: number;
    combinedAverageRating?: number;
  };
  duration?: {
    fixedDurationInMinutes?: number;
    variableDurationFromMinutes?: number;
    variableDurationToMinutes?: number;
  };
  confirmationType?: string;
  itineraryType?: string;
  pricing?: {
    summary?: {
      fromPrice?: number;
      fromPriceBeforeDiscount?: number;
    };
    currency?: string;
  };
  productUrl?: string;
  destinations?: Array<{
    ref?: string;
    primary?: boolean;
  }>;
  tags?: number[];
  flags?: string[];
  translationInfo?: {
    containsMachineTranslatedText?: boolean;
    translationSource?: string;
  };
};

type CityDetailPayload = {
  data?: {
    // base fields
    city?: string;
    state?: string | null;
    country?: string;
    coordinates?: CityDetail["coordinates"];
    country_details?: CityDetail["country_details"];
    // section fields
    summary?: string;
    weather?: CityDetail["weather"];
    amadeus_activities?: Activity[];
    viator_activities?: ViatorActivity[];
    places?: CityDetail["places"];
  };
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

const getViatorImageUrl = (images?: ViatorActivity["images"], preferredWidth = 720): string | undefined => {
  if (!images || images.length === 0) return undefined;
  const coverImage = images.find((img) => img.isCover) ?? images[0];
  if (!coverImage?.variants || coverImage.variants.length === 0) return undefined;
  const sorted = [...coverImage.variants].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const preferred = sorted.find((v) => (v.width ?? 0) <= preferredWidth) ?? sorted[sorted.length - 1];
  return preferred?.url;
};

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

const getViatorDuration = (duration?: ViatorActivity["duration"]): string | undefined => {
  if (!duration) return undefined;

  if (duration.fixedDurationInMinutes) {
    return formatMinutes(duration.fixedDurationInMinutes);
  }

  const from = duration.variableDurationFromMinutes;
  const to = duration.variableDurationToMinutes;

  if (from && to && from !== to) {
    const fromHours = from / 60;
    const toHours = to / 60;
    if (fromHours === Math.floor(fromHours) && toHours === Math.floor(toHours)) {
      return `${fromHours}-${toHours}h`;
    }
    return `${formatMinutes(from)} - ${formatMinutes(to)}`;
  }

  if (from) return formatMinutes(from);
  if (to) return formatMinutes(to);

  return undefined;
};

const normalizeViatorActivity = (viator: ViatorActivity): Activity => {
  const pictures: string[] = [];
  for (const img of viator.images ?? []) {
    const url = getViatorImageUrl([img], 720);
    if (url) pictures.push(url);
  }

  return {
    id: viator.productCode,
    name: viator.title,
    shortDescription: viator.description,
    description: viator.description,
    bookingLink: viator.productUrl,
    pictures,
    price: viator.pricing?.summary?.fromPrice != null
      ? {
          amount: viator.pricing.summary.fromPrice.toFixed(2),
          currencyCode: viator.pricing.currency ?? "USD",
        }
      : undefined,
    minimumDuration: getViatorDuration(viator.duration),
    rating: viator.reviews?.combinedAverageRating,
    reviewCount: viator.reviews?.totalReviews,
    flags: viator.flags,
    source: "viator",
  };
};

const normalizeCityDetail = (payload: CityDetailPayload): CityDetail => {
  const data = payload?.data ?? {};

  const viatorActivities = (data.viator_activities ?? []).map(normalizeViatorActivity);
  const amadeusActivities = (data.amadeus_activities ?? []).map((a) => ({ ...a, source: "amadeus" as const }));
  const activities = [...viatorActivities, ...amadeusActivities];

  return {
    city: data.city,
    state: data.state,
    country: data.country,
    coordinates: data.coordinates,
    country_details: data.country_details,
    summary: data.summary,
    weather: data.weather,
    activities: activities.length > 0 ? activities : undefined,
    places: data.places,
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
  const detail = await fetchCityDetail(city, { ...opts, includes: ["viator_activities"] });
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
