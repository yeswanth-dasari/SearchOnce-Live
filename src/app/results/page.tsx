"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Country =
  | "India"
  | "United States"
  | "United Kingdom"
  | "Ireland"
  | "Canada"
  | "Australia"
  | "Germany"
  | "UAE";

type ApiResult = {
  id: string;
  store: string;
  product: string;
  image: string | null;
  price: number;
  currency: string;
  currencySymbol: string;
  rating: number | null;
  country: Country;
  delivery: string;
  deliveryDays: number;
  badge: string | null;
  productUrl?: string | null;
  reviews?: number | null;
  priceText?: string | null;
};

type ApiResponse = {
  success: boolean;
  source?: string;
  query: string;
  country: Country;
  currency: string;
  currencySymbol: string;
  results: ApiResult[];
  message?: string;
  error?: string;
};

function formatPrice(amount: number, currencySymbol: string) {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currencySymbol}${formattedNumber}`;
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const selectedCountry = (searchParams.get("country") as Country) || "India";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("lowest");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [source, setSource] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async () => {
      if (!initialQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(initialQuery)}&country=${encodeURIComponent(selectedCountry)}`,
          { cache: "no-store", signal: controller.signal }
        );

        const data = (await response.json()) as ApiResponse;
        if (!response.ok || !data.success) {
          throw new Error(data.error || data.message || "Failed to fetch shopping results.");
        }

        setResults(Array.isArray(data.results) ? data.results : []);
        setSource(data.source || "Shopping results");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Search results error:", err);
        setError(err instanceof Error ? err.message : "Unable to load search results.");
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchResults();
    return () => controller.abort();
  }, [initialQuery, selectedCountry]);

  const availableStores = useMemo(
    () => [...new Set(results.map((result) => result.store))],
    [results]
  );

  const filteredAndSortedResults = useMemo(() => {
    const filtered = results.filter(
      (result) => storeFilter === "All Stores" || result.store === storeFilter
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "lowest") return a.price - b.price;
      if (sortBy === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sortBy === "delivery") {
        return (a.deliveryDays || Number.MAX_SAFE_INTEGER) -
          (b.deliveryDays || Number.MAX_SAFE_INTEGER);
      }
      return 0;
    });
  }, [results, storeFilter, sortBy]);

  const lowestPrice = results.length ? Math.min(...results.map((item) => item.price)) : 0;
  const bestStore = results.find((item) => item.price === lowestPrice) || null;

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/results?q=${encodeURIComponent(query.trim())}&country=${encodeURIComponent(selectedCountry)}`);
    }
  };

  const openProductDetails = (item: ApiResult) => {
    const params = new URLSearchParams();
    params.set("q", item.product || initialQuery);
    params.set("country", selectedCountry);
    params.set("store", item.store);
    params.set("image", item.image || "");
    params.set("price", String(item.price));
    params.set("currency", item.currency || "");
    params.set("currencySymbol", item.currencySymbol || "");
    params.set("delivery", item.delivery || "Delivery details not provided by listing");
    if (item.rating !== null && item.rating !== undefined) params.set("rating", String(item.rating));
    if (item.reviews !== null && item.reviews !== undefined) params.set("reviews", String(item.reviews));
    if (item.priceText) params.set("priceText", item.priceText);
    if (item.productUrl) params.set("productUrl", item.productUrl);
    if (item.badge) params.set("badge", item.badge);
    params.set("source", source);
    router.push(`/product/${encodeURIComponent(item.id)}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
          <button onClick={() => router.push("/")} className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-black">S</div>
            <span className="text-xl font-semibold">SearchOnce</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.05] p-1">
            <span className="ml-3 mr-2 text-lg text-white/40">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Search products..."
              aria-label="Search products"
            />
            <button onClick={handleSearch} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90">Search</button>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm md:flex">
            <span>🌍</span><span className="text-white/60">{selectedCountry}</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-white/40">Search results</p>
          <h1 className="mt-2 text-3xl font-semibold">Results for &quot;{initialQuery}&quot;</h1>
          <p className="mt-2 text-sm text-white/40">Showing offers for <span className="text-white/70">{selectedCountry}</span></p>
          <p className="mt-3 text-xs text-white/30">Shopping offers retrieved via {source || "SearchOnce API"}. Prices and availability can change; verify details with the seller before purchasing.</p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="mt-4 text-sm text-white/40">Searching stores...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">Something went wrong</p>
            <p className="mt-2 text-sm text-white/50">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Try again</button>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">No shopping offers found</p>
            <p className="mt-2 text-sm text-white/40">Try a different search phrase or country.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            {bestStore && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">Lowest listed price</p>
                    <p className="mt-2 text-lg font-semibold">{bestStore.store}</p>
                    <p className="mt-1 text-sm text-white/40">Lowest returned listing for {bestStore.product} in {selectedCountry}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold">{bestStore.priceText || formatPrice(bestStore.price, bestStore.currencySymbol)}</p>
                    <p className="mt-1 text-xs text-white/40">Among {results.length} returned offers</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium">Compare offers</p>
                <p className="mt-1 text-xs text-white/35">{filteredAndSortedResults.length} offers shown</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40" htmlFor="store-filter">Store</label>
                  <select id="store-filter" value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none">
                    <option value="All Stores" className="bg-black">All Stores</option>
                    {availableStores.map((store) => <option key={store} value={store} className="bg-black">{store}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40" htmlFor="sort-by">Sort by</label>
                  <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none">
                    <option value="lowest" className="bg-black">Lowest Price</option>
                    <option value="rating" className="bg-black">Highest Rating</option>
                    <option value="delivery" className="bg-black">Fastest Delivery (where available)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredAndSortedResults.map((item) => {
                const isBestDeal = item.price === lowestPrice;
                const savings = item.price - lowestPrice;
                return (
                  <article
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProductDetails(item)}
                    onKeyDown={(event) => { if (event.key === "Enter") openProductDetails(item); }}
                    className="group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">
                      {item.image ? (
                        // Shopping thumbnails are supplied by the API, so use a standard img element.
                        <img src={item.image} alt={item.product} className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <span className="text-sm text-black/50">Product image unavailable</span>
                      )}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white/70">{item.store}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {isBestDeal && <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wider text-black">LOWEST PRICE</span>}
                        {item.badge && <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold tracking-wider text-white/50">{item.badge}</span>}
                      </div>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold">{item.product}</h2>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-white/40">Listed price</p>
                        <p className="mt-1 text-2xl font-bold">{item.priceText || formatPrice(item.price, item.currencySymbol)}</p>
                        <p className="mt-2 text-xs text-white/35">{isBestDeal ? "Lowest returned price" : `${formatPrice(savings, item.currencySymbol)} above lowest returned price`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{item.rating !== null ? `⭐ ${item.rating}` : "Rating unavailable"}</p>
                        {item.reviews !== null && item.reviews !== undefined && <p className="mt-1 text-xs text-white/40">{item.reviews.toLocaleString()} reviews</p>}
                        <p className="mt-1 max-w-40 text-xs text-white/40">{item.delivery || "Delivery details not provided"}</p>
                      </div>
                    </div>
                    <button type="button" onClick={(event) => { event.stopPropagation(); openProductDetails(item); }} className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90">View details →</button>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-xs leading-6 text-white/40">Offers are retrieved through Google Shopping via SerpApi. Listings may include different storage, colour, condition or model variants. Check the seller’s listing for final price, specifications, availability and delivery before buying.</p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] p-8 text-white/60">Loading SearchOnce results…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
