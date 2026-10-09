"use client";

import { Suspense, useState } from "react";
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

const countryCurrency: Record<Country, { currency: string; locale: string }> = {
  India: { currency: "INR", locale: "en-IN" },
  "United States": { currency: "USD", locale: "en-US" },
  "United Kingdom": { currency: "GBP", locale: "en-GB" },
  Ireland: { currency: "EUR", locale: "en-IE" },
  Canada: { currency: "CAD", locale: "en-CA" },
  Australia: { currency: "AUD", locale: "en-AU" },
  Germany: { currency: "EUR", locale: "de-DE" },
  UAE: { currency: "AED", locale: "en-AE" },
};

function isCountry(value: string | null): value is Country {
  return value !== null && value in countryCurrency;
}

function formatPrice(amount: number, currency: string, country: Country) {
  const supportedCurrency = /^[A-Z]{3}$/.test(currency)
    ? currency
    : countryCurrency[country].currency;

  return new Intl.NumberFormat(countryCurrency[country].locale, {
    style: "currency",
    currency: supportedCurrency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const feedbackOptions = [
  { value: "Price", title: "💰 Price", description: "Is the displayed price correct?" },
  { value: "Product", title: "📦 Product", description: "Is this the correct product or variant?" },
  { value: "Availability", title: "✅ Availability", description: "Is the product available?" },
  { value: "Delivery", title: "🚚 Delivery", description: "Is the delivery information correct?" },
  { value: "Other", title: "💬 Something else", description: "Tell us about another issue." },
];

function ProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productName = searchParams.get("q") || "Product listing";
  const store = searchParams.get("store") || "Shopping seller";
  const image = searchParams.get("image") || "";
  const countryParam = searchParams.get("country");
  const selectedCountry: Country = isCountry(countryParam) ? countryParam : "India";
  const currency = searchParams.get("currency") || countryCurrency[selectedCountry].currency;
  const currencySymbol = searchParams.get("currencySymbol") || "";
  const priceParam = searchParams.get("price");
  const price = priceParam !== null && Number.isFinite(Number(priceParam)) ? Number(priceParam) : null;
  const priceText = searchParams.get("priceText");
  const ratingParam = searchParams.get("rating");
  const rating = ratingParam !== null && Number.isFinite(Number(ratingParam)) ? Number(ratingParam) : null;
  const reviewsParam = searchParams.get("reviews");
  const reviews = reviewsParam !== null && Number.isFinite(Number(reviewsParam)) ? Number(reviewsParam) : null;
  const delivery = searchParams.get("delivery") || "Delivery details not provided by listing";
  const productUrl = searchParams.get("productUrl") || "";
  const badge = searchParams.get("badge") || "";
  const source = searchParams.get("source") || "Google Shopping via SerpApi";

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const displayedPrice = priceText || (price !== null ? formatPrice(price, currency, selectedCountry) : "Price unavailable");

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-black">S</div>
            <span className="text-xl font-semibold">SearchOnce</span>
          </button>
          <button onClick={() => router.back()} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]">← Back to results</button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white p-8 md:min-h-[500px]">
            {image ? (
              // Shopping thumbnails are returned by the search provider.
              <img src={image} alt={productName} className="max-h-[460px] w-full object-contain transition-transform duration-500 hover:scale-105" />
            ) : (
              <p className="text-sm text-black/50">Product image unavailable</p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm text-white/40">Listed by</p>
            <h2 className="mt-2 text-2xl font-semibold">{store}</h2>
            <p className="mt-2 text-sm text-white/40">🌍 {selectedCountry}</p>
            {badge && <span className="mt-4 w-fit rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold tracking-wider text-white/60">{badge}</span>}
            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{productName}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-white/[0.08] px-3 py-2 text-sm">
                {rating !== null ? `⭐ ${rating.toFixed(1)}` : "Rating unavailable"}
              </span>
              {reviews !== null && <span className="text-sm text-white/40">{reviews.toLocaleString()} reviews</span>}
            </div>

            <div className="mt-8">
              <p className="text-sm text-white/40">Current listed price in {selectedCountry}</p>
              <p className="mt-2 text-4xl font-bold sm:text-5xl">{displayedPrice}</p>
              {currencySymbol && <p className="mt-2 text-xs text-white/35">Currency: {currency} ({currencySymbol})</p>}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-white/40">Delivery</p>
              <p className="mt-2 font-medium">🚚 {delivery}</p>
            </div>

            {productUrl ? (
              <a href={productUrl} target="_blank" rel="noopener noreferrer" className="mt-8 rounded-2xl bg-white py-4 text-center text-sm font-semibold text-black transition hover:bg-white/90">
                View offer on Google Shopping ↗
              </a>
            ) : (
              <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-white/50">No external offer link was provided for this listing.</p>
            )}
            <p className="mt-3 text-xs leading-5 text-white/35">Prices and availability can change. Confirm the final price, product variant, condition and delivery details on the linked listing before purchasing.</p>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          {!submitted ? (
            <>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">Help us improve</p>
                <h2 className="mt-3 text-2xl font-semibold">Is this information correct?</h2>
                <p className="mt-2 text-sm text-white/40">Tell us what you think about this product information.</p>
              </div>

              <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
                {feedbackOptions.filter((option) => option.value !== "Other").map((option) => (
                  <button key={option.value} type="button" onClick={() => setFeedback(option.value)} className={`rounded-2xl border p-4 text-left transition ${feedback === option.value ? "border-white/40 bg-white/[0.1]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                    <p className="font-medium">{option.title}</p>
                    <p className="mt-1 text-xs text-white/35">{option.description}</p>
                  </button>
                ))}
              </div>

              <button type="button" onClick={() => setFeedback("Other")} className={`mx-auto mt-3 block w-full max-w-3xl rounded-2xl border p-4 text-left transition ${feedback === "Other" ? "border-white/40 bg-white/[0.1]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                <p className="font-medium">💬 Something else</p>
                <p className="mt-1 text-xs text-white/35">Tell us about another issue.</p>
              </button>

              <div className="mt-6 flex justify-center">
                <button type="button" onClick={() => { if (feedback) setSubmitted(true); }} disabled={!feedback} className={`rounded-xl px-8 py-3 text-sm font-semibold transition ${feedback ? "bg-white text-black hover:bg-white/90" : "cursor-not-allowed bg-white/10 text-white/30"}`}>Submit feedback</button>
              </div>
              <p className="mt-4 text-center text-xs text-white/30">Feedback is not saved to a database yet.</p>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-black">✓</div>
              <h2 className="mt-5 text-2xl font-semibold">Thanks for your feedback!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">Your feedback helps SearchOnce improve product information and comparison quality.</p>
              <button type="button" onClick={() => { setFeedback(""); setSubmitted(false); }} className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/70 transition hover:bg-white/[0.08]">Submit another response</button>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <p className="text-xs leading-6 text-white/35">Source: {source}. This is a shopping listing returned by the provider, not a direct stock or delivery guarantee from the merchant.</p>
        </div>
      </section>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] p-8 text-white/60">Loading product details…</div>}>
      <ProductContent />
    </Suspense>
  );
}
