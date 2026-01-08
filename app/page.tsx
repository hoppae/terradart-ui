"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Earth, Loader2 } from "lucide-react";
import SearchSelect from "./SearchSelect";
import { useCSCLookup } from "@/lib/hooks/useCSCLookup";
import { fetchCityByRegion } from "@/lib/api/cities";


const regions = [
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "americas", label: "Americas" },
  { value: "oceania", label: "Oceania" },
  { value: "africa", label: "Africa" },
];

const trendingCities = [
  { name: "Paris", country: "FR" },
  { name: "Barcelona", country: "ES" },
  { name: "Rome", country: "IT" },
  { name: "Prague", country: "CZ" },
  { name: "Munich", country: "DE" },
  { name: "Lisbon", country: "PT" },
  { name: "London", country: "GB" },
  { name: "Edinburgh", country: "GB" },
  { name: "New York City", country: "US" },
  { name: "Los Angeles", country: "US" },
  { name: "Mexico City", country: "MX" },
  { name: "Sao Paulo", country: "BR" },
  { name: "Buenos Aires", country: "AR" },
  { name: "Kyoto", country: "JP" },
  { name: "Seoul", country: "KR" },
  { name: "Singapore", country: "SG" },
  { name: "Bangkok", country: "TH" },
  { name: "Doha", country: "QA" },
  { name: "Cape Town", country: "ZA" },
  { name: "Nairobi", country: "KE" },
  { name: "Cairo", country: "EG" },
  { name: "Sydney", country: "AU" },
  { name: "Auckland", country: "NZ" },
];

