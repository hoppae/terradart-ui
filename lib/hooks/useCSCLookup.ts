import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCitiesByCountry,
  fetchCitiesByState,
  fetchCountries,
  fetchStates,
  type CityOption,
  type CountryEntry,
  type StateEntry,
} from "@/lib/api/cities";

type DisplayValueArgs = {
  isOpen: boolean;
  query: string;
  input: string;
  label: string;
};

// Country-State-City lookup state + derived values for SearchSelects.
export function useCSCLookup(cityPageSize = 50) {
  const [countryInput, setCountryInput] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [countriesStatus, setCountriesStatus] = useState("");
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);

  const [states, setStates] = useState<StateEntry[]>([]);
  const [statesStatus, setStatesStatus] = useState("");
  const [isStatesLoading, setIsStatesLoading] = useState(false);

  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesStatus, setCitiesStatus] = useState("");
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [cityVisibleCount, setCityVisibleCount] = useState(cityPageSize);

  useEffect(() => {
    let cancelled = false;
    setIsCountriesLoading(true);
    setCountriesStatus("");
    fetchCountries()
      .then((list) => {
        if (cancelled) return;
        setCountries(list);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Country fetch error:", error);
        setCountriesStatus("Unable to load countries right now.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsCountriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Reset state and city dropdowns whenever country changes
    setStateInput("");
    setStateQuery("");
    setStates([]);
    setStatesStatus("");
    setIsStatesLoading(false);
    setCityInput("");
    setCityQuery("");
    setCities([]);
    setCitiesStatus("");
    setIsCitiesLoading(false);
    setCityVisibleCount(cityPageSize);

    const country = countryInput.trim();
    if (!country) {
      return undefined;
    }

    setIsStatesLoading(true);
    fetchStates(country)
      .then((list) => {
        if (cancelled) return;
        setStates(list);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("State fetch error:", error);
        setStatesStatus("Unable to load states for this country.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsStatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryInput, cityPageSize]);

  useEffect(() => {
    let cancelled = false;
    // Reset city dropdown whenever state or country changes
    setCityInput("");
    setCityQuery("");
    setCities([]);
    setCitiesStatus("");
    setIsCitiesLoading(false);
    setCityVisibleCount(cityPageSize);

    const country = countryInput.trim();
    if (!country) {
      return undefined;
    }

    const state = stateInput.trim();
    setIsCitiesLoading(true);
    const loadCities = state
      ? fetchCitiesByState(country, state)
      : fetchCitiesByCountry(country);

    loadCities
      .then((list) => {
        if (cancelled) return;
        setCities(list);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("City fetch error:", error);
        setCitiesStatus("Unable to load cities for this selection.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsCitiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryInput, stateInput, cityPageSize]);

  useEffect(() => {
    setCityVisibleCount(cityPageSize);
  }, [cityQuery, cityPageSize]);

  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) return countries;
    const query = countryQuery.toLowerCase();
    return countries.filter((entry) => {
      return (
        entry.code.toLowerCase().includes(query) ||
        (entry.code3 ?? "").toLowerCase().includes(query) ||
        entry.name.toLowerCase().includes(query)
      );
    });
  }, [countries, countryQuery]);

  const filteredStates = useMemo(() => {
    if (!stateQuery.trim()) return states;
    const query = stateQuery.toLowerCase();
    return states.filter((entry) => {
      return entry.code.toLowerCase().includes(query) || entry.name.toLowerCase().includes(query);
    });
  }, [states, stateQuery]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return cities;
    const query = cityQuery.toLowerCase();
    return cities.filter((entry) => entry.name.toLowerCase().includes(query));
  }, [cities, cityQuery]);

  const visibleCities = useMemo(() => filteredCities.slice(0, cityVisibleCount), [filteredCities, cityVisibleCount]);

  const handleCityListScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
        setCityVisibleCount((count) => Math.min(count + cityPageSize, filteredCities.length));
      }
    },
    [filteredCities.length, cityPageSize],
  );

  const selectedCountry = useMemo(
    () => countries.find((entry) => entry.code.toUpperCase() === countryInput.toUpperCase()),
    [countries, countryInput],
  );

  const selectedState = useMemo(
    () => states.find((entry) => entry.code.toUpperCase() === stateInput.toUpperCase()),
    [states, stateInput],
  );

  const selectedCountryLabel = useMemo(
    () => (countryInput ? `${selectedCountry?.code3 ?? countryInput.toUpperCase()} - ${selectedCountry?.name ?? "Unknown"}` : "Select country"),
    [countryInput, selectedCountry],
  );

  const selectedStateLabel = useMemo(
    () => (stateInput ? `${stateInput.toUpperCase()} - ${selectedState?.name ?? "Unknown"}` : "Select state/region"),
    [selectedState, stateInput],
  );

  const selectedStateName = useMemo(() => selectedState?.name ?? "", [selectedState]);
  const selectedCityLabel = useMemo(() => cityInput || "Select city", [cityInput]);

  const computeDisplayValue = useCallback(
    ({ isOpen, query, input, label }: DisplayValueArgs) => (isOpen ? query : input ? label : ""),
    [],
  );

  return {
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
    filteredCountries,
    filteredStates,
    visibleCities,
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
    handleCityListScroll,
  };
}
