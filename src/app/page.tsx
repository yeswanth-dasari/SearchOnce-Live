"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

type Store = {
  name: string;
  type:
    | "amazon"
    | "flipkart"
    | "myntra"
    | "croma"
    | "ebay"
    | "walmart"
    | "target"
    | "bestbuy";
  position: string;
  delay: string;
};

const stores: Store[] = [
  {
    name: "Amazon",
    type: "amazon",
    position: "top-10 left-[12%]",
    delay: "0s",
  },
  {
    name: "Flipkart",
    type: "flipkart",
    position: "top-[28%] left-[4%]",
    delay: "1s",
  },
  {
    name: "Myntra",
    type: "myntra",
    position: "bottom-[25%] left-[9%]",
    delay: "2s",
  },
  {
    name: "Croma",
    type: "croma",
    position: "bottom-10 left-[25%]",
    delay: "3s",
  },
  {
    name: "eBay",
    type: "ebay",
    position: "top-10 right-[12%]",
    delay: "1.5s",
  },
  {
    name: "Walmart",
    type: "walmart",
    position: "top-[28%] right-[4%]",
    delay: "2.5s",
  },
  {
    name: "Target",
    type: "target",
    position: "bottom-[25%] right-[9%]",
    delay: "3.5s",
  },
  {
    name: "Best Buy",
    type: "bestbuy",
    position: "bottom-10 right-[25%]",
    delay: "4.5s",
  },
];

