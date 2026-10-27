"use client";

import { Suspense, useEffect, useState } from "react";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

type Country = "India" | "United States" | "United Kingdom" | "Ireland" | "Canada" | "Australia" | "Germany" | "UAE";

type CompareItem = {

  id: string; store: string; product: string; image: string | null; price: number;

  currency: string; currencySymbol: string; rating: number | null; country: Country;

  delivery: string; deliveryDays: number; badge: string | null; productUrl?: string | null;

  reviews?: number | null; priceText?: string | null; provider?: string; condition?: string | null;

  shippingCost?: number | null; shippingStatus?: "known" | "unknown"; shippingText?: string;

  totalPrice?: number | null; totalPriceText?: string | null;

  brand?: string | null; model?: string | null; color?: string | null; colour?: string | null;

  storage?: string | null; ram?: string | null; memory?: string | null;

  processor?: string | null; cpu?: string | null; display?: string | null; screen?: string | null;

  battery?: string | null; camera?: string | null; operatingSystem?: string | null; os?: string | null;

  connectivity?: string | null; warranty?: string | null; weight?: string | null;

  dimensions?: string | null; resolution?: string | null; snippet?: string | null;descriptionText?: string | null;

description?: string | null;

};

type SearchResponse = { success: boolean; results?: CompareItem[]; error?: string; message?: string };

const STORAGE_KEY = "searchonce-compare-products";

const countries: Country[] = ["India", "United States", "United Kingdom", "Ireland", "Canada", "Australia", "Germany", "UAE"];

function money(item: CompareItem) {

  if (item.totalPriceText) return item.totalPriceText;

  if (item.priceText) return item.priceText;

  return `${item.currencySymbol || ""}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(item.price)}`;

}

