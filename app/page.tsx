"use client";

import { useState } from "react";
import { ChevronDown, Earth, Loader2 } from "lucide-react";


const regions = [
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "americas", label: "Americas" },
  { value: "oceania", label: "Oceania" },
  { value: "arctic", label: "Arctic" }
];

const BASE_URL = process.env.NODE_ENV === "production" ? "https://terradart.com" : "http://127.0.0.1:8000";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("europe");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/random-city/region/${selectedRegion}/`);

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const data = await response.json();
      console.log("Response:", data);

    } catch (error) {
      console.error("Fetch error:", error);
      setStatus("Something went wrong. Please wait a few moments and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 font-sans text-zinc-900">
      <main className="w-full max-w-3xl rounded-3xl border border-white/60 bg-white/80 p-10 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">
              Terradart
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Find your next spot
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600">
              Choose a region and Terradart will take you to a random city
              in that area. Perfect for planning your next adventure, or just exploring the world.
            </p>
          </div>
        </div>

        <form className="mt-10 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 shadow-sm transition"
          onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-zinc-700">
            Pick a region to discover
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full">
              <select className="w-full appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-base text-zinc-900 shadow-sm outline-none ring-emerald-200
                transition focus:ring-4" value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}>
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>

            <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/30
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
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
            {status}
          </div>
        )}
      </main>
    </div>
  );
}
