"use client";

import { useEffect, useMemo, useState } from "react";
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
  image: string;
  price: number;
  currency: string;
  currencySymbol: string;
  rating: number;
  country: Country;
  delivery: string;
  deliveryDays: number;
  badge: string | null;
};

type ApiResponse = {
  success: boolean;
  query: string;
  country: Country;
  currency: string;
  currencySymbol: string;
  results: ApiResult[];
  message?: string;
};

/*
  Format the price using the currency information
  returned by our backend API.
*/
function formatPrice(
  amount: number,
  currencySymbol: string
) {
  const formattedNumber =
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(amount);

  return `${currencySymbol}${formattedNumber}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery =
    searchParams.get("q") || "";

  const selectedCountry =
    (searchParams.get(
      "country"
    ) as Country) || "India";

  const [query, setQuery] =
    useState(initialQuery);

  const [results, setResults] =
    useState<ApiResult[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sortBy, setSortBy] =
    useState("lowest");

  const [storeFilter, setStoreFilter] =
    useState("All Stores");

  /*
    Fetch all search information from
    our backend API.
  */
  useEffect(() => {
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
          `/api/search?q=${encodeURIComponent(
            initialQuery
          )}&country=${encodeURIComponent(
            selectedCountry
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch search results."
          );
        }

        const data: ApiResponse =
          await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Search failed."
          );
        }

        /*
          Backend is now the source of truth.
          We directly store its results.
        */
        setResults(data.results);
      } catch (err) {
        console.error(
          "Search results error:",
          err
        );

        setError(
          "Unable to load search results."
        );

        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [
    initialQuery,
    selectedCountry,
  ]);

  /*
    Store names are now taken directly
    from the backend response.
  */
  const availableStores = useMemo(() => {
    return [
      ...new Set(
        results.map(
          (result) => result.store
        )
      ),
    ];
  }, [results]);

  /*
    Apply store filter and sorting.
  */
  const filteredAndSortedResults =
    useMemo(() => {
      let filtered = [...results];

      if (storeFilter !== "All Stores") {
        filtered = filtered.filter(
          (result) =>
            result.store ===
            storeFilter
        );
      }

      if (sortBy === "lowest") {
        filtered.sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (sortBy === "rating") {
        filtered.sort(
          (a, b) =>
            b.rating - a.rating
        );
      }

      if (sortBy === "delivery") {
        filtered.sort(
          (a, b) =>
            a.deliveryDays -
            b.deliveryDays
        );
      }

      return filtered;
    }, [
      results,
      storeFilter,
      sortBy,
    ]);

  /*
    Best deal comes directly from the
    backend response.
  */
  const lowestPrice =
    results.length > 0
      ? Math.min(
          ...results.map(
            (result) =>
              result.price
          )
        )
      : 0;

  const bestStore =
    results.find(
      (result) =>
        result.price ===
        lowestPrice
    ) || null;

  const handleSearch = () => {
    if (query.trim()) {
      router.push(
        `/results?q=${encodeURIComponent(
          query.trim()
        )}&country=${encodeURIComponent(
          selectedCountry
        )}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-5">

          {/* SearchOnce Logo */}
          <button
            onClick={() =>
              router.push("/")
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-black">
              S
            </div>

            <span className="text-xl font-semibold">
              SearchOnce
            </span>

          </button>

          {/* Search */}
          <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/[0.05] p-1">

            <span className="ml-3 mr-2 text-lg text-white/40">
              ⌕
            </span>

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  handleSearch();
                }
              }}
              className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Search products..."
            />

            <button
              onClick={handleSearch}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Search
            </button>

          </div>

          {/* Country */}
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm md:flex">

            <span>🌍</span>

            <span className="text-white/60">
              {selectedCountry}
            </span>

          </div>

        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Heading */}
        <div className="mb-8">

          <p className="text-sm text-white/40">
            Search results
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Results for "{initialQuery}"
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Showing results for{" "}
            <span className="text-white/70">
              {selectedCountry}
            </span>
          </p>

          <p className="mt-3 text-xs text-white/30">
            Results are being loaded through
            the SearchOnce backend API.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

            <p className="mt-4 text-sm text-white/40">
              Searching stores...
            </p>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <p className="text-lg font-semibold">
              Something went wrong
            </p>

            <p className="mt-2 text-sm text-white/40">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              Try again
            </button>

          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          results.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

              <p className="text-lg font-semibold">
                No products found
              </p>

              <p className="mt-2 text-sm text-white/40">
                We couldn't find a matching product
                for this search.
              </p>

            </div>
          )}

        {/* Results */}
        {!loading &&
          !error &&
          results.length > 0 && (
            <>

              {/* Best Deal */}
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Best deal found
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      {bestStore?.store}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                      Lowest price for{" "}
                      {bestStore?.product}{" "}
                      in {selectedCountry}
                    </p>

                  </div>

                  <div className="text-left sm:text-right">

                    <p className="text-2xl font-bold">
                      {bestStore
                        ? formatPrice(
                            bestStore.price,
                            bestStore.currencySymbol
                          )
                        : ""}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {results.length}{" "}
                      stores compared
                    </p>

                  </div>

                </div>
              </div>

              {/* Filters */}
              <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-medium">
                    Compare stores
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {
                      filteredAndSortedResults.length
                    }{" "}
                    stores shown
                  </p>

                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  {/* Store Filter */}
                  <div className="flex items-center gap-2">

                    <label className="text-xs text-white/40">
                      Store
                    </label>

                    <select
                      value={storeFilter}
                      onChange={(event) =>
                        setStoreFilter(
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition hover:border-white/20"
                    >

                      <option
                        value="All Stores"
                        className="bg-black"
                      >
                        All Stores
                      </option>

                      {availableStores.map(
                        (store) => (
                          <option
                            key={store}
                            value={store}
                            className="bg-black"
                          >
                            {store}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">

                    <label className="text-xs text-white/40">
                      Sort by
                    </label>

                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition hover:border-white/20"
                    >

                      <option
                        value="lowest"
                        className="bg-black"
                      >
                        Lowest Price
                      </option>

                      <option
                        value="rating"
                        className="bg-black"
                      >
                        Highest Rating
                      </option>

                      <option
                        value="delivery"
                        className="bg-black"
                      >
                        Fastest Delivery
                      </option>

                    </select>

                  </div>

                </div>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {filteredAndSortedResults.map(
                  (store) => {

                    const savings =
                      store.price -
                      lowestPrice;

                    const isBestDeal =
                      store.price ===
                      lowestPrice;

                    return (
                      <div
                        key={store.id}
                        onClick={() =>
                          router.push(
                            `/product/${store.id}?q=${encodeURIComponent(
                              store.product
                            )}&country=${encodeURIComponent(
                              selectedCountry
                            )}`
                          )
                        }
                        className={`group cursor-pointer rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                          isBestDeal
                            ? "border-white/30 bg-white/[0.08] shadow-[0_0_35px_rgba(255,255,255,0.06)]"
                            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                        }`}
                      >

                        {/* Image */}
                        <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">

                          <img
                            src={
                              store.image
                            }
                            alt={
                              store.product
                            }
                            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                          />

                        </div>

                        {/* Store + Badge */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">

                          <span className="text-sm font-semibold text-white/70">
                            {store.store}
                          </span>

                          <div className="flex items-center gap-2">

                            {isBestDeal && (
                              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wider text-black">
                                BEST DEAL
                              </span>
                            )}

                            {store.badge && (
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold tracking-wider text-white/50">
                                {isBestDeal
                                  ? "LOWEST PRICE"
                                  : store.badge}
                              </span>
                            )}

                          </div>

                        </div>

                        {/* Product */}
                        <h2 className="mt-3 text-xl font-semibold">
                          {store.product}
                        </h2>

                        {/* Price */}
                        <div className="mt-5 flex items-end justify-between">

                          <div>

                            <p className="text-xs text-white/40">
                              Price
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                              {formatPrice(
                                store.price,
                                store.currencySymbol
                              )}
                            </p>

                            {isBestDeal ? (
                              <p className="mt-2 text-xs font-medium text-white/60">
                                ✓ Lowest price
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-white/35">
                                {formatPrice(
                                  savings,
                                  store.currencySymbol
                                )}{" "}
                                more than the best deal
                              </p>
                            )}

                          </div>

                          {/* Rating + Delivery */}
                          <div className="text-right">

                            <p className="text-sm">
                              ⭐{" "}
                              {store.rating}
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              {store.delivery}
                            </p>

                          </div>

                        </div>

                        {/* Comparison */}
                        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">

                          <p className="text-xs text-white/40">
                            Comparison
                          </p>

                          {isBestDeal ? (
                            <p className="mt-1 text-sm font-semibold text-white/80">
                              ✓ Best price among available stores
                            </p>
                          ) : (
                            <p className="mt-1 text-sm font-semibold text-white/60">
                              +{" "}
                              {formatPrice(
                                savings,
                                store.currencySymbol
                              )}{" "}
                              vs best deal
                            </p>
                          )}

                        </div>

                        {/* Details */}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();

                            router.push(
                              `/product/${store.id}?q=${encodeURIComponent(
                                store.product
                              )}&country=${encodeURIComponent(
                                selectedCountry
                              )}`
                            );
                          }}
                          className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                          View details →
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

              {/* Notice */}
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">

                <p className="text-xs leading-6 text-white/35">
                  Product, image, price, currency,
                  store availability, delivery and
                  rating data are currently being
                  served by the SearchOnce backend API.
                  Real e-commerce data will be connected
                  through legitimate APIs and partner
                  feeds.
                </p>

              </div>

            </>
          )}

      </section>
    </main>
  );
}