function extractTitleSpec(item: CompareItem, key: string): string | null {

  const aliases: Record<string, string[]> = {

    color: ["color", "colour"],

    colour: ["colour", "color"],

    ram: ["ram", "memory"],

    memory: ["memory", "ram"],

    processor: ["processor", "cpu"],

    cpu: ["cpu", "processor"],

    display: ["display", "screen"],

    screen: ["screen", "display"],

    operatingSystem: ["operatingSystem", "os"],

    os: ["os", "operatingSystem"],

  };

  const record = item as unknown as Record<string, unknown>;

  const directKeys = [key, ...(aliases[key] ?? [])];

  for (const field of directKeys) {

    const value = record[field];

    if (typeof value === "string" && value.trim()) {

      return value.trim();

    }

  }

  const source = [

    item.product,

    item.descriptionText,

    item.description,

    item.snippet,

  ]

    .filter((value): value is string => Boolean(value?.trim()))

    .join(" ");

  const patterns: Record<string, RegExp> = {

    brand: /\b(Apple|Samsung|Google|OnePlus|Xiaomi|Redmi|POCO|Realme|Motorola|Nothing|Sony|HP|Dell|Lenovo|ASUS|Acer|MSI|LG|TCL|Panasonic|Oppo|Vivo)\b/i,

    model: /\b(iPhone\s?\d{1,2}(?:\s?(?:Pro Max|Pro|Plus|Mini|e))?|Galaxy\s?[A-Z]?\s?\d{1,3}(?:\s?(?:FE|Ultra|Plus))?|Pixel\s?\d{1,2}(?:\s?Pro)?|OnePlus\s?\d{1,2}(?:\s?R)?|MacBook(?:\s+(?:Air|Pro))?)\b/i,

    ram: /\b(?:RAM|memory)\s*[:=-]?\s*(\d{1,3}\s?GB)\b|\b(\d{1,3}\s?GB)\s?(?:RAM|LPDDR[345X]?|DDR[345X]?)\b/i,

    storage: /\b(\d{2,4}\s?(?:GB|TB))\s?(?:storage|ROM|SSD|UFS|NVMe)\b|\b(\d{2,4}\s?(?:GB|TB))\s+(?:variant|model)\b/i,

    color: /\b(Black|White|Blue|Green|Red|Silver|Gold|Pink|Purple|Grey|Gray|Titanium|Midnight|Starlight|Graphite|Natural)\b/i,

    processor: /\b(Snapdragon\s?[\w+-]+|Apple\s?M[1-9](?:\s?(?:Pro|Max|Ultra))?|Intel\s?Core\s?i[3579]|Intel\s?Core\s?Ultra\s?[579]|Ryzen\s?[3579](?:\s?\d{3,5}[A-Z]?)?|MediaTek\s?Dimensity\s?\d+|Exynos\s?\d+|Tensor\s?G\d+)\b/i,

    display: /\b(\d{1,2}(?:\.\d)?\s?(?:inch|inches|"))/i,

    resolution: /\b(4K|8K|Full HD|FHD|QHD|UHD|2K|1080p|1440p|2160p)\b/i,

    os: /\b(iOS\s?\d{1,2}|Android\s?\d{1,2}|Windows\s?(?:10|11)|macOS|ChromeOS)\b/i,

    operatingSystem: /\b(iOS\s?\d{1,2}|Android\s?\d{1,2}|Windows\s?(?:10|11)|macOS|ChromeOS)\b/i,

    connectivity: /\b(5G|4G LTE|Wi-?Fi\s?6E?|Bluetooth\s?[5-9](?:\.\d)?|NFC|Dual SIM|eSIM)\b/i,

    camera: /\b(\d{2,3}\s?MP)\b/i,

    battery: /\b(\d{3,5}\s?mAh)\b/i,

    warranty: /\b(\d+\s?[- ]?year\s+warranty)\b/i,

    weight: /\b(\d{3,4}\s?g|\d(?:\.\d{1,2})?\s?kg)\b/i,

  };

  const match = patterns[key]?.exec(source);

  if (!match) return null;

  // RAM pattern has two capture groups; return the populated one.

  return (match[1] || match[2] || match[0]).trim();

}

function CompareContent() {

  const router = useRouter();

  const params = useSearchParams();

  const country = (countries.includes(params.get("country") as Country) ? params.get("country") : "India") as Country;

  const [items, setItems] = useState<CompareItem[]>([]);

  const [hydrated, setHydrated] = useState(false);

  const [slot, setSlot] = useState(2);

  const [searchText, setSearchText] = useState("");

  const [searching, setSearching] = useState(false);

  const [matches, setMatches] = useState<CompareItem[]>([]);

  const [message, setMessage] = useState("");

  const [addingSlot, setAddingSlot] = useState<number | null>(null);

  const [differencesOnly, setDifferencesOnly] = useState(false);

  useEffect(() => {

    try {

      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) setItems(parsed.slice(0, 4));

      }

    } catch (error) { console.warn("Could not load comparison", error); }

    setHydrated(true);

  }, []);

  useEffect(() => {

    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  }, [items, hydrated]);

  const removeItem = (index: number) => setItems((current) => current.filter((_, i) => i !== index));

  const clearAll = () => { setItems([]); setMatches([]); setSearchText(""); setMessage("Comparison cleared."); };

  const beginAdding = (index: number) => { setAddingSlot(index); setSearchText(""); setMatches([]); setMessage(""); };

  const searchOffers = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    if (searchText.trim().length < 2) { setMessage("Enter at least 2 characters to search."); return; }

    setSearching(true); setMessage("");

    try {

      const response = await fetch(`/api/search?${new URLSearchParams({ q: searchText.trim(), country })}`, { cache: "no-store" });

      const data = await response.json() as SearchResponse;

      if (!response.ok || !data.success) throw new Error(data.error || data.message || "Search failed.");

      const selectedKeys = new Set(items.map((item) => `${item.id}::${item.store}`));

      setMatches((data.results || []).filter((item) => !selectedKeys.has(`${item.id}::${item.store}`)));

      if (!(data.results || []).length) setMessage("No offers found. Try another product name.");

    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not search products."); }

    finally { setSearching(false); }

  };

  const addOffer = (item: CompareItem) => {

    if (items.length >= 4) { setMessage("Maximum 4 products can be compared."); return; }

    setItems((current) => [...current, item].slice(0, 4));

    setMatches([]); setSearchText(""); setAddingSlot(null); setMessage("Product added to comparison.");

  };

  const slotCount = items.length <= 1 ? 2 : items.length === 2 ? 2 : Math.min(4, items.length + 1);

  return <main className="min-h-screen bg-[#050505] pb-12 text-white">

    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">

        <Link href="/" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-black text-black">S</span><span className="text-lg font-semibold">SearchOnce</span></Link>

        <div className="flex items-center gap-3"><span className="hidden text-xs text-white/45 sm:inline">{country}</span><Link href="/" className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5">Home</Link></div>

      </div>

    </header>

    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">

        <div><p className="text-sm text-sky-300">SearchOnce</p><h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Compare Products</h1><p className="mt-2 text-sm text-white/45">Compare up to 4 offers across stores.</p></div>

        <div className="flex items-center gap-3"><span className="text-sm text-white/55">{items.length} of 4 selected</span><button onClick={clearAll} className="text-sm text-sky-300 hover:text-sky-200">Clear all</button></div>

      </div>

      {addingSlot !== null && <section className="mt-6 mb-6 rounded-2xl border border-sky-300/25 bg-sky-300/[0.04] p-5 sm:mt-7 sm:mb-7 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Search product {addingSlot + 1}</h2><p className="mt-1 text-xs text-white/45">Search for a product, then select the specific store offer.</p></div><button onClick={() => { setAddingSlot(null); setMatches([]); }} className="rounded-lg px-3 py-1 text-sm text-white/55 hover:bg-white/10">Close</button></div><form onSubmit={searchOffers} className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="e.g. iPhone 16 128GB" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-sm outline-none transition-colors focus:border-sky-300"/><button disabled={searching} className="rounded-xl bg-sky-400 px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-sky-300 disabled:opacity-50 sm:min-w-28">{searching ? "Searching…" : "Search"}</button></form>{message && <p aria-live="polite" className="mt-3 text-sm text-sky-200">{message}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">

        {matches.map((offer) => (

      <article

          key={`${offer.id}-${offer.store}`}

          className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2 sm:p-3"

      >

      {offer.image ? (

        <div className="flex h-24 w-full items-center justify-center rounded-lg bg-white p-2 sm:h-32">

          <img

            src={offer.image}

            alt={offer.product}

            className="h-full w-full object-contain"

          />

        </div>

      ) : (

        <div className="flex h-24 w-full items-center justify-center rounded-lg bg-white/5 text-xs text-white/40 sm:h-32">

          No image

        </div>

      )}

      <div className="mt-2 min-w-0 flex-1">

        <p className="line-clamp-3 break-words text-xs font-medium leading-4 text-white sm:text-sm sm:leading-5">

          {offer.product}

        </p>

        <p className="mt-1 truncate text-[10px] text-white/45 sm:text-xs">

          {offer.store}

        </p>

        <p className="mt-2 break-words text-sm font-bold leading-5 text-white sm:text-base">

          {money(offer)}

        </p>

      </div>

      <button

        onClick={() => addOffer(offer)}

        className="mt-3 w-full rounded-lg bg-white px-2 py-2.5 text-xs font-semibold leading-4 text-black transition hover:bg-white/90 sm:text-sm"

      >

        Add this offer

      </button>

      </article>

      ))}

      </div>

      </section>}

      <div className={items.length > 2

        ? "flex items-stretch gap-3 overflow-x-auto overscroll-x-contain pb-3 snap-x snap-mandatory sm:gap-4"

        : "grid grid-cols-2 items-stretch gap-3 sm:gap-4"}>

        {Array.from({ length: slotCount }, (_, index) => {

          const item = items[index];

          return <article key={item ? `${item.id}-${item.store}` : `slot-${index}`} className={`${items.length > 2 ? "w-[58vw] max-w-[210px] shrink-0 snap-start sm:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]" : "min-w-0"} h-full rounded-2xl border p-3 sm:p-5 ${item ? "border-white/15 bg-white/[0.04]" : "border-dashed border-white/20 bg-white/[0.02]"}`}>

            {item ? <>

              <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/55">Product {index + 1}</span><button onClick={() => removeItem(index)} aria-label={`Remove ${item.product}`} className="rounded-lg px-2 py-1 text-white/45 hover:bg-white/10 hover:text-white">✕</button></div>

              <div className="mt-3 flex h-24 items-center justify-center rounded-xl bg-white p-2 sm:mt-4 sm:h-32 sm:p-3">{item.image ? <img src={item.image} alt={item.product} className="h-full w-full object-contain" /> : <span className="text-xs text-black/50">Image unavailable</span>}</div>

              <h2 className="mt-2 line-clamp-2 min-h-9 break-words text-xs font-semibold sm:mt-4 sm:min-h-10 sm:text-sm">{item.product}</h2><p className="mt-1 text-xs text-white/50">{item.store}</p>

              <p className="mt-2 break-words text-lg font-bold sm:mt-3 sm:text-xl">{money(item)}</p><p className="mt-1 text-xs sm:mt-2 sm:text-sm">{item.rating != null ? `⭐ ${item.rating}${item.reviews ? ` (${item.reviews.toLocaleString()})` : ""}` : "Rating unavailable"}</p>

              <p className="mt-1 min-h-0 text-[11px] leading-4 text-white/50 sm:mt-2 sm:min-h-10 sm:text-xs sm:leading-5">{item.delivery || "Delivery details not provided"}</p>

              {item.productUrl ? <a href={item.productUrl} target="_blank" rel="noreferrer" className="mt-2 block rounded-xl bg-sky-400 px-2 py-2 text-center text-xs font-semibold text-black hover:bg-sky-300 sm:mt-3 sm:px-3 sm:py-2.5 sm:text-sm">View offer ↗</a> : <p className="mt-2 rounded-xl border border-white/10 px-2 py-2 text-center text-[11px] text-white/40 sm:mt-3 sm:px-3 sm:py-2.5 sm:text-xs">Store link unavailable</p>}

            </> : <div className="flex min-h-[280px] flex-col items-center justify-center px-3 py-8 text-center sm:min-h-[300px]"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-sky-300/40 text-3xl text-sky-300">+</div><p className="mt-4 font-semibold">Add product {index + 1}</p><p className="mt-1 text-xs text-white/45">Search for another offer</p><button onClick={() => beginAdding(index)} className="mt-4 rounded-xl border border-sky-300/40 px-4 py-2.5 text-sm font-semibold text-sky-200 hover:bg-sky-300/10">Select product</button></div>}

          </article>;

        })}

      </div>

      {items.length >= 2 && items.length < 4 && (

        <button

          type="button"

          onClick={() => beginAdding(items.length)}

          className="mt-4 rounded-xl border border-sky-300/30 px-4 py-2.5 text-sm font-semibold text-sky-200 hover:bg-sky-300/10"

        >

          + Add another product

        </button>

      )}

      {items.length >= 2 && (() => {

        const baseRows: { label: string; value: (item: CompareItem) => string }[] = [

          { label: "Price", value: (item) => money(item) },

          { label: "Store", value: (item) => item.store || "Not provided" },

          { label: "Rating", value: (item) => item.rating == null ? "Not provided" : `${item.rating}${item.reviews ? ` (${item.reviews.toLocaleString()} reviews)` : ""}` },

          { label: "Delivery", value: (item) => item.delivery || "Not provided" },

          { label: "Shipping", value: (item) => item.shippingText || "Not confirmed" },

          { label: "Condition", value: (item) => item.condition || "Not provided" },

          { label: "Country", value: (item) => item.country || "Not provided" },

        ];

        const specKeys = ["brand", "model", "color", "colour", "storage", "ram", "memory", "processor", "cpu", "display", "screen", "battery", "camera", "operatingSystem", "os", "connectivity", "warranty", "weight", "dimensions", "resolution"];

        const dynamicRows = specKeys.map((key) => {

          const values = items.map((item) => extractTitleSpec(item, key) ?? "Not provided");

          if (values.every((value) => value === "Not provided")) return null;

          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

          return { label, value: (item: CompareItem) => extractTitleSpec(item, key) ?? "Not provided" };

        }).filter((row): row is { label: string; value: (item: CompareItem) => string } => row !== null);

        const allRows = [...baseRows, ...dynamicRows];

        const rows = differencesOnly ? allRows.filter((row) => new Set(items.map((item) => row.value(item))).size > 1) : allRows;

        const pricedItems = items.filter((item) => Number.isFinite(item.totalPrice ?? item.price));

        const lowest = pricedItems.length ? pricedItems.reduce((best, item) => (item.totalPrice ?? item.price) < (best.totalPrice ?? best.price) ? item : best) : null;

        return <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">

          {lowest && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3"><div><p className="text-sm font-semibold text-emerald-200">Best listed price</p><p className="mt-1 text-xs text-white/55">{lowest.store} · {lowest.product}</p></div><p className="text-lg font-bold text-emerald-200">{money(lowest)}</p></div>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4"><div><h2 className="font-semibold">Side-by-side comparison</h2><p className="mt-1 text-xs text-white/45">Only fields supplied by the listing are shown; missing details are not guessed.</p></div><label className="flex cursor-pointer items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} className="h-4 w-4 accent-sky-400"/>Differences only</label></div>

          <div className={items.length > 2 ? "overflow-x-auto overscroll-x-contain" : "overflow-x-visible"}><table className={`w-full ${items.length > 2 ? "min-w-[640px]" : "min-w-0"} border-collapse text-xs sm:text-sm`}><thead><tr className="bg-white/[0.04]"><th className={`${items.length > 2 ? "w-36 px-4" : "w-20 px-2 sm:w-28 sm:px-3"} py-3 text-left text-white/55`}>Details</th>{items.map((item, i) => <th key={`${item.id}-${item.store}-h`} className="px-2 py-3 text-left sm:px-4">Product {i + 1}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={row.label} className={rowIndex % 2 ? "border-t border-white/5" : "border-t border-white/10"}><th className="px-2 py-3 text-left font-medium text-white/55 sm:px-4">{row.label}</th>{items.map((item) => <td key={`${item.id}-${item.store}-${row.label}`} className="break-words px-2 py-3 align-top sm:px-4">{row.value(item)}</td>)}</tr>)}</tbody></table>{differencesOnly && rows.length === 0 && <p className="p-5 text-sm text-white/50">No differences found in the available details.</p>}</div></section>;

      })()}

      {message && addingSlot === null && <p aria-live="polite" className="mt-4 text-sm text-sky-200">{message}</p>}

      {items.length < 2 && <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-white/50">Add at least two products to compare them side by side.</div>}

      <div className="mt-8"><button onClick={() => router.back()} className="rounded-xl border border-white/15 px-4 py-3 text-sm text-white/75 hover:bg-white/5">← Back</button></div>

    </section>

  </main>;

}

export default function ComparePage() { return <Suspense fallback={<main className="min-h-screen bg-[#050505] p-8 text-white/60">Loading comparison…</main>}><CompareContent /></Suspense>; }
