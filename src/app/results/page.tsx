"use client";

import { Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
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
  provider?: string;
  condition?: string | null;
  shippingCost?: number | null;
  shippingStatus?: "known" | "unknown";
  shippingText?: string;
  totalPrice?: number | null;
  totalPriceText?: string | null;
};

type ProductGroup = {
  id: string;
  product: string;
  image: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  storage: string | null;
  ram: string | null;
  currency: string;
  currencySymbol: string;
  lowestPrice: number;
  lowestPriceText: string;
  offerCount: number;
  stores: string[];
  offers: Array<{
    id: string;
    store: string;
    product: string;
    price: number;
    currency: string;
    currencySymbol: string;
    priceText: string;
    productUrl: string | null;
    shippingCost: number | null;
    shippingStatus: "known" | "unknown";
    shippingText: string;
    totalPrice: number | null;
    totalPriceText: string | null;
    delivery: string;
    image: string | null;
    provider: string;
  }>;
};

type ApiResponse = {
  success: boolean;
  source?: string;
  query: string;
  country: Country;
  currency: string;
  currencySymbol: string;
  results: ApiResult[];
  productGroups?: ProductGroup[];
  message?: string;
  error?: string;
  providers?: {
    ebay?: {
      status?: string;
      marketplace?: string | null;
      resultCount?: number;
      message?: string;
    };
    googleShopping?: {
      status?: string;
      marketplace?: string;
      providerResultCount?: number;
      matchedResultCount?: number;
    };
  };
};