export default function Home() {
  const [mode, setMode] = useState<"surprise" | "lookup">("lookup");
  const [selectedRegion, setSelectedRegion] = useState("europe");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wantsCapital, setWantsCapital] = useState(true);
  const router = useRouter();
  const {
    countryInput,
    setCountryInput,
    countryQuery,
    setCountryQuery,
    stateInput,
    setStateInput,
    stateQuery,
    setStateQuery,
    cityInput,
    setCityInput,
    cityQuery,
    setCityQuery,
    visibleCountries,
    visibleStates,
    visibleCities,
    cityTotalCount,
    hasCityFetchAttempted,
    selectedCountryLabel,
    selectedStateLabel,
    selectedStateName,
    selectedCityLabel,
    countriesStatus,
    statesStatus,
    citiesStatus,
    isCountriesLoading,
    isStatesLoading,
    isCitiesLoading,
    computeDisplayValue,
    handleCountryListScroll,
    handleStateListScroll,
    handleCityListScroll,
  } = useCSCLookup();
  const [isRegionMenuOpen, setRegionMenuOpen] = useState(false);
  const [isCountryMenuOpen, setCountryMenuOpen] = useState(false);
  const [isStateMenuOpen, setStateMenuOpen] = useState(false);
  const [isCityMenuOpen, setCityMenuOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const activeScrollTargetRef = useRef<HTMLElement | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);
  const regionButtonRef = useRef<HTMLButtonElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const countryButtonRef = useRef<HTMLInputElement>(null);
  const stateMenuRef = useRef<HTMLDivElement>(null);
  const stateButtonRef = useRef<HTMLInputElement>(null);
  const cityMenuRef = useRef<HTMLDivElement>(null);
  const cityButtonRef = useRef<HTMLInputElement>(null);

  const scrollFormIntoViewIfMobile = useCallback((target?: HTMLElement | null) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 640) return; // only for xs screens
    const fieldContainer = (target?.closest("[data-field-container]") as HTMLElement | null) ?? null;
    const element = fieldContainer ?? target ?? formRef.current;
    if (!element) return;
    activeScrollTargetRef.current = element;

    const scrollToForm = (behavior: ScrollBehavior = "smooth") => {
      const el = activeScrollTargetRef.current;
      if (!el) return;
      try {
        el.scrollIntoView({ behavior, block: "start", inline: "nearest" });
      } catch {
        console.error("scrollIntoView element not found.")
      }
    };

    if (resizeCleanupRef.current) {
      resizeCleanupRef.current();
      resizeCleanupRef.current = null;
    }
    const resizeHandler = () => scrollToForm("auto");
    window.addEventListener("resize", resizeHandler);
    resizeCleanupRef.current = () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    return () => {
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
        resizeCleanupRef.current = null;
      }
    };
  }, []);

  const closeAllMenus = () => {
    setRegionMenuOpen(false);
    setCountryMenuOpen(false);
    setStateMenuOpen(false);
    setCityMenuOpen(false);
  };

  useEffect(() => {
    if (!isRegionMenuOpen && !isCountryMenuOpen && !isStateMenuOpen && !isCityMenuOpen) {
      return undefined;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const clickedRegion = regionMenuRef.current?.contains(target ?? null) || regionButtonRef.current?.contains(target ?? null);
      const clickedCountry = countryMenuRef.current?.contains(target ?? null) || countryButtonRef.current?.contains(target ?? null);
      const clickedState = stateMenuRef.current?.contains(target ?? null) || stateButtonRef.current?.contains(target ?? null);
      const clickedCity = cityMenuRef.current?.contains(target ?? null) || cityButtonRef.current?.contains(target ?? null);

      if (clickedRegion || clickedCountry || clickedState || clickedCity) {
        return;
      }
      setRegionMenuOpen(false);
      setCountryMenuOpen(false);
      setStateMenuOpen(false);
      setCityMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isRegionMenuOpen, isCountryMenuOpen, isStateMenuOpen, isCityMenuOpen]);

  useEffect(() => {
    setStateMenuOpen(false);
    setCityMenuOpen(false);
  }, [countryInput]);

  useEffect(() => {
    setCityMenuOpen(false);
  }, [stateInput]);

  const activeRegionLabel = regions.find((region) => region.value === selectedRegion)?.label ?? "Region";
  const isLookupMode = mode === "lookup";
  const countryDisplayValue = computeDisplayValue({
    isOpen: isCountryMenuOpen,
    query: countryQuery,
    input: countryInput,
    label: selectedCountryLabel,
  });
  const stateDisplayValue = computeDisplayValue({
    isOpen: isStateMenuOpen,
    query: stateQuery,
    input: stateInput,
    label: selectedStateLabel,
  });
  const cityDisplayValue = computeDisplayValue({
    isOpen: isCityMenuOpen,
    query: cityQuery,
    input: cityInput,
    label: selectedCityLabel,
  });
  const typedCity = (cityQuery || cityInput).trim();
  const cityOptions = visibleCities.map((entry) => ({
    key: entry.id,
    label: entry.name,
    active: cityInput.toLowerCase() === entry.name.toLowerCase(),
    onSelect: () => {
      setCityInput(entry.name);
      setCityQuery("");
    },
  }));
  const showTypedFallback = cityTotalCount > 0 && cityOptions.length === 0 && typedCity;
  if (showTypedFallback) {
    cityOptions.push({
      key: "typed-city",
      label: `Use "${typedCity}"`,
      active: true,
      onSelect: () => {
        setCityInput(typedCity);
        setCityQuery("");
      },
    });
  }
  const showPlainCityInput = !isCitiesLoading && hasCityFetchAttempted && cityTotalCount === 0;

  const switchMode = (nextMode: "surprise" | "lookup") => {
    setStatus("");
    setMode(nextMode);
    if (nextMode === "lookup") {
      setRegionMenuOpen(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    // Close other dropdowns before routing or fetching
    closeAllMenus();

    if (isLookupMode) {
      const city = cityInput.trim();
      const stateCode = stateInput.trim();
      const stateName = stateCode ? selectedStateName || stateCode : "";
      const country = countryInput.trim();

      if (!city) {
        setStatus("Enter a city name to continue.");
        return;
      }

      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (stateName) {
          params.set("state", stateName);
        }
        if (country) {
          params.set("country", country.toUpperCase());
        }
        const suffix = params.toString() ? `?${params.toString()}` : "";
        router.push(`/city/${encodeURIComponent(city)}${suffix}`);
      } catch (error) {
        console.error("City lookup error:", error);
        setStatus("Unable to look up that city right now. Please try again.");
      } finally {
        setIsLoading(false);
      }

      return;
    }

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
    <div className="flex min-h-screen lg:items-center justify-center bg-background px-0 lg:px-4 font-sans text-foreground">
      <main className="w-full min-h-screen lg:min-h-fit lg:max-w-3xl bg-transparent
        lg:bg-card/80 p-6 lg:p-10 lg:rounded-3xl lg:border lg:border-border lg:shadow-xl lg:backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="space-y-2">
            <p className="tracking-[0.1em] text-primary text-xl">
              TERRADART
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Find your next spot.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Choose a region and let us surprise you, or jump straight to the city you have in mind.
              Perfect for planning your next adventure, or just exploring the world.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm w-fit">
          <button type="button" className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring 
            ${!isLookupMode ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "text-muted-foreground hover:text-primary"}`}
            onClick={() => switchMode("surprise")}>
            Surprise me
          </button>
          <button type="button" className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            ${isLookupMode ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "text-muted-foreground hover:text-primary"}`}
            onClick={() => switchMode("lookup")}>
            Search a city
          </button>
        </div>

        <form ref={formRef} className="mt-5 mb-8" onSubmit={handleSubmit}>
          {isLookupMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
                <SearchSelect
                  label="Country:"
                  required
                  inputRef={countryButtonRef}
                  menuRef={countryMenuRef}
                  value={countryDisplayValue}
                  placeholder={selectedCountryLabel}
                  isOpen={isCountryMenuOpen}
                  setOpen={setCountryMenuOpen}
                  onChange={setCountryQuery}
                  onFocus={() => {
                    scrollFormIntoViewIfMobile(countryButtonRef.current);
                    closeAllMenus();
                  }}
                  onClear={() => { setCountryInput(""); setCountryQuery(""); }}
                  clearLabel="No country"
                  isCleared={countryInput === ""}
                  options={visibleCountries.map((entry) => ({
                    key: entry.code,
                    label: `${(entry.code3 ?? entry.code).toUpperCase()} - ${entry.name}`,
                    active: countryInput.toUpperCase() === entry.code.toUpperCase(),
                    onSelect: () => {
                      setCountryInput(entry.code.toUpperCase());
                      setCountryQuery("");
                    },
                  }))}
                  loading={isCountriesLoading}
                  statusMessage={countriesStatus}
                  emptyMessage="No matches"
                  onScroll={handleCountryListScroll}
                />
                <SearchSelect
                  label="State/Region:"
                  inputRef={stateButtonRef}
                  menuRef={stateMenuRef}
                  value={stateDisplayValue}
                  placeholder={selectedStateLabel}
                  disabled={!countryInput || isStatesLoading}
                  isOpen={isStateMenuOpen}
                  setOpen={setStateMenuOpen}
                  onChange={setStateQuery}
                  onFocus={() => {
                    if (!countryInput || isStatesLoading) return;
                    scrollFormIntoViewIfMobile(stateButtonRef.current);
                    closeAllMenus();
                  }}
                  onClear={() => { setStateInput(""); setStateQuery(""); }}
                  clearLabel="No state"
                  isCleared={stateInput === ""}
                  options={visibleStates.map((entry) => ({
                    key: entry.code,
                    label: `${entry.code} - ${entry.name}`,
                    active: stateInput.toUpperCase() === entry.code.toUpperCase(),
                    onSelect: () => {
                      setStateInput(entry.code.toUpperCase());
                      setStateQuery("");
                    },
                  }))}
                  loading={isStatesLoading}
                  statusMessage={statesStatus}
                  emptyMessage="No matches"
                  onScroll={handleStateListScroll}
                />
              </div>

              <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-[1fr_auto] sm:items-end">
                {showPlainCityInput ? (
                  <div data-field-container="city-plain-input">
                    <label className="text-sm font-medium text-foreground">
                      City:<span className="ml-0.5 text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={cityInput}
                      required
                      disabled={!countryInput}
                      onFocus={() => {
                        if (!countryInput) return;
                        scrollFormIntoViewIfMobile(cityButtonRef.current);
                        closeAllMenus();
                      }}
                      onChange={(event) => {
                        setCityInput(event.target.value);
                        setCityQuery("");
                      }}
                      placeholder="Enter city"
                      className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground shadow-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-ring ring-ring disabled:cursor-not-allowed disabled:opacity-80"
                    />
                    <p className="text-xs text-muted-foreground absolute ml-2 mt-1">No cities found. Try entering one manually.</p>
                  </div>
                ) : (
                  <SearchSelect
                    label="City:"
                    required
                    inputRef={cityButtonRef}
                    menuRef={cityMenuRef}
                    value={cityDisplayValue}
                    placeholder={selectedCityLabel}
                    disabled={!countryInput || isCitiesLoading}
                    isOpen={isCityMenuOpen}
                    setOpen={setCityMenuOpen}
                    onChange={setCityQuery}
                    onFocus={() => {
                      if (!countryInput || isCitiesLoading) return;
                      scrollFormIntoViewIfMobile(cityButtonRef.current);
                      closeAllMenus();
                    }}
                    onClear={() => { setCityInput(""); setCityQuery(""); }}
                    clearLabel="No city"
                    isCleared={cityInput === ""}
                    options={cityOptions}
                    loading={isCitiesLoading}
                    statusMessage={citiesStatus}
                    emptyMessage="No matches"
                    onScroll={handleCityListScroll}
                  />
                )}
                <div className={`flex justify-end sm:justify-end ${showPlainCityInput ? "mt-3" : ""}`}>
                  <button type="submit" className="flex self-end px-5 py-3 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30
                    transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-80"
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
              </div>
            </div>
          ) : (
            <>
              <div className="pb-5">
                <label className="text-sm font-medium text-foreground">
                  Pick a region:
                </label>
                <div className="relative w-full mt-1">
                  <div ref={regionMenuRef} className="relative">
                    <button ref={regionButtonRef} type="button" className="flex w-full items-center justify-between rounded-xl border border-input
                      bg-card px-4 py-3 text-left text-base text-foreground shadow-sm outline-none ring-ring transition hover:border-primary
                      focus:border-primary focus:ring-2 focus:ring-ring" aria-haspopup="listbox" aria-expanded={isRegionMenuOpen}
                      onClick={() => setRegionMenuOpen((open) => !open)}>
                      <span>{activeRegionLabel}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {isRegionMenuOpen && (
                      <div className="region-menu absolute left-0 right-0 z-10 mt-2 max-h-60 overflow-auto rounded-2xl
                        border border-border bg-popover shadow-lg ring-1 ring-black/5">
                        <div role="listbox" aria-label="Region options">
                          {regions.map((region) => {
                            const isActive = region.value === selectedRegion;
                            return (
                              <button key={region.value} type="button" className={`w-full px-4 py-3 text-left text-sm font-medium transition
                                ${isActive ? "bg-accent text-primary" : "text-popover-foreground hover:bg-accent hover:text-primary"}`}
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

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <fieldset className="flex flex-col gap-2 text-sm">
                  <legend className="text-sm font-medium text-foreground pb-2">
                    Go to a:
                  </legend>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cityType"
                      value="capital"
                      checked={wantsCapital}
                      onChange={() => setWantsCapital(true)}
                      className="h-4 w-4 border-primary text-primary accent-primary focus:ring-ring"
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
                      className="h-4 w-4 border-primary text-primary accent-primary focus:ring-ring"
                    />
                    Random city
                  </label>
                </fieldset>

                <button type="submit" className="flex self-end px-5 py-3 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30
                  transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-80"
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
            </>
          )}
        </form>

        {status && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive shadow-sm">
            {status}
          </div>
        )}

        <div className="space-y-2 text-xs mt-8">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-foreground">Discover a trending city:</span>
            {trendingCities.map((city) => (
              <Link key={city.name} prefetch={false} className="font-semibold text-primary transition hover:text-primary/80
                hover:underline underline-offset-2 decoration-primary/30 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring" href={`/city/${encodeURIComponent(city.name)}?country=${city.country}`}>
                {city.name !== "New York City" ? city.name : "New York"}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
