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

        {/* Location + Country */}
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-white/40"
          onClick={(event) => event.stopPropagation()}
        >
          <span>⌖</span>

          <span>Location</span>

          <span className="text-white/20">•</span>

          <span>Country</span>

          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            className="ml-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition hover:bg-white/10"
          >
            <option value="India" className="bg-black">
              🇮🇳 India
            </option>

            <option value="United States" className="bg-black">
              🇺🇸 United States
            </option>

            <option value="United Kingdom" className="bg-black">
              🇬🇧 United Kingdom
            </option>

            <option value="Ireland" className="bg-black">
              🇮🇪 Ireland
            </option>

            <option value="Canada" className="bg-black">
              🇨🇦 Canada
            </option>

            <option value="Australia" className="bg-black">
              🇦🇺 Australia
            </option>

            <option value="Germany" className="bg-black">
              🇩🇪 Germany
            </option>

            <option value="UAE" className="bg-black">
              🇦🇪 UAE
            </option>
          </select>
        </div>

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