function formatPrice(amount: number, currencySymbol: string) {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currencySymbol}${formattedNumber}`;
}


const resultCategories = [
  { label: "Mobiles", slug: "mobiles", accent: "#3B82F6", icon: "phone" },
  { label: "Laptops", slug: "laptops", accent: "#A855F7", icon: "laptop" },
  { label: "Electronics", slug: "electronics", accent: "#22C55E", icon: "headphones" },
  { label: "Accessories", slug: "accessories", accent: "#F97316", icon: "bag" },
  { label: "Tablets", slug: "tablets", accent: "#EF4444", icon: "tablet" },
  { label: "Wearables", slug: "wearables", accent: "#A855F7", icon: "watch" },
  { label: "TVs", slug: "tvs", accent: "#EAB308", icon: "tv" },
  { label: "Gaming", slug: "gaming", accent: "#A855F7", icon: "gamepad" },
  { label: "Cameras", slug: "cameras", accent: "#EC4899", icon: "camera" },
];

function CategoryIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "phone":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M10 5h4M11 18.5h2" /></svg>;
    case "laptop":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="5" y="3" width="14" height="13" rx="1.5" /><path d="M2.5 20h19l-2-4H4.5z" /></svg>;
    case "headphones":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M3.5 13v-1a8.5 8.5 0 0 1 17 0v1" /><rect x="3" y="12" width="4" height="8" rx="1.5" /><rect x="17" y="12" width="4" height="8" rx="1.5" /></svg>;
    case "bag":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 8h16l1 13H3L4 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
    case "tablet":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M10 5h4M11 18.5h2" /></svg>;
    case "watch":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="7" y="6" width="10" height="12" rx="3" /><path d="m9 6-1-3h8l-1 3m-6 12 1 3h4l1-3M10 10h4" /></svg>;
    case "tv":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M9 21h6m-3-4v4" /></svg>;
    case "gamepad":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M7 8h10a4 4 0 0 1 3.8 3l1 4.5a2.5 2.5 0 0 1-4.1 2.4L15 15H9l-2.7 2.9a2.5 2.5 0 0 1-4.1-2.4l1-4.5A4 4 0 0 1 7 8Z" /><path d="M7 11v4m-2-2h4m7-1h.01M18 14h.01" /></svg>;
    case "camera":
      return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 7h4l1.5-2h5L16 7h4a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 7Z" /><circle cx="12" cy="13" r="4" /></svg>;
    default:
      return null;
  }
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const selectedCountry = (searchParams.get("country") as Country) || "India";
  const selectedCity = searchParams.get("city") || "";
  const selectedState = searchParams.get("state") || "";
  const selectedCounty = searchParams.get("county") || "";
  const selectedPostcode = searchParams.get("postcode") || "";
  const originCategory = searchParams.get("category") || "";
  const returnParams = new URLSearchParams({ country: selectedCountry });
  for (const key of ["city", "state", "county", "postcode"]) {
    const value = searchParams.get(key);
    if (value) returnParams.set(key, value);
  }
  const backHref = originCategory
    ? `/category/${encodeURIComponent(originCategory)}?${returnParams.toString()}`
    : "/";

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("total");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [source, setSource] = useState("");
  const [providerMessage, setProviderMessage] = useState("");
  const [compareItems, setCompareItems] = useState<ApiResult[]>([]);
  const [compareNotice, setCompareNotice] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("searchonce-compare-products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompareItems(parsed.slice(0, 4));
      }
    } catch (error) {
      console.warn("Could not restore comparison selection", error);
    }
  }, []);

  const persistCompareItems = (items: ApiResult[]) => {
    setCompareItems(items);
    try {
      window.localStorage.setItem("searchonce-compare-products", JSON.stringify(items));
    } catch (error) {
      console.warn("Could not save comparison selection", error);
    }
  };

  const toggleCompareItem = (item: ApiResult) => {
    const alreadySelected = compareItems.some((selected) => selected.id === item.id && selected.store === item.store);
    if (alreadySelected) {
      persistCompareItems(compareItems.filter((selected) => !(selected.id === item.id && selected.store === item.store)));
      setCompareNotice("Product removed from comparison.");
      return;
    }
    if (compareItems.length >= 4) {
      setCompareNotice("You can compare up to 4 offers. Remove one to add another.");
      return;
    }
    const next = [...compareItems, item];
    persistCompareItems(next);
    setCompareNotice(`${next.length} of 4 products selected.`);
  };

  useEffect(() => {
    if (!initialQuery.trim()) {
      router.replace("/");
    }
  }, [initialQuery, router]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async () => {
      if (!initialQuery.trim()) {
        setResults([]);
        setProviderMessage("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          q: initialQuery,
          country: selectedCountry,
        });

        if (selectedCity) params.set("city", selectedCity);
        if (selectedState) params.set("state", selectedState);
        if (selectedCounty) params.set("county", selectedCounty);
        if (selectedPostcode) params.set("postcode", selectedPostcode);

        const response = await fetch(
          `/api/search?${params.toString()}`,
          { cache: "no-store", signal: controller.signal }
        );

        const data = (await response.json()) as ApiResponse;
        if (!response.ok || !data.success) {
          throw new Error(data.error || data.message || "Failed to fetch shopping results.");
        }

        setResults(Array.isArray(data.results) ? data.results : []);
        setProductGroups(
         Array.isArray(data.productGroups) ? data.productGroups : []);
        setSource(data.source || "Shopping results");
        setProviderMessage(data.providers?.ebay?.message || "");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Search results error:", err);
        setError(err instanceof Error ? err.message : "Unable to load search results.");
        setResults([]);
        setProviderMessage("");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchResults();
    return () => controller.abort();
  }, [
    initialQuery,
    selectedCountry,
    selectedCity,
    selectedState,
    selectedCounty,
    selectedPostcode,
  ]);
  
useEffect(() => {
  const searchTerm = query.trim();

  if (searchTerm.length < 2) {
    setSuggestions([]);
    setShowSuggestions(false);
    setSuggestionsLoading(false);
    return;
  }

  const controller = new AbortController();

  const timer = window.setTimeout(async () => {
    setSuggestionsLoading(true);

    try {
      const params = new URLSearchParams({
        q: searchTerm,
        country: selectedCountry,
      });

      const response = await fetch(
        `/api/suggestions?${params.toString()}`,
        { signal: controller.signal }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSuggestions([]);
        return;
      }

      setSuggestions(
        Array.isArray(data.suggestions)
          ? data.suggestions.filter(
                (item: unknown): item is string =>
                  typeof item === "string"
              )
          : []
      );
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.name !== "AbortError"
      ) {
        setSuggestions([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSuggestionsLoading(false);
      }
    }
  }, 300);

  return () => {
    window.clearTimeout(timer);
    controller.abort();
  };
  }, [query, selectedCountry]);

  const availableStores = useMemo(
    () => [...new Set(results.map((result) => result.store))],
    [results]
  );

  const filteredAndSortedResults = useMemo(() => {
    const filtered = results.filter(
      (result) => storeFilter === "All Stores" || result.store === storeFilter
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "total") {
        if (a.totalPrice != null && b.totalPrice != null) {
          return a.totalPrice - b.totalPrice;
        }
        if (a.totalPrice != null) return -1;
        if (b.totalPrice != null) return 1;
        return a.price - b.price;
      }
      if (sortBy === "lowest") return a.price - b.price;
      if (sortBy === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sortBy === "delivery") {
        return (a.deliveryDays || Number.MAX_SAFE_INTEGER) -
          (b.deliveryDays || Number.MAX_SAFE_INTEGER);
      }
      return 0;
    });
  }, [results, storeFilter, sortBy]);

  const visibleStoreGroups = useMemo(() => {
    const byStore = new Map<string, ApiResult[]>();
    for (const item of filteredAndSortedResults) {
      const store = item.store?.trim() || "Unknown store";
      const items = byStore.get(store) ?? [];
      items.push(item);
      byStore.set(store, items);
    }
    return [...byStore.entries()].map(([store, items]) => ({ store, items }));
  }, [filteredAndSortedResults]);

  const groupedStoreCards = visibleStoreGroups.filter((group) => group.items.length > 1);
  const singleListingResults = visibleStoreGroups
    .filter((group) => group.items.length === 1)
    .map((group) => group.items[0]);

  const visibleProductGroups = useMemo(() => {
    const groups = productGroups
      .map((group) => {
        const offers = group.offers.filter(
          (offer) =>
            storeFilter === "All Stores" || offer.store === storeFilter
        );
        return { ...group, offers };
      })
      .filter((group) => group.offers.length > 0);

    return groups.sort((a, b) => {
      const getPrice = (group: ProductGroup) => {
        const prices = group.offers.map((offer) => {
          const original = results.find(
            (item) => item.id === offer.id && item.store === offer.store
          );
          if (sortBy === "total" && original?.totalPrice != null) {
            return original.totalPrice;
          }
          return offer.price;
        });
        return Math.min(...prices);
      };

      if (sortBy === "rating") {
        const rating = (group: ProductGroup) =>
          Math.max(
            -1,
            ...group.offers.map((offer) => {
              const original = results.find(
                (item) => item.id === offer.id && item.store === offer.store
              );
              return original?.rating ?? -1;
            })
          );
        return rating(b) - rating(a);
      }

      if (sortBy === "delivery") {
        const deliveryDays = (group: ProductGroup) =>
          Math.min(
            Number.MAX_SAFE_INTEGER,
            ...group.offers.map((offer) => {
              const original = results.find(
                (item) => item.id === offer.id && item.store === offer.store
              );
              return original?.deliveryDays || Number.MAX_SAFE_INTEGER;
            })
          );
        return deliveryDays(a) - deliveryDays(b);
      }

      return getPrice(a) - getPrice(b);
    });
  }, [productGroups, results, storeFilter, sortBy]);

  const lowestPrice = results.length ? Math.min(...results.map((item) => item.price)) : 0;
  const lowestListedStore = results.find((item) => item.price === lowestPrice) || null;
  const knownTotalOffers = results.filter(
    (item) => item.totalPrice !== null && item.totalPrice !== undefined
  );
  const bestTotalStore = [...knownTotalOffers].sort(
    (a, b) => (a.totalPrice ?? Number.MAX_SAFE_INTEGER) - (b.totalPrice ?? Number.MAX_SAFE_INTEGER)
  )[0] ?? null;
  const bestStore = bestTotalStore ?? lowestListedStore;
  const usingKnownTotal = bestTotalStore !== null;

  
const handleSearch = (searchTerm = query) => {
  const trimmed = searchTerm.trim();

  if (trimmed) {
    setQuery(trimmed);
    setShowSuggestions(false);

    router.push(
      `/results?q=${encodeURIComponent(trimmed)}&country=${encodeURIComponent(selectedCountry)}`
    );
  }
};


  const openProductDetails = (item: ApiResult) => {
    const params = new URLSearchParams();
    params.set("q", item.product || initialQuery);
    params.set("searchQuery", initialQuery || item.product);
    params.set("country", selectedCountry);
    const originCategory = searchParams.get("category");
    if (originCategory) params.set("category", originCategory);
    for (const key of ["city", "state", "county", "postcode"]) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    params.set("store", item.store);
    params.set("image", item.image || "");
    params.set("price", String(item.price));
    params.set("currency", item.currency || "");
    params.set("currencySymbol", item.currencySymbol || "");
    params.set("delivery", item.delivery || "Delivery details not provided by listing");
    if (item.rating !== null && item.rating !== undefined) params.set("rating", String(item.rating));
    if (item.reviews !== null && item.reviews !== undefined) params.set("reviews", String(item.reviews));
    if (item.priceText) params.set("priceText", item.priceText);
    if (item.shippingText) params.set("shippingText", item.shippingText);
    if (item.shippingStatus) params.set("shippingStatus", item.shippingStatus);
    if (item.shippingCost !== null && item.shippingCost !== undefined) params.set("shippingCost", String(item.shippingCost));
    if (item.totalPrice !== null && item.totalPrice !== undefined) params.set("totalPrice", String(item.totalPrice));
    if (item.totalPriceText) params.set("totalPriceText", item.totalPriceText);
    if (item.productUrl) params.set("productUrl", item.productUrl);
    if (item.badge) params.set("badge", item.badge);
    if (item.provider) params.set("provider", item.provider);
    if (item.condition) params.set("condition", item.condition);
    params.set("source", source);
    router.push(`/product/${encodeURIComponent(item.id)}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] pb-24 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
            <Link href={backHref} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs text-white/75 transition hover:bg-white/[0.08] hover:text-white sm:gap-2 sm:px-3 sm:text-sm" aria-label="Back to previous page">
              <span aria-hidden="true">←</span><span>Back</span>
            </Link>
            <Link href="/" className="flex items-center justify-self-center gap-2.5" aria-label="SearchOnce homepage">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-black text-black sm:h-10 sm:w-10">S</span>
              <span className="text-base font-semibold sm:text-xl">SearchOnce</span>
            </Link>
            <Link href="/" className="inline-flex items-center justify-self-end gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs text-white/75 transition hover:bg-white/[0.08] hover:text-white sm:gap-2 sm:px-3 sm:text-sm" aria-label="Go to homepage">
              <span aria-hidden="true">⌂</span><span>Home</span>
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-3">
          <div className="relative flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.05] p-1">              <span className="ml-3 mr-2 text-lg text-white/40">⌕</span>
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                      if (query.trim().length >= 2) {
                      setShowSuggestions(true);
                   }
                }}
                onKeyDown={(event) => {
                     if (event.key === "Enter") {
                       event.preventDefault();
                       handleSearch();
                     }

                     if (event.key === "Escape") {
                    setShowSuggestions(false);
                   }
                }}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                placeholder="Search products..."
                aria-label="Search products"
              />
            <button
            type="button"
            onClick={() => handleSearch()}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90 sm:px-4 sm:text-sm"
            >
                Search
            </button>
            {showSuggestions &&
            query.trim().length >= 2 &&
            (suggestionsLoading || suggestions.length > 0) && (
           <div
              role="listbox"
               aria-label="Search suggestions"
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border border-white/10 bg-[#101114]/95 p-2 text-left shadow-2xl backdrop-blur-2xl"
               onClick={(event) => event.stopPropagation()}
            >
            {suggestionsLoading && suggestions.length === 0 && (
            <p className="px-3 py-3 text-sm text-white/50">
               Finding suggestions...
            </p>
           )}

           {suggestions.map((suggestion, index) => (
            <button
             key={`${suggestion}-${index}`}
             type="button"
             role="option"
             aria-selected={false}
             onClick={() => handleSearch(suggestion)}
             className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.08] focus-visible:bg-white/[0.08] focus-visible:outline-none"
            >
            <span className="text-lg text-cyan-400/80">⌕</span>
            <span className="min-w-0 flex-1 truncate">
             {suggestion}
            </span>
            <span className="text-white/30">↗</span>
           </button>
            ))}
            </div>
             )}
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60 sm:flex">
              <span>🌍</span><span>{selectedCountry}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="mb-5 sm:mb-8">
          <p className="text-sm text-white/40">Search results</p>
          <h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">Results for &quot;{initialQuery}&quot;</h1>
          <p className="mt-2 text-sm text-white/40">Showing offers for <span className="text-white/70">{selectedCountry}</span></p>
          <p className="mt-3 text-xs text-white/30">Shopping offers retrieved via {source || "SearchOnce API"}. Prices and availability can change; verify details with the seller before purchasing.</p>
          {providerMessage && (
            <p className="mt-2 text-xs leading-5 text-white/45">{providerMessage}</p>
          )}
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
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:mb-6 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      {usingKnownTotal ? "Lowest known total (price + shipping)" : "Lowest listed price"}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{bestStore.store}</p>
                    <p className="mt-1 text-sm text-white/40">
                      Lowest returned listing for {bestStore.product} in {selectedCountry}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/35">
                      {usingKnownTotal
                        ? `Shipping is confirmed for ${knownTotalOffers.length} of ${results.length} offers. Taxes, customs duties and location-specific fees may be extra.`
                        : "No returned offer supplied a confirmed shipping amount, so this is the lowest item price—not a confirmed delivered total."}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold">
                      {usingKnownTotal
                        ? bestStore.totalPriceText || formatPrice(bestStore.totalPrice ?? bestStore.price, bestStore.currencySymbol)
                        : bestStore.priceText || formatPrice(bestStore.price, bestStore.currencySymbol)}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {usingKnownTotal ? `Among ${knownTotalOffers.length} offers with known shipping` : `Among ${results.length} returned offers`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:mb-8 sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium">Compare offers</p>
                <p className="mt-1 text-xs text-white/35">{filteredAndSortedResults.length} offers shown</p>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <label className="text-xs text-white/40" htmlFor="store-filter">Store</label>
                  <select id="store-filter" value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)} className="min-w-0 max-w-full flex-1 rounded-xl border border-white/10 bg-black px-2 py-2 text-xs text-white outline-none sm:flex-none sm:px-3 sm:text-sm">
                    <option value="All Stores" className="bg-black">All Stores</option>
                    {availableStores.map((store) => <option key={store} value={store} className="bg-black">{store}</option>)}
                  </select>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <label className="text-xs text-white/40" htmlFor="sort-by">Sort by</label>
                  <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-w-0 max-w-full flex-1 rounded-xl border border-white/10 bg-black px-2 py-2 text-xs text-white outline-none sm:flex-none sm:px-3 sm:text-sm">
                    <option value="total" className="bg-black">Lowest known total (price + shipping)</option>
                    <option value="lowest" className="bg-black">Lowest listed price</option>
                    <option value="rating" className="bg-black">Highest Rating</option>
                    <option value="delivery" className="bg-black">Fastest Delivery (where available)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-6">
              {groupedStoreCards.map((group) => {
                const lowest = [...group.items].sort((a, b) => {
                  const aPrice = sortBy === "total" ? (a.totalPrice ?? a.price) : a.price;
                  const bPrice = sortBy === "total" ? (b.totalPrice ?? b.price) : b.price;
                  return aPrice - bPrice;
                })[0];
                return (
                  <article key={`store-group-${group.store}`} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.065] to-white/[0.025] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition hover:border-sky-400/25 min-[420px]:col-span-2 sm:rounded-3xl sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="break-words text-lg font-semibold tracking-tight sm:text-xl">{group.store}</p>
                        <p className="mt-1 text-sm text-white/45">{group.items.length} matching listings from this store</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200">{group.items.length} offers</span>
                    </div>
                    <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24">
                        {lowest.image ? <img src={lowest.image} alt={lowest.product} className="h-full w-full object-contain p-2" loading="lazy" /> : <span className="text-[10px] text-black/50">No image</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-white/45">Lowest listed price</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{lowest.priceText || formatPrice(lowest.price, lowest.currencySymbol)}</p>
                        <p className="mt-1 text-xs text-white/45">Best listed price across this store’s matching offers</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {group.items.map((item) => {
                        const compared = compareItems.some((selected) => selected.id === item.id && selected.store === item.store);
                        return (
                          <div key={`${item.id}-${item.store}`} className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 transition hover:border-sky-400/25 sm:p-4 md:grid-cols-[88px_minmax(0,1fr)_220px] md:items-center md:gap-4 lg:grid-cols-[104px_minmax(0,1fr)_250px]">
                            <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-white md:h-24 md:w-24">
                              {item.image ? <img src={item.image} alt={item.product} className="h-full w-full object-contain p-2" loading="lazy" /> : <span className="text-xs text-black/50">No image</span>}
                            </div>
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold leading-5 text-white sm:text-base">{item.product}</p>
                              <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{item.priceText || formatPrice(item.price, item.currencySymbol)}</p>
                              {item.condition && <p className="mt-1 break-words text-xs text-white/40">{item.condition}</p>}
                              <p className="mt-2 flex items-start gap-2 break-words text-xs leading-5 text-white/50"><span aria-hidden="true">↗</span><span>{item.shippingText || "Shipping cost not confirmed"}</span></p>
                              <p className="mt-1 flex items-start gap-2 break-words text-xs leading-5 text-white/45"><span aria-hidden="true">◷</span><span>{item.delivery || "Delivery details not provided by listing"}</span></p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
                              <button type="button" onClick={() => toggleCompareItem(item)} aria-pressed={compared} className={`min-h-11 rounded-xl border px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${compared ? "border-sky-400 bg-sky-400/15 text-sky-200" : "border-white/20 bg-white/[0.02] hover:bg-white/10"}`}>{compared ? "✓ Added" : "＋ Compare"}</button>
                              <button type="button" onClick={() => openProductDetails(item)} className="min-h-11 rounded-xl bg-white px-2 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 sm:text-sm">View details →</button>
                              {item.productUrl && <button type="button" onClick={() => window.open(item.productUrl!, "_blank", "noopener,noreferrer")} className="col-span-2 min-h-11 rounded-xl border border-sky-400/50 bg-sky-400/[0.08] px-3 py-2.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/15 sm:text-sm">Visit {item.store} ↗</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
              {singleListingResults.map((item) => {
                const isBestDeal = usingKnownTotal ? item.id === bestTotalStore?.id : item.price === lowestPrice;
                const itemTotal = item.totalPrice ?? null;
                const savingsAboveBestTotal = itemTotal !== null && bestTotalStore?.totalPrice != null ? itemTotal - bestTotalStore.totalPrice : null;
                const savingsAboveLowestListed = item.price - lowestPrice;
                const isCompared = compareItems.some((selected) => selected.id === item.id && selected.store === item.store);
                return (
                  <article key={item.id} className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/20 hover:bg-white/[0.07] sm:rounded-3xl sm:p-5">
                    <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-48 sm:rounded-2xl">
                      {item.image ? <img src={item.image} alt={item.product} className="h-full w-full object-contain p-3 sm:p-5" loading="lazy" /> : <span className="text-xs text-black/50">Product image unavailable</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="break-words text-xs font-semibold text-white/70 sm:text-sm">{item.store}</p>
                      {isBestDeal && <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-black">{usingKnownTotal ? "LOWEST TOTAL" : "LOWEST PRICE"}</span>}
                    </div>
                    <h2 className="mt-2 line-clamp-3 break-words text-sm font-semibold leading-5 sm:text-base">{item.product}</h2>
                    <p className="mt-3 text-[10px] text-white/40 sm:text-xs">Listed price</p>
                    <p className="mt-1 break-words text-lg font-bold sm:text-2xl">{item.priceText || formatPrice(item.price, item.currencySymbol)}</p>
                    <p className="mt-1 break-words text-[10px] leading-4 text-white/45 sm:text-xs">{item.shippingText || "Shipping cost not confirmed"}</p>
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-[10px] text-white/40 sm:text-xs">Total including known shipping</p>
                      <p className="mt-1 break-words text-sm font-semibold sm:text-base">{item.totalPriceText || "Not confirmed"}</p>
                      <p className="mt-1 break-words text-[10px] leading-4 text-white/35">{usingKnownTotal ? savingsAboveBestTotal === null ? "Shipping total not confirmed" : isBestDeal ? "Lowest known total" : `${formatPrice(Math.max(0, savingsAboveBestTotal), item.currencySymbol)} above lowest total` : isBestDeal ? "Lowest listed price" : `${formatPrice(Math.max(0, savingsAboveLowestListed), item.currencySymbol)} above lowest price`}</p>
                      <p className="mt-2 break-words text-[10px] leading-4 text-white/45 sm:text-xs">{item.delivery || "Delivery details not provided"}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => toggleCompareItem(item)} aria-pressed={isCompared} className={`rounded-xl border px-2 py-2.5 text-[10px] font-semibold sm:text-xs ${isCompared ? "border-sky-400 bg-sky-400/15 text-sky-200" : "border-white/15 bg-white/[0.04] hover:bg-white/[0.08]"}`}>{isCompared ? "✓ Added" : "＋ Compare"}</button>
                      <button type="button" onClick={() => openProductDetails(item)} className="rounded-xl bg-white px-2 py-2.5 text-[10px] font-semibold text-black hover:bg-white/90 sm:text-xs">View details →</button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center sm:mt-10 sm:p-5">
              <p className="text-xs leading-6 text-white/40">Total including known shipping is calculated only when the provider explicitly reports a shipping amount or free shipping. If shipping is unconfirmed, the total is left blank and the offer is not ranked by a delivered total. Taxes, customs duties and postal-code-specific charges may be extra; confirm the final amount with the seller before buying.</p>
            </div>
          </>
        )}
      </section>

      {compareItems.length > 0 && (
        <div className="fixed inset-x-3 bottom-[88px] z-[55] mx-auto max-w-5xl rounded-2xl border border-white/15 bg-[#111318]/95 p-3 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Compare products <span className="text-sky-300">({compareItems.length}/4)</span></p>
              <p className="mt-1 text-xs text-white/45">{compareItems.map((item) => item.product).join(" · ")}</p>
              {compareNotice && <p aria-live="polite" className="mt-1 text-xs text-sky-200">{compareNotice}</p>}
            </div>
            <button type="button" onClick={() => persistCompareItems([])} className="rounded-lg px-3 py-2 text-xs text-white/55 hover:bg-white/10 hover:text-white">Clear all</button>
            <button type="button" onClick={() => router.push(`/compare?country=${encodeURIComponent(selectedCountry)}`)} disabled={compareItems.length < 2} className="rounded-xl bg-sky-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40">Compare now →</button>
          </div>
        </div>
      )}

      {/* Shared glass category navigation, matching the homepage treatment. */}
      <nav
        className="searchonce-category-nav fixed inset-x-0 bottom-0 z-[60] w-full"
        aria-label="Product categories"
      >
          <div className="searchonce-category-nav-inner mx-auto flex min-h-[76px] w-full items-center justify-start gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1.5 pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-between sm:overflow-visible sm:px-4 lg:px-8">          {resultCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}?country=${encodeURIComponent(selectedCountry)}`}
              className="searchonce-category-item flex flex-none items-center justify-center rounded-2xl px-2 py-2 sm:min-w-0 sm:flex-1 sm:px-2"              style={{ "--category-accent": category.accent } as CSSProperties}
              aria-label={category.label}
            >
              <span className="searchonce-category-content min-w-0">
                <span className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: category.accent }}>
                  <CategoryIcon name={category.icon} />
                </span>
                <span className="max-w-full truncate text-[10px] leading-4 text-white/75 sm:text-xs">
                  {category.label}
                </span>
              </span>
            </Link>
          ))}

          <Link
            href={`/compare?country=${encodeURIComponent(selectedCountry)}`}
            className="searchonce-category-item flex min-w-[48px] shrink-0 items-center justify-center rounded-2xl px-1.5 py-2 transition hover:bg-white/[0.06] sm:min-w-[64px] sm:px-2"
            style={{ "--category-accent": "#38BDF8" } as CSSProperties}
            aria-label="Compare products"
          >
            <span className="searchonce-category-content">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h12M12 3l4 4-4 4M20 17H8m4-4-4 4 4 4" />
              </svg>
              <span className="text-[10px] leading-4 text-white/80 sm:text-xs">Compare</span>
              {compareItems.length > 0 && <span className="text-[9px] font-bold text-sky-300">{compareItems.length}/4</span>}
            </span>
          </Link>

          <Link
            href="/"
            className="searchonce-category-item searchonce-category-home ml-1 flex min-w-[48px] shrink-0 items-center justify-center border-l border-white/15 pl-1.5 sm:ml-3 sm:min-w-[64px] sm:pl-3"
            style={{ "--category-accent": "#60A5FA" } as CSSProperties}
            aria-label="Home"
          >
            <span className="searchonce-category-content">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 10 9-7 9 7" /><path d="M5.5 9v11h13V9M9.5 20v-7h5v7" />
              </svg>
              <span className="text-[10px] leading-4 text-white/80 sm:text-xs">Home</span>
              <span className="h-0.5 w-5 rounded-full bg-sky-400" />
            </span>
          </Link>
        </div>
      </nav>
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
