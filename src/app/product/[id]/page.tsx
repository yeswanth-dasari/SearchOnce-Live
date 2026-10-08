"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

type Country =
  | "India"
  | "United States"
  | "United Kingdom"
  | "Ireland"
  | "Canada"
  | "Australia"
  | "Germany"
  | "UAE";

type ProductInfo = {
  name: string;
  image: string;
  prices: Record<Country, number>;
};

const productCatalog: ProductInfo[] = [
  {
    name: "Samsung S25",
    image: "/products/samsung-s25.png",
    prices: {
      India: 69999,
      "United States": 799,
      "United Kingdom": 699,
      Ireland: 799,
      Canada: 1099,
      Australia: 1299,
      Germany: 799,
      UAE: 2999,
    },
  },

  {
    name: "iPhone 16",
    image: "/products/iphone-16.png",
    prices: {
      India: 69900,
      "United States": 799,
      "United Kingdom": 699,
      Ireland: 829,
      Canada: 1099,
      Australia: 1299,
      Germany: 799,
      UAE: 2999,
    },
  },

  {
    name: "MacBook Air",
    image: "/products/macbook-air.png",
    prices: {
      India: 99900,
      "United States": 999,
      "United Kingdom": 1099,
      Ireland: 1199,
      Canada: 1349,
      Australia: 1599,
      Germany: 1199,
      UAE: 4299,
    },
  },

  {
    name: "Nike Air Max",
    image: "/products/nike-air-max.png",
    prices: {
      India: 12995,
      "United States": 160,
      "United Kingdom": 145,
      Ireland: 170,
      Canada: 220,
      Australia: 250,
      Germany: 160,
      UAE: 599,
    },
  },
];

const storeInfo: Record<
  string,
  {
    store: string;
    rating: string;
    multiplier: number;
  }
> = {
  "product-amazon": {
    store: "Amazon",
    rating: "4.6",
    multiplier: 1,
  },

  "product-flipkart": {
    store: "Flipkart",
    rating: "4.5",
    multiplier: 0.978,
  },

  "product-croma": {
    store: "Croma",
    rating: "4.4",
    multiplier: 1.012,
  },

  "product-ebay": {
    store: "eBay",
    rating: "4.3",
    multiplier: 1.025,
  },
};

const countryCurrency: Record<
  Country,
  {
    currency: string;
    locale: string;
  }
