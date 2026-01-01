"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Earth, Loader2 } from "lucide-react";
import { fetchCityByRegion } from "@/lib/api/cities";


const regions = [
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "americas", label: "Americas" },
  { value: "oceania", label: "Oceania" },
  { value: "africa", label: "Africa" },
  // { value: "north america", label: "North America" },
  // { value: "south america", label: "South America" },
  // { value: "arctic", label: "Arctic" }
];

const trendingCities = [
  { name: "Tokyo", country: "JP" },
  { name: "Paris", country: "FR" },
  { name: "New York City", country: "US" },
  { name: "London", country: "GB" },
  { name: "Sydney", country: "AU" },
  { name: "Cape Town", country: "ZA" },
  { name: "San Salvador", country: "SV" },
  { name: "Dubai", country: "AE" },
  { name: "Toronto", country: "CA" },
  { name: "Mexico City", country: "MX" },
  { name: "Mumbai", country: "IN" },
  { name: "Berlin", country: "DE" },
  { name: "Seoul", country: "KR" },
  { name: "Barcelona", country: "ES" },
  { name: "Singapore", country: "SG" },
  { name: "Buenos Aires", country: "AR" },
  { name: "Istanbul", country: "TR" },
  { name: "Los Angeles", country: "US" },
  { name: "Moscow", country: "RU" },
  { name: "Lima", country: "PE" },
  { name: "Cairo", country: "EG" },
  { name: "Lisbon", country: "PT" },
  { name: "Amsterdam", country: "NL" },
  { name: "Bangkok", country: "TH" },
];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("europe");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wantsCapital, setWantsCapital] = useState(true);
  const router = useRouter();
  const [isRegionMenuOpen, setRegionMenuOpen] = useState(false);
  const regionMenuRef = useRef<HTMLDivElement>(null);
  const regionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isRegionMenuOpen) {
      return undefined;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        regionMenuRef.current?.contains(target ?? null) ||
        regionButtonRef.current?.contains(target ?? null)
      ) {
        return;
      }
      setRegionMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isRegionMenuOpen]);

  const activeRegionLabel = regions.find((region) => region.value === selectedRegion)?.label ?? "Region";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      const data = await fetchCityByRegion(selectedRegion, wantsCapital);

      if (data && data.city) {
        const city = encodeURIComponent(data.city);
        const params = new URLSearchParams();
        if (data.state_name) {
          params.set("state", data.state_name);
        }
        if (data.iso2_country_code) {
          params.set("country", data.iso2_country_code);
        }
        const suffix = params.toString() ? `?${params.toString()}` : "";
        router.push(`/city/${city}${suffix}`);
      } else {
        throw new Error("City not found.");
      }

    } catch (error) {
      console.error("Fetch error:", error);
      setStatus("Something went wrong. Please wait a few moments and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen lg:items-center justify-center bg-gradient-to-br from-emerald-50 via-white
      to-sky-50 px-0 lg:px-4 font-sans text-zinc-900">
      <main className="w-full min-h-screen lg:min-h-fit lg:max-w-3xl bg-transparent
        lg:bg-white/80 p-6 lg:p-10 lg:rounded-3xl lg:border lg:border-white/60 lg:shadow-xl lg:backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="space-y-2">
            <p className="uppercase tracking-[0.2em] text-emerald-600">
              Terradart
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Find your next spot.
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600">
              Choose a region and Terradart will take you to a city in that area.
              Perfect for planning your next adventure, or just exploring the world.
            </p>
          </div>
        </div>

        <form className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 shadow-sm transition"
          onSubmit={handleSubmit}>
          <div className="pb-5">
          <label className="text-sm font-medium text-zinc-700">
            Pick a region:
          </label>
          <div className="relative w-full mt-1">
            <div ref={regionMenuRef} className="relative">
              <button ref={regionButtonRef} type="button" className="flex w-full items-center justify-between rounded-xl border border-zinc-300
                bg-white px-4 py-3 text-left text-base text-zinc-900 shadow-sm outline-none ring-emerald-200 transition hover:border-emerald-300
                focus:border-emerald-300 focus:ring-4 focus:ring-emerald-200" aria-haspopup="listbox" aria-expanded={isRegionMenuOpen}
                onClick={() => setRegionMenuOpen((open) => !open)}>
                <span>{activeRegionLabel}</span>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </button>
              {isRegionMenuOpen && (
                <div className="region-menu absolute left-0 right-0 z-10 mt-2 max-h-60 overflow-auto rounded-2xl
                  border border-zinc-200 bg-white shadow-lg ring-1 ring-black/5">
                  <div role="listbox" aria-label="Region options">
                    {regions.map((region) => {
                      const isActive = region.value === selectedRegion;

                      return (
                        <button key={region.value} type="button" className={`w-full px-4 py-3 text-left text-sm font-medium transition
                          ${isActive ? "bg-emerald-50 text-emerald-700" : "text-zinc-800 hover:bg-emerald-50 hover:text-emerald-700"}`}
                          onClick={() => { setSelectedRegion(region.value); setRegionMenuOpen(false); }}>
                          {region.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          <div className="flex justify-between">
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="text-sm font-medium text-zinc-700 pb-2">
                Go to a:
              </legend>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cityType"
                  value="capital"
                  checked={wantsCapital}
                  onChange={() => setWantsCapital(true)}
                  className="h-4 w-4 border-emerald-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-400"
                />
                Capital city
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cityType"
                  value="random"
                  checked={!wantsCapital}
                  onChange={() => setWantsCapital(false)}
                  className="h-4 w-4 border-emerald-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-400"
                />
                Random city
              </label>
            </fieldset>

            <button type="submit" className="flex self-end px-5 py-3 rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-lg shadow-emerald-600/30
              transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-80"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="ml-2">Loading...</span>
                </>
              ) : (
                <>
                  <Earth />
                  <span className="ml-2">Discover</span>
                </>
              )}
            </button>
          </div>
        </form>

        {status && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
            {status}
          </div>
        )}

        <div className="mt-6 space-y-2 text-xs">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-zinc-900">Discover a trending city:</span>
            {trendingCities.map((city) => (
              <Link key={city.name} prefetch={false} className="font-semibold text-emerald-600 transition hover:text-emerald-700
                hover:underline underline-offset-2 decoration-emerald-200 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-emerald-300" href={`/city/${encodeURIComponent(city.name)}?country=${city.country}`}>
                {city.name !== "New York City" ? city.name : "New York"}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
