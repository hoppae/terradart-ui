"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Landmark, MapPinned, TentTree, ArrowLeft } from "lucide-react";
import { fetchCityDetail } from "@/lib/api/cities";
import { ActivityModal } from "./ActivityModal";

type CityDetail = Awaited<ReturnType<typeof fetchCityDetail>>;
const EMPTY_ACTIVITIES: NonNullable<CityDetail["activities"]> = [];

export default function CityDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cityFromPath = params?.city ? decodeURIComponent(params.city as string) : "Unknown city";
  const stateParam = searchParams?.get("state");
  const countryParam = searchParams?.get("country");

  const [detail, setDetail] = useState<CityDetail | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const resolvedState = detail?.state ?? stateParam ?? "";
  const resolvedCountry = detail?.country ?? countryParam ?? "";

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCityDetail(cityFromPath, { state: stateParam, country: countryParam });
        if (!active) return;
        setDetail(data);
        setStatus("");
      } catch (error: any) {
        console.error("City detail fetch error:", error);
        if (!active) return;
        if (error?.message?.includes("404")) {
          router.push("/");
          return;
        }
        setStatus("Unable to load city details. Please try again.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      active = false;
    };
  }, [cityFromPath, stateParam, countryParam]);

  const formattedCity = useMemo(() => {
    const source = detail?.city ?? cityFromPath;
    const cleaned = source.replace(/[-_]+/g, " ").trim();
    return cleaned
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || source;
  }, [cityFromPath, detail?.city]);

  const coordinates = detail?.coordinates;

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
  const pageCount = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * itemsPerPage;
  const visibleActivities = activities.slice(start, start + itemsPerPage);

  const truncate = (text: string, limit = 200) => text.length > limit ? `${text.slice(0, limit)}…` : text;

  const stripHtml = (text?: string) => text ? text.replace(/<[^>]+>/g, "").trim() : "";

  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) {
      return null;
    }
    return activities.find((activity) => activity.id === selectedActivityId || activity.name === selectedActivityId) ?? null;
  }, [activities, selectedActivityId]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 md:px-8 py-4 md:py-8 font-sans text-zinc-900">
        <main className="mx-auto w-full max-w-7xl space-y-6">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">
                Terradart
              </p>
              <h1 className="text-4xl font-semibold leading-tight">
                {formattedCity}
              </h1>
              {(resolvedState || resolvedCountry || detail?.country_details?.region || detail?.country_details?.name?.common) && (
                <div className="flex flex-wrap items-center gap-2 text-[15px] text-zinc-700">
                  {detail?.country_details?.flags?.png && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.country_details.flags.png}
                      alt={detail.country_details.flags.alt || "Country flag"}
                      className="h-5 w-7 rounded border border-emerald-100 object-cover"
                    />
                  )}
                  {[resolvedState, detail?.country_details?.name?.common].filter(Boolean).join(", ") && (
                    <span>
                      {[resolvedState, detail?.country_details?.name?.common].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {/* {detail?.country_details?.region && (
                    <span className="text-zinc-600">Region: {detail.country_details.region}</span>
                  )} */}
                </div>
              )}
            </div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </header>

          {status && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
              {status}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Landmark className="h-5 w-5" />
                Overview
              </div>
              {isLoading && <p className="text-sm text-zinc-600">Loading overview…</p>}
              {!isLoading && (
                <p className="text-zinc-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                  dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <MapPinned className="h-5 w-5" />
                Location
              </div>
              {isLoading ? (
                <div className="h-64 w-full rounded-xl border border-emerald-100 bg-emerald-100 animate-pulse" />
              ) : (
                <div className="space-y-2 text-zinc-700">
                  <div className="overflow-hidden rounded-xl border border-emerald-100 shadow-sm">
                    <iframe
                      title={`Map of ${formattedCity}`}
                      src={`https://www.google.com/maps?q=${coordinates?.latitude && coordinates?.longitude ? `${coordinates.latitude},${coordinates.longitude}` : encodeURIComponent(formattedCity)}&output=embed`}
                      className="h-64 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </article>

            <article className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <TentTree className="h-5 w-5" />
                Activities
              </div>
              {isLoading && <p className="text-zinc-600">Loading activities...</p>}
              {!isLoading && (!detail?.activities || detail.activities.length === 0) && (
                <p className="text-zinc-600">No activities found for this city.</p>
              )}
              {!isLoading && detail?.activities && detail.activities.length > 0 && (
                <>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleActivities.map((activity, index) => {
                      const image = activity.pictures?.[0];
                      const rawPreview = activity.shortDescription || activity.description || "No description provided.";
                      const activityId = activity.id ?? `${activity.name ?? "activity"}-${start + index}`;
                      const shortDescription = stripHtml(rawPreview);
                      const displayDescription = truncate(shortDescription);
                      const hasMore = !!activity.description;

                      return (
                        <div key={activityId} className="flex h-[425px] flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 pt-4 pb-2
                          text-zinc-800 shadow-sm">
                          {image && (
                            <div className="overflow-hidden rounded-lg border border-emerald-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img className="h-40 w-full object-cover" src={image} alt={activity.name ?? "Activity image"} loading="lazy"/>
                            </div>
                          )}
                          <div className="space-y-1 flex-1">
                            <h3 className="text-base font-semibold line-clamp-2" title={activity.name ?? "Activity"}>
                              {activity.name ?? "Activity"}
                            </h3>
                            <p className="text-sm text-zinc-700">{displayDescription}</p>
                          </div>
                          <div className="flex justify-end">
                            {hasMore && (
                              <button type="button" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                onClick={() => setSelectedActivityId(activityId)}>
                                Show more
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pageCount > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
                      <button type="button" className="rounded-full border border-emerald-200 px-3 py-2 font-medium text-emerald-700 transition
                        hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}>
                        Back
                      </button>
                      <span>
                        Page {currentPage + 1} of {pageCount}
                      </span>
                      <button type="button" className="rounded-full border border-emerald-200 px-3 py-2 font-medium text-emerald-700 transition
                        hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage >= pageCount - 1}
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
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

    </>
  );
}