> = {
  India: {
    currency: "INR",
    locale: "en-IN",
  },

  "United States": {
    currency: "USD",
    locale: "en-US",
  },

  "United Kingdom": {
    currency: "GBP",
    locale: "en-GB",
  },

  Ireland: {
    currency: "EUR",
    locale: "en-IE",
  },

  Canada: {
    currency: "CAD",
    locale: "en-CA",
  },

  Australia: {
    currency: "AUD",
    locale: "en-AU",
  },

  Germany: {
    currency: "EUR",
    locale: "de-DE",
  },

  UAE: {
    currency: "AED",
    locale: "en-AE",
  },
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findProduct(query: string) {
  const normalizedQuery = normalizeText(query);

  const matched = productCatalog.find(
    (product) => {
      const normalizedName =
        normalizeText(product.name);

      return (
        normalizedQuery.includes(
          normalizedName
        ) ||
        normalizedName.includes(
          normalizedQuery
        )
      );
    }
  );

  return matched || productCatalog[0];
}

function formatPrice(
  amount: number,
  country: Country
) {
  const info = countryCurrency[country];

  return new Intl.NumberFormat(
    info.locale,
    {
      style: "currency",
      currency: info.currency,
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

export default function ProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const id =
    pathname
      .split("/")
      .filter(Boolean)
      .pop() || "";

  const query =
    searchParams.get("q") || "";

  const selectedCountry =
    (searchParams.get(
      "country"
    ) as Country) || "India";

  const product =
    findProduct(query);

  const store =
    storeInfo[id] ||
    storeInfo["product-amazon"];

  const price = Math.round(
    product.prices[selectedCountry] *
      store.multiplier
  );

  let delivery =
    "Delivery information available";

  if (id === "product-amazon") {
    delivery =
      selectedCountry === "India"
        ? "Delivery in 2 days"
        : "Delivery in 2–3 days";
  }

  if (id === "product-flipkart") {
    delivery =
      selectedCountry === "India"
        ? "Delivery tomorrow"
        : "Delivery in 2–3 days";
  }

  if (id === "product-croma") {
    delivery =
      selectedCountry === "India"
        ? "Delivery in 3 days"
        : "Delivery in 3–4 days";
  }

  if (id === "product-ebay") {
    delivery =
      selectedCountry === "India"
        ? "Delivery in 4 days"
        : "Delivery in 3–5 days";
  }

  // Feedback state
  const [feedback, setFeedback] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const submitFeedback = () => {
    if (!feedback) {
      return;
    }

    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

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

          <button
            onClick={() =>
              router.back()
            }
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]"
          >
            ← Back to results
          </button>

        </div>
      </header>

      {/* Product Details */}
      <section className="mx-auto max-w-6xl px-6 py-12">

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

          {/* Product Image */}
          <div className="flex min-h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white p-8">

            <img
              src={product.image}
              alt={product.name}
              className="h-full max-h-[460px] w-full object-contain transition-transform duration-500 hover:scale-105"
            />

          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">

            <p className="text-sm text-white/40">
              Available on
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {store.store}
            </h2>

            <p className="mt-2 text-sm text-white/40">
              🌍 {selectedCountry}
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-5 flex items-center gap-3">

              <span className="rounded-lg bg-white/[0.08] px-3 py-2 text-sm">
                ⭐ {store.rating}
              </span>

              <span className="text-sm text-white/40">
                Customer rating
              </span>

            </div>

            {/* Price */}
            <div className="mt-8">

              <p className="text-sm text-white/40">
                Price in {selectedCountry}
              </p>

              <p className="mt-2 text-5xl font-bold">
                {formatPrice(
                  price,
                  selectedCountry
                )}
              </p>

            </div>

            {/* Delivery */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm text-white/40">
                Delivery
              </p>

              <p className="mt-2 font-medium">
                🚚 {delivery}
              </p>

            </div>

            {/* View Store */}
            <button
              onClick={() =>
                alert(
                  `${store.store} product link for ${product.name} in ${selectedCountry} will be connected later.`
                )
              }
              className="mt-8 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              View on {store.store} →
            </button>

          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          {!submitted ? (
            <>
              <div className="text-center">

                <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                  Help us improve
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Is this information correct?
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  Tell us what you think about this
                  product information.
                </p>

              </div>

              {/* Feedback options */}
              <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  onClick={() =>
                    setFeedback("Price")
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    feedback === "Price"
                      ? "border-white/40 bg-white/[0.1]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="font-medium">
                    💰 Price
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Is the displayed price correct?
                  </p>
                </button>

                <button
                  onClick={() =>
                    setFeedback("Product")
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    feedback === "Product"
                      ? "border-white/40 bg-white/[0.1]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="font-medium">
                    📦 Product
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Is this the correct product?
                  </p>
                </button>

                <button
                  onClick={() =>
                    setFeedback("Availability")
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    feedback === "Availability"
                      ? "border-white/40 bg-white/[0.1]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="font-medium">
                    ✅ Availability
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Is the product available?
                  </p>
                </button>

                <button
                  onClick={() =>
                    setFeedback("Delivery")
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    feedback === "Delivery"
                      ? "border-white/40 bg-white/[0.1]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="font-medium">
                    🚚 Delivery
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Is the delivery information correct?
                  </p>
                </button>

              </div>

              {/* Other */}
              <button
                onClick={() =>
                  setFeedback("Other")
                }
                className={`mx-auto mt-3 block w-full max-w-3xl rounded-2xl border p-4 text-left transition ${
                  feedback === "Other"
                    ? "border-white/40 bg-white/[0.1]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <p className="font-medium">
                  💬 Something else
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Tell us about another issue.
                </p>
              </button>

              {/* Submit */}
              <div className="mt-6 flex justify-center">

                <button
                  onClick={submitFeedback}
                  disabled={!feedback}
                  className={`rounded-xl px-8 py-3 text-sm font-semibold transition ${
                    feedback
                      ? "bg-white text-black hover:bg-white/90"
                      : "cursor-not-allowed bg-white/10 text-white/30"
                  }`}
                >
                  Submit feedback
                </button>

              </div>
            </>
          ) : (
            /* Success */
            <div className="py-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-black">
                ✓
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                Thanks for your feedback!
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Your feedback helps SearchOnce improve
                product information and comparison quality.
              </p>

              <button
                onClick={() => {
                  setFeedback("");
                  setSubmitted(false);
                }}
                className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/70 transition hover:bg-white/[0.08]"
              >
                Submit another response
              </button>

            </div>
          )}

        </div>

        {/* Prototype Notice */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">

          <p className="text-xs leading-6 text-white/30">
            Prototype data only. Price, availability and
            delivery information are sample values. Real
            store data and feedback storage will be
            connected through legitimate APIs and backend
            services later.
          </p>

        </div>

      </section>

    </main>
  );
}