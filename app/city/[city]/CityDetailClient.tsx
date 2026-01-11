"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Landmark, MapPinned, TentTree, ArrowLeft, Cloud, CloudRain, CloudSnow, Sun, Loader2, BottleWine } from "lucide-react";
import { CityDetail, CityInitialData, fetchCitySummary, fetchCityWeather, fetchCityActivities, fetchCityPlaces } from "@/lib/api/cities";
import { ActivityModal } from "./ActivityModal";
import { PlaceModal } from "./PlaceModal";
import { ActivityCard } from "../ActivityCard";
import { PlaceCard } from "../PlaceCard";
import { ActivitiesSkeletonGrid, LocationSkeleton, OverviewSkeleton, PlacesSkeletonGrid } from "../Skeletons";
import { toTitleCase } from "@/lib/utils";

const EMPTY_ACTIVITIES: NonNullable<CityDetail["activities"]> = [];

type Props = {
  initialData: CityInitialData;
  cityParam: string;
  stateParam?: string | null;
  countryParam?: string | null;
  subHeader: string;
};

export default function CityDetailClient({ initialData, cityParam, stateParam, countryParam, subHeader }: Props) {
  const [detail, setDetail] = useState<CityDetail>({
    city: initialData.city,
    state: initialData.state,
    country: initialData.country,
    country_details: initialData.country_details,
    coordinates: initialData.coordinates,
    errors: initialData.errors,
  });

  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [placesPage, setPlacesPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const mergeErrors = (existing?: CityDetail["errors"], incoming?: CityDetail["errors"]) =>
    existing || incoming ? { ...(existing ?? {}), ...(incoming ?? {}) } : undefined;

  const resolvedState = detail?.state ?? stateParam ?? "";
  const resolvedCountry = detail?.country ?? countryParam ?? "";

  const formattedCity = useMemo(() => {
    const source = detail?.city ?? cityParam;
    return toTitleCase(source);
  }, [cityParam, detail?.city]);

  useEffect(() => {
    let cancelled = false;
    const opts = { state: stateParam, country: countryParam };

    const fetchSection = async <T,>(
      fetcher: () => Promise<T>,
      onSuccess: (result: T) => void,
      onError: (key: string, message: string) => void,
      errorKey: string,
      setLoading: (loading: boolean) => void,
    ) => {
      try {
        const result = await fetcher();
        if (!cancelled) onSuccess(result);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : String(error);
          onError(errorKey, message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSection(
      () => fetchCitySummary(cityParam, opts),
      (result) => {
        setDetail((prev) => ({
          ...prev,
          summary: result.summary,
          errors: mergeErrors(prev.errors, result.errors),
        }));
      },
      (key, message) => {
        setDetail((prev) => ({
          ...prev,
          errors: mergeErrors(prev.errors, { [key]: message }),
        }));
      },
      "summary",
      setLoadingSummary,
    );

    fetchSection(
      () => fetchCityWeather(cityParam, opts),
      (result) => {
        setDetail((prev) => ({
          ...prev,
          weather: result.weather,
          errors: mergeErrors(prev.errors, result.errors),
        }));
      },
      (key, message) => {
        setDetail((prev) => ({
          ...prev,
          errors: mergeErrors(prev.errors, { [key]: message }),
        }));
      },
      "weather",
      setLoadingWeather,
    );

    fetchSection(
      () => fetchCityActivities(cityParam, opts),
      (result) => {
        setDetail((prev) => ({
          ...prev,
          activities: result.activities,
          errors: mergeErrors(prev.errors, result.errors),
        }));
      },
      (key, message) => {
        setDetail((prev) => ({
          ...prev,
          errors: mergeErrors(prev.errors, { [key]: message }),
        }));
      },
      "activities",
      setLoadingActivities,
    );

    fetchSection(
      () => fetchCityPlaces(cityParam, opts),
      (result) => {
        setDetail((prev) => ({
          ...prev,
          places: result.places,
          errors: mergeErrors(prev.errors, result.errors),
        }));
      },
      (key, message) => {
        setDetail((prev) => ({
          ...prev,
          errors: mergeErrors(prev.errors, { [key]: message }),
        }));
      },
      "places",
      setLoadingPlaces,
    );

    return () => {
      cancelled = true;
    };
  }, [cityParam, stateParam, countryParam]);

  const isAnyLoading = loadingSummary || loadingActivities || loadingPlaces || loadingWeather;
  const isOverviewLoading = loadingSummary && !detail?.summary;
  const isActivitiesLoading = loadingActivities;
  const isPlacesLoading = loadingPlaces;

  useEffect(() => {
    const computePerPage = () => {
      if (typeof window === "undefined") return 1;
      const w = window.innerWidth;
      if (w >= 1280) return 4;
      if (w >= 1024) return 3;
      if (w >= 640) return 2;
      return 1;
    };
    const update = () => setItemsPerPage(computePerPage());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const activities: NonNullable<CityDetail["activities"]> = detail?.activities ?? EMPTY_ACTIVITIES;
  const places: NonNullable<CityDetail["places"]> = useMemo(
    () => detail?.places ?? [],
    [detail?.places],
  );
  const pageCount = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const sortedPlaces = useMemo(() => {
    const score = (place: NonNullable<CityDetail["places"]>[number]) => {
      const hasImages = (place.photos?.length ?? 0) > 0;
      const hasDescription = !!place.description;
      if (hasImages && hasDescription) return 3;
      if (hasImages) return 2;
      if (hasDescription) return 1;
      return 0;
    };

    return [...places].sort((a, b) => score(b) - score(a));
  }, [places]);

  const placesPageCount = Math.max(1, Math.ceil(sortedPlaces.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const currentPlacesPage = Math.min(placesPage, placesPageCount - 1);
  const start = currentPage * itemsPerPage;
  const placesStart = currentPlacesPage * itemsPerPage;
  const visibleActivities = activities.slice(start, start + itemsPerPage);
  const visiblePlaces = sortedPlaces.slice(placesStart, placesStart + itemsPerPage);

  const countryName = detail?.country_details?.name?.common;
  const locationQuery = encodeURIComponent(
    [formattedCity, resolvedState || countryName].filter(Boolean).join(", ") || formattedCity,
  );

  const weatherCurrent = detail?.weather?.current;
  const weatherNext = detail?.weather?.next_day;
  const weatherUnits = detail?.weather?.raw?.current_weather_units;
  const tempUnit = weatherUnits?.temperature ?? "°C";
  const windUnitRaw = weatherUnits?.windspeed ?? "km/h";
  const windUnit = windUnitRaw === "mp/h" ? "mph" : windUnitRaw;
  const hasWeather = !!weatherCurrent;
  const isLocationLoading = loadingWeather && !hasWeather;
  const currentWeatherTime = weatherCurrent?.time
    ? (() => {
        const d = new Date(weatherCurrent.time);
        const time = d.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
        const date = `${months[d.getMonth()]} ${d.getDate()}`;
        return `${time}, ${date}`;
      })()
    : undefined;

  const getWeatherIcon = (code?: number) => {
    if (code === undefined || code === null) return <Cloud className="h-7 w-7 text-primary" />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className="h-7 w-7 text-primary" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="h-7 w-7 text-primary" />;
    if ([0, 1].includes(code)) return <Sun className="h-7 w-7 text-primary" />;
    return <Cloud className="h-7 w-7 text-primary" />;
  };

  const formatWeatherSummary = (code?: number) => {
    if (code === undefined || code === null) return undefined;
    if ([0].includes(code)) return "Clear";
    if ([1, 2].includes(code)) return "Mostly clear";
    if ([3].includes(code)) return "Cloudy";
    if ([51, 53, 55].includes(code)) return "Drizzle";
    if ([61, 63, 65].includes(code)) return "Rain";
    if ([71, 73, 75].includes(code)) return "Snow";
    if ([80, 81, 82].includes(code)) return "Showers";
    if ([95, 96, 99].includes(code)) return "Storms";
    return "Mixed";
  };

  const currentWeatherSummary = formatWeatherSummary(weatherCurrent?.weathercode);

  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) {
      return null;
    }
    return activities.find((activity) => activity.id === selectedActivityId || activity.name === selectedActivityId) ?? null;
  }, [activities, selectedActivityId]);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) {
      return null;
    }
    return places.find((place) => place.fsq_place_id === selectedPlaceId || place.name === selectedPlaceId) ?? null;
  }, [places, selectedPlaceId]);

  return (
    <>
      <div className="min-h-screen bg-background px-4 md:px-8 py-3 font-sans text-foreground">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between pb-1 md:pb-2">
          <p className="tracking-[0.1em] text-primary text-lg">
            TERRADART
          </p>

          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </header>

        <main className="mx-auto w-full max-w-7xl space-y-6">
          <section className="flex flex-wrap items-baseline mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight mb-1">
                Discover {formattedCity}
                {isAnyLoading && (
                  <Loader2
                    className="ml-2 inline-block h-6 w-6 translate-y-[1px] animate-spin text-primary/80 align-middle"
                    aria-label="Loading city data"
                  />
                )}
              </h1>
              {(resolvedState || resolvedCountry || detail?.country_details?.name?.common) && (
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 text-muted-foreground ml-[2px]">
                  {detail?.country_details?.flags?.png && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.country_details.flags.png}
                      alt={detail.country_details.flags.alt || "Country flag"}
                      className="h-6 w-8 rounded-xs"
                    />
                  )}
                  {[resolvedState, detail?.country_details?.name?.common].filter(Boolean).join(", ") && (
                    <>
                    <span className="text-lg sm:text-xl">
                      {[resolvedState, detail?.country_details?.name?.common].filter(Boolean).join(", ")}
                    </span>
                    <span className="text-base hidden md:block md:mt-[1px]">•</span>
                    <span className="text-base md:mt-[1px]">{subHeader}</span>
                    </>
                  )}
                </div>
              )}
            </div>

          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm h-[24rem]">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <Landmark className="h-5 w-5" />
                Overview
              </div>
              {isOverviewLoading ? (
                <OverviewSkeleton />
              ) : (
                <div className="text-muted-foreground h-[19.5rem] overflow-y-auto pr-1">
                  {Boolean(detail?.errors?.summary) ? (
                    <p className="text-destructive mb-2">Unable to load overview for this city.</p>
                  ) : (
                    <p>{detail?.summary || "No overview available for this city yet."}</p>
                  )}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm h-[24rem]">
              <div className="mb-1 sm:mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <MapPinned className="h-5 w-5" />
                Location
              </div>
              {isLocationLoading ? (
                <LocationSkeleton />
              ) : (
                <>
                  {hasWeather && (
                    <div className="mb-2 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="mr-1">
                          <div className="flex text-2xl font-semibold text-foreground gap-2">
                            <div className="mt-[3px]">{getWeatherIcon(weatherCurrent.weathercode)}</div>
                            <div className="self-center">
                              {weatherCurrent.temperature !== undefined ? `${weatherCurrent.temperature}${tempUnit}` : "—"}
                            </div>
                          </div>
                          {currentWeatherTime && (
                            <div className="text-xs justify-self-end">{currentWeatherTime}</div>
                          )}
                        </div>
                        <div className="flex flex-col lg:gap-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-x-1 overflow-hidden text-ellipsis text-xs lg:text-sm">
                            <span className="font-semibold text-primary text-sm">Today</span>
                            {currentWeatherSummary && (
                              <>
                                <span>•</span>
                                <span>{currentWeatherSummary}</span>
                              </>
                            )}
                            {weatherCurrent.precipitation_probability !== undefined && (
                              <>
                                <span>•</span>
                                <span>Precip: {weatherCurrent.precipitation_probability}%</span>
                              </>
                            )}
                            {weatherCurrent.humidity !== undefined && (
                              <>
                                <span>•</span>
                                <span>Humidity: {weatherCurrent.humidity}%</span>
                              </>
                            )}
                            {weatherCurrent.windspeed !== undefined && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">Wind: {weatherCurrent.windspeed} {windUnit}</span>
                              </>
                            )}
                          </div>
                          {weatherNext && (
                            <div className="flex flex-wrap items-center gap-x-1 overflow-hidden text-ellipsis text-xs lg:text-sm">
                              <span className="font-semibold text-primary text-sm">Tomorrow</span>
                              {formatWeatherSummary(weatherNext.weathercode) && (
                                <>
                                  <span>•</span>
                                  <span>{formatWeatherSummary(weatherNext.weathercode)}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>
                                {weatherNext.temperature_max !== undefined ? `${weatherNext.temperature_max}${tempUnit}` : "—"} /{" "}
                                {weatherNext.temperature_min !== undefined ? `${weatherNext.temperature_min}${tempUnit}` : "—"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {!loadingWeather && !hasWeather && Boolean(detail?.errors?.weather) && (
                    <p className="text-destructive">Unable to load weather for this city.</p>
                  )}
                  <div className={`space-y-2 text-muted-foreground ${hasWeather ? "h-[16rem]" : "h-[19.5rem]"}`}>
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm h-full">
                      <iframe title={`Map of ${formattedCity}`} className="h-full w-full border-0"
                        src={`https://www.google.com/maps/?q=${locationQuery}&z=8&output=embed`}
                        referrerPolicy="no-referrer-when-downgrade"/>
                    </div>
                  </div>
                </>
              )}
            </article>

            <article className="md:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <TentTree className="h-5 w-5" />
                Activities
              </div>
              {isActivitiesLoading && <ActivitiesSkeletonGrid count={itemsPerPage} />}
              {!isActivitiesLoading && Boolean(detail?.errors?.activities) && (
                <p className="text-destructive">Unable to load activities for this city.</p>
              )}
              {!isActivitiesLoading &&
                !detail?.errors?.activities &&
                (!detail?.activities || detail.activities.length === 0) && (
                <p className="text-muted-foreground">No activities found for this city.</p>
              )}
              {!isActivitiesLoading && detail?.activities && detail.activities.length > 0 && (
                <>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleActivities.map((activity, index) => {
                      const image = activity.pictures?.[0];
                      const activityId = activity.id ?? `${activity.name ?? "activity"}-${start + index}`;
                      const shortDescription = activity.shortDescription || activity.description || "No description provided.";
                      const hasMore = !!activity.description;

                      return (
                        <ActivityCard
                          key={activityId}
                          activity={activity}
                          image={image}
                          shortDescription={shortDescription}
                          hasMore={hasMore}
                          onShowMore={() => setSelectedActivityId(activityId)}
                        />
                      );
                    })}
                  </div>

                  {pageCount > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <button type="button" className="rounded-full border border-border px-3 py-2 font-medium text-primary transition
                        hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}>
                        Back
                      </button>
                      <span>
                        Page {currentPage + 1} of {pageCount}
                      </span>
                      <button type="button" className="rounded-full border border-border px-3 py-2 font-medium text-primary transition
                        hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage >= pageCount - 1}
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>

            <article className="md:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <BottleWine className="h-5 w-5" />
                Places
              </div>
              {isPlacesLoading && <PlacesSkeletonGrid count={itemsPerPage} />}
              {!isPlacesLoading && Boolean(detail?.errors?.places) && (
                <p className="text-destructive">Unable to load places for this city.</p>
              )}
              {!isPlacesLoading &&
                !detail?.errors?.places &&
                (!places || places.length === 0) && (
                <p className="text-muted-foreground">No places found for this city.</p>
              )}
              {!isPlacesLoading && places && places.length > 0 && (
                <>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visiblePlaces.map((place, idx) => {
                      const placeId = place.fsq_place_id ?? place.name ?? `place-${placesStart + idx}`;
                      return (
                        <PlaceCard
                          key={placeId}
                          place={place}
                          onShowMore={() => setSelectedPlaceId(placeId)}
                        />
                      );
                    })}
                  </div>

                  {placesPageCount > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <button type="button" className="rounded-full border border-border px-3 py-2 font-medium text-primary transition
                        hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPlacesPage === 0}
                        onClick={() => setPlacesPage((p) => Math.max(0, p - 1))}>
                        Back
                      </button>
                      <span>
                        Page {currentPlacesPage + 1} of {placesPageCount}
                      </span>
                      <button type="button" className="rounded-full border border-border px-3 py-2 font-medium text-primary transition
                        hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPlacesPage >= placesPageCount - 1}
                        onClick={() => setPlacesPage((p) => Math.min(placesPageCount - 1, p + 1))}>
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          </section>
        </main>
      </div>

      {selectedActivity && (
        <ActivityModal key={selectedActivity.id ?? selectedActivity.name ?? "activity-modal"}
          activity={selectedActivity} onClose={() => setSelectedActivityId(null)}/>
      )}

      {selectedPlace && (
        <PlaceModal
          key={selectedPlace.fsq_place_id ?? selectedPlace.name ?? "place-modal"}
          place={selectedPlace}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}

    </>
  );
}