function StoreLogo({ type }: { type: Store["type"] }) {
  if (type === "amazon") {
    return (
      <div className="flex flex-col items-center">
        <div className="text-xl font-bold tracking-tight text-white">
          amazon
        </div>
        <div className="mt-[-3px] h-[6px] w-10 rounded-full border-b-2 border-white/70" />
      </div>
    );
  }
  if (type === "flipkart") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
          F
        </div>
        <span className="font-semibold text-white">Flipkart</span>
      </div>
    );
  }
  if (type === "myntra") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
          M
        </div>
        <span className="font-semibold text-white">Myntra</span>
      </div>
    );
  }
  if (type === "croma") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 text-sm font-bold">
          C
        </div>
        <span className="font-semibold text-white">Croma</span>
      </div>
    );
  }
  if (type === "ebay") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-black">
          e
        </div>
        <span className="font-semibold text-white">eBay</span>
      </div>
    );
  }
  if (type === "walmart") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
          W
        </div>
        <span className="font-semibold text-white">Walmart</span>
      </div>
    );
  }
  if (type === "target") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-[10px] font-bold">
          •
        </div>
        <span className="font-semibold text-white">Target</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-black">
        BB
      </div>
      <span className="font-semibold text-white">Best Buy</span>
    </div>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postcodeInput, setPostcodeInput] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const router = useRouter();

  const goToResults = () => {
    if (query.trim()) {
      router.push(
        `/results?q=${encodeURIComponent(
          query.trim()
        )}&country=${encodeURIComponent(country)}`
      );
    }
  };
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser does not support location detection.");
      return;
    }
    setLocationLoading(true);
    setLocationMessage("Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `/api/location?lat=${latitude}&lon=${longitude}`
          );
          const data = (await response.json()) as {
            success?: boolean;
            error?: string;
            results?: Array<{
              city?: string;
              state?: string;
              country?: string;
              countryCode?: string;
              postalCode?: string;
            }>;
          };
          if (!response.ok || !data.success || !data.results?.length) {
            setLocationMessage(data.error ?? "Location could not be detected.");
            return;
          }
          const place = data.results[0];
          setCity(place.city ?? "");
          setLocationState(place.state ?? "");
          // Replace any previously entered postal code with the one returned
          // for the newly detected location, or clear it if none is available.
          const detectedPostalCode = place.postalCode ?? "";
          setPostalCode(detectedPostalCode);
          setPostcodeInput(detectedPostalCode);
          const countryByCode: Record<string, string> = {
            IN: "India",
            US: "United States",
            GB: "United Kingdom",
            IE: "Ireland",
            CA: "Canada",
            AU: "Australia",
            DE: "Germany",
            AE: "UAE",
          };
          const detectedCountry =
            countryByCode[(place.countryCode ?? "").toUpperCase()];
          if (detectedCountry) {
            setCountry(detectedCountry);
          }
          const locationLabel = [
            place.city,
            place.state,
            place.country,
          ]
            .filter(Boolean)
            .join(", ");
          setLocationMessage(
            locationLabel
              ? `Location detected: ${locationLabel}`
              : "Location detected, but some details are unavailable."
          );
        } catch {
          setLocationMessage("Could not retrieve location details. Please try again.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        if (error.code === 1) {
          setLocationMessage("Location permission denied. You can enter your postal code instead.");
        } else {
          setLocationMessage("Location unavailable. Please try again or enter your postal code.");
        }
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000,
      }
    );
  };

  const lookupPostcode = async () => {
    const postcode = postcodeInput.trim();
    if (!postcode) {
      setLocationMessage("Please enter your postal code.");
      return;
    }
    const countryCodeByName: Record<string, string> = {
      India: "IN",
      "United States": "US",
      "United Kingdom": "GB",
      Ireland: "IE",
      Canada: "CA",
      Australia: "AU",
      Germany: "DE",
      UAE: "AE",
    };
    setLocationLoading(true);
    setLocationMessage("Looking up postal code...");
    try {
      const params = new URLSearchParams({ postcode });
      const countryCode = countryCodeByName[country];
      if (countryCode) {
        params.set("countryCode", countryCode);
      }
      const response = await fetch(`/api/location?${params.toString()}`);
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        results?: Array<{
          city?: string;
          state?: string;
          country?: string;
          countryCode?: string;
          postalCode?: string;
        }>;
      };
      if (!response.ok || !data.success || !data.results?.length) {
        setLocationMessage(data.error ?? "No matching location found.");
        return;
      }
      const place = data.results[0];
      setCity(place.city ?? "");
      setLocationState(place.state ?? "");
      setPostalCode(place.postalCode || postcode);
      const countryByCode: Record<string, string> = {
        IN: "India",
        US: "United States",
        GB: "United Kingdom",
        IE: "Ireland",
        CA: "Canada",
        AU: "Australia",
        DE: "Germany",
        AE: "UAE",
      };
      const detectedCountry = countryByCode[(place.countryCode ?? "").toUpperCase()];
      if (detectedCountry) {
        setCountry(detectedCountry);
      }
      const locationLabel = [
        place.city,
        place.state,
        place.country,
      ]
        .filter(Boolean)
        .join(", ");
      setLocationMessage(
        locationLabel
          ? `Postal code location: ${locationLabel}`
          : "Postal code found, but some location details are unavailable."
      );
    } catch {
      setLocationMessage("Could not look up the postal code. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };
  return (
    <main
      onClick={() => setStarted(true)}
      className="relative min-h-screen cursor-pointer overflow-hidden bg-[#050505] text-white"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
      </div>
      {/* Floating store logos */}
      {stores.map((store) => (
        <div
          key={store.name}
          className={`searchonce-float absolute ${store.position} hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md md:block`}
          style={{
            animationDelay: store.delay,
          }}
        >
          <StoreLogo type={store.type} />
        </div>
      ))}
      {/* Main content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* SearchOnce logo */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-black shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              S
            </div>
            <span className="text-3xl font-semibold tracking-[-0.04em]">
              SearchOnce
            </span>
          </div>
        </div>
        {/* Main heading */}
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl md:text-7xl">
          Search once.
          <br />
          <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Compare everywhere.
          </span>
        </h1>
        {/* Description */}
        <p className="mt-7 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
          Find products from stores around you and compare prices,
          availability and offers in one simple place.
        </p>
        {/* Search */}
        <div
          className="mt-10 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2 shadow-2xl backdrop-blur-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-12 flex-1 items-center">
            <span className="ml-4 mr-3 text-xl text-white/40">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  goToResults();
                }
              }}
              placeholder="Search for a product, brand or anything..."
              className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
            />
          </div>
          <button
            onClick={goToResults}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-white/90"
          >
            Search
          </button>
        </div>
                {/* Compact location and country controls */}
        <div
          className="mt-5 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2 text-xs sm:text-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="inline-flex items-center gap-1 text-white/45">
            <span aria-hidden="true">⌖</span>
            <span>Location</span>
          </span>
          <button
            type="button"
            onClick={detectLocation}
            disabled={locationLoading}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {locationLoading ? "Locating..." : "📍 Detect"}
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80">
            <span className="text-white/40">City</span>
            <span className="max-w-32 truncate">{city || "—"}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80">
            <span className="text-white/40">State</span>
            <span className="max-w-40 truncate">{locationState || "—"}</span>
          </div>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            aria-label="Select country"
            className="cursor-pointer rounded-lg border border-white/10 bg-[#17181d] px-3 py-2 text-white outline-none transition hover:bg-white/10"
          >
            <option value="India" className="bg-black">🇮🇳 India</option>
            <option value="United States" className="bg-black">🇺🇸 United States</option>
            <option value="United Kingdom" className="bg-black">🇬🇧 United Kingdom</option>
            <option value="Ireland" className="bg-black">🇮🇪 Ireland</option>
            <option value="Canada" className="bg-black">🇨🇦 Canada</option>
            <option value="Australia" className="bg-black">🇦🇺 Australia</option>
            <option value="Germany" className="bg-black">🇩🇪 Germany</option>
            <option value="UAE" className="bg-black">🇦🇪 UAE</option>
          </select>
        </div>
        <div
          className="mt-3 flex w-full max-w-[280px] items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            value={postcodeInput}
            onChange={(event) => setPostcodeInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void lookupPostcode();
              }
            }}
            placeholder="Enter PIN / postcode"
            aria-label="PIN or postal code"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
          />
          <button
            type="button"
            onClick={() => void lookupPostcode()}
            disabled={locationLoading}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {locationLoading ? "Searching..." : "Find"}
          </button>
        </div>
        {postalCode && (
          <p className="mt-2 text-center text-xs text-white/45">
            PIN / Postal code: {postalCode}
          </p>
        )}
        {locationMessage && (
          <p role="status" aria-live="polite" className="mt-2 text-center text-xs text-white/60">
            {locationMessage}
          </p>
        )}

        {/* Bottom message */}
        <div
          className={`mt-16 transition-all duration-700 ${
            started ? "opacity-0" : "animate-pulse opacity-60"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Click anywhere to explore
          </p>
        </div>
      </section>

      {/* Bottom branding */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-center text-xs text-white/20">
        One search • Multiple stores • Better decisions
      </div>
    </main>
  );
}
