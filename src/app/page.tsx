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
   position: { top: string; left?: string; right?: string };
   delay: string;
   rotation: string;
   borderColor: string;
   tint: string;
   glow: string;
};

// Balanced arc-like placement around the hero. Cards stay straight-edged and
// only tilt slightly; their existing float animation adds the movement.
const stores: Store[] = [
   {
      name: "Amazon",
      type: "amazon",
      position: { top: "10%", left: "clamp(22px, 17vw, 290px)" },
      delay: "0s",
      rotation: "-1.5deg",
      borderColor: "rgba(255,153,0,0.34)",
      tint: "rgba(255,153,0,0.035)",
      glow: "rgba(255,153,0,0.10)",
   },
   {
      name: "Flipkart",
      type: "flipkart",
      position: { top: "28%", left: "clamp(18px, 9vw, 155px)" },
      delay: "1s",
      rotation: "1.5deg",
      borderColor: "rgba(40,116,240,0.34)",
      tint: "rgba(40,116,240,0.04)",
      glow: "rgba(40,116,240,0.11)",
   },
   {
      name: "Myntra",
      type: "myntra",
      position: { top: "48%", left: "clamp(18px, 8vw, 143px)" },
      delay: "2s",
      rotation: "-1.3deg",
      borderColor: "rgba(233,30,143,0.30)",
      tint: "rgba(233,30,143,0.035)",
      glow: "rgba(233,30,143,0.09)",
   },
   {
      name: "Croma",
      type: "croma",
      position: { top: "68%", left: "clamp(20px, 10vw, 180px)" },
      delay: "3s",
      rotation: "1.2deg",
      borderColor: "rgba(83,199,163,0.32)",
      tint: "rgba(83,199,163,0.035)",
      glow: "rgba(83,199,163,0.09)",
   },
   {
      name: "eBay",
      type: "ebay",
      position: { top: "10%", right: "clamp(22px, 17vw, 290px)" },
      delay: "1.5s",
      rotation: "1.5deg",
      borderColor: "rgba(0,100,210,0.32)",
      tint: "rgba(0,100,210,0.035)",
      glow: "rgba(0,100,210,0.09)",
   },
   {
      name: "Walmart",
      type: "walmart",
      position: { top: "28%", right: "clamp(18px, 9vw, 155px)" },
      delay: "2.5s",
      rotation: "-1.5deg",
      borderColor: "rgba(255,194,32,0.30)",
      tint: "rgba(255,194,32,0.035)",
      glow: "rgba(255,194,32,0.09)",
   },
   {
      name: "Target",
      type: "target",
      position: { top: "48%", right: "clamp(18px, 8vw, 143px)" },
      delay: "3.5s",
      rotation: "1.3deg",
      borderColor: "rgba(229,50,56,0.30)",
      tint: "rgba(229,50,56,0.035)",
      glow: "rgba(229,50,56,0.09)",
   },
   {
      name: "Best Buy",
      type: "bestbuy",
      position: { top: "68%", right: "clamp(20px, 10vw, 180px)" },
      delay: "4.5s",
      rotation: "-1.2deg",
      borderColor: "rgba(255,224,0,0.30)",
      tint: "rgba(255,224,0,0.035)",
      glow: "rgba(255,224,0,0.085)",
   },
];

type CategoryIconName =
   | "mobile"
   | "laptop"
   | "headphones"
   | "bag"
   | "tablet"
   | "watch"
   | "tv"
   | "gamepad"
   | "camera"
   | "home";

type NavigationCategory = {
   slug: string;
   label: string;
   icon: CategoryIconName;
   color: string;
};

const navigationCategories: NavigationCategory[] = [
   { slug: "mobiles", label: "Mobiles", icon: "mobile", color: "#3B82F6" },
   { slug: "laptops", label: "Laptops", icon: "laptop", color: "#A855F7" },
   { slug: "electronics", label: "Electronics", icon: "headphones", color: "#22C55E" },
   { slug: "accessories", label: "Accessories", icon: "bag", color: "#F97316" },
   { slug: "tablets", label: "Tablets", icon: "tablet", color: "#EF4444" },
   { slug: "wearables", label: "Wearables", icon: "watch", color: "#A855F7" },
   { slug: "tvs", label: "TVs", icon: "tv", color: "#EAB308" },
   { slug: "gaming", label: "Gaming", icon: "gamepad", color: "#9333EA" },
   { slug: "cameras", label: "Cameras", icon: "camera", color: "#EC4899" },
   { slug: "home", label: "Home", icon: "home", color: "#F3F4F6" },
];

function CategoryIcon({
   name,
   color,
}: {
   name: CategoryIconName;
   color: string;
}) {
   return (
      <svg
         aria-hidden="true"
         viewBox="0 0 24 24"
         fill="none"
         stroke={color}
         strokeWidth="1.8"
         strokeLinecap="round"
         strokeLinejoin="round"
         className="h-[22px] w-[22px] transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-6 sm:w-6"
      >
         {name === "mobile" && <>
            <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
            <path d="M10 5h4M11 18.5h2" />
         </>}
         {name === "laptop" && <>
            <rect x="4" y="3" width="16" height="13" rx="1.5" />
            <path d="m2 20 2-4h16l2 4H2Z" />
         </>}
         {name === "headphones" && <>
            <path d="M3 13v-2a9 9 0 0 1 18 0v2" />
            <rect x="3" y="12" width="4" height="8" rx="1.5" />
            <rect x="17" y="12" width="4" height="8" rx="1.5" />
         </>}
         {name === "bag" && <>
            <path d="M4 8h16l1 13H3L4 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
         </>}
         {name === "tablet" && <>
            <rect x="5" y="2.5" width="14" height="19" rx="2" />
            <path d="M10 5h4M11 18.5h2" />
         </>}
         {name === "watch" && <>
            <path d="M9 2h6l1 4H8l1-4ZM8 18h8l-1 4H9l-1-4Z" />
            <rect x="6" y="6" width="12" height="12" rx="3" />
            <path d="M12 9v3l2 1" />
         </>}
         {name === "tv" && <>
            <rect x="2.5" y="3.5" width="19" height="13" rx="1.5" />
            <path d="M9 21h6M12 16.5V21" />
         </>}
         {name === "gamepad" && <>
            <path d="M6.5 8h11a4 4 0 0 1 3.8 5.2l-1 3.3a2.5 2.5 0 0 1-4.1 1.1l-2-1.7h-4.4l-2 1.7a2.5 2.5 0 0 1-4.1-1.1l-1-3.3A4 4 0 0 1 6.5 8Z" />
            <path d="M7 11v4M5 13h4M16.5 12h.01M18.5 14h.01" />
         </>}
         {name === "camera" && <>
            <path d="M3 8h4l1.5-3h7L17 8h4v12H3V8Z" />
            <circle cx="12" cy="14" r="4" />
            <path d="M18 10h.01" />
         </>}
         {name === "home" && <>
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v11h14V9M9 20v-6h6v6" />
         </>}
      </svg>
   );
}

const storeCardWidths: Record<Store["type"], string> = {
   amazon: "144px",
   flipkart: "154px",
   myntra: "152px",
   croma: "142px",
   ebay: "132px",
   walmart: "136px",
   target: "142px",
   bestbuy: "154px",
};

function StoreLogo({ type }: { type: Store["type"] }) {
   switch (type) {
      case "amazon":
         return (
            <div className="flex min-w-[116px] items-center justify-center">
               <div className="flex flex-col items-center leading-none">
                  <span className="text-[19px] font-extrabold tracking-[-0.045em] text-white">amazon</span>
                  <svg aria-hidden="true" viewBox="0 0 56 12" className="-mt-0.5 h-2.5 w-12">
                     <path d="M4 3.5C17 11 35 11 48 3" fill="none" stroke="#FF9900" strokeWidth="2.4" strokeLinecap="round" />
                     <path d="M42 2.5 49 2.4 46 8" fill="none" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
               </div>
            </div>
         );
      case "flipkart":
         return (
            <div className="flex min-w-[124px] items-center gap-2.5">
               <img
                  src="https://static.freepnglogo.com/images/all_img/flipkart-log-icon-e33c.png"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="h-9 w-9 shrink-0 rounded-lg object-contain"
               />
               <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white">Flipkart</span>
            </div>
         );
      case "myntra":
         return (
            <div className="flex min-w-[122px] items-center gap-2.5">
               <img
                  src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/3b/e2/79/3be279fc-c034-936d-ddef-ca8f5ad699c2/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.png"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="h-9 w-9 shrink-0 rounded-xl object-contain"
               />
               <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white">Myntra</span>
            </div>
         );
      case "croma":
         return (
            <div className="flex min-w-[112px] items-center gap-2.5">
               <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#53C7A3] text-[19px] font-black text-[#53C7A3]">C</span>
               <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white">Croma</span>
            </div>
         );
      case "ebay":
         return (
            <div className="flex min-w-[104px] items-center justify-center gap-2">
               <span className="text-[25px] font-semibold leading-none tracking-[-0.075em]">
                  <span className="text-[#E53238]">e</span><span className="text-[#0064D2]">b</span><span className="text-[#F5AF02]">a</span><span className="text-[#86B817]">y</span>
               </span>
            </div>
         );
      case "walmart":
         return (
            <div className="flex min-w-0 items-center gap-1.5">
               <span className="whitespace-nowrap text-[14px] font-bold tracking-tight text-white">Walmart</span>
               <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/60/Walmart_spark_%282025%29.svg"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="h-5 w-5 shrink-0 object-contain"
               />
            </div>
         );
      case "target":
         return (
            <div className="flex min-w-[112px] items-center gap-2.5">
               <svg aria-hidden="true" viewBox="0 0 36 36" className="h-9 w-9 shrink-0">
                  <circle cx="18" cy="18" r="15" fill="#E53238" />
                  <circle cx="18" cy="18" r="9.4" fill="#050505" />
                  <circle cx="18" cy="18" r="4" fill="#E53238" />
               </svg>
               <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white">Target</span>
            </div>
         );
      case "bestbuy":
         return (
            <div className="flex min-w-[128px] items-center gap-2">
               <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#FFE000] text-[11px] font-black tracking-[-0.06em] text-black [clip-path:polygon(0_0,100%_0,100%_72%,76%_100%,0_100%)]">BB</span>
               <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white">Best Buy</span>
            </div>
         );
   }
}

export default function Home() {
   const [started, setStarted] = useState(false);
   const [query, setQuery] = useState("");
   const [country, setCountry] = useState("India");
   const [city, setCity] = useState("");
   const [locationState, setLocationState] = useState("");
   const [locationCounty, setLocationCounty] = useState("");
   const [locationAreaLabel, setLocationAreaLabel] = useState("State / Region");
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
   const openCategory = (slug: string) => {
      if (slug === "home") {
         router.push("/");
         return;
      }
      const params = new URLSearchParams({ country });
      if (city) params.set("city", city);
      if (locationState) params.set("state", locationState);
      if (locationCounty) params.set("county", locationCounty);
      const selectedPostcode = postalCode || postcodeInput;
      if (selectedPostcode) params.set("postcode", selectedPostcode);
      router.push(`/category/${slug}?${params.toString()}`);
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
                     county?: string;
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
               const detectedCode = (place.countryCode ?? "").toUpperCase();
               setCity(place.city ?? "");
               setLocationState(place.state ?? "");
               setLocationCounty(place.county ?? "");
               setLocationAreaLabel(
                  detectedCode === "IE"
                     ? "Province / Region"
                     : detectedCode === "GB"
                       ? "Region"
                       : detectedCode === "CA"
                         ? "Province"
                         : detectedCode === "AE"
                           ? "Emirate"
                           : "State / Region"
               );
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
            enableHighAccuracy: true,
            timeout: 20000,
            // Always request a fresh position; avoid reusing a cached location for up to 5 minutes.
            maximumAge: 0,
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
               county?: string;
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
         const detectedCode = (place.countryCode ?? "").toUpperCase();
         setCity(place.city ?? "");
         setLocationState(place.state ?? "");
         setLocationCounty(place.county ?? "");
         setLocationAreaLabel(
            detectedCode === "IE"
               ? "Province / Region"
               : detectedCode === "GB"
                 ? "Region"
                 : detectedCode === "CA"
                   ? "Province"
                   : detectedCode === "AE"
                     ? "Emirate"
                     : "State / Region"
         );
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
         className="relative min-h-screen cursor-pointer overflow-x-clip bg-[#050505] text-white"
      >
         {/* Background glow */}
         <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
            <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
         </div>
         {/* Floating store logos: logo-only for Amazon/eBay; names remain on the other cards. */}
         {stores.map((store) => (
            <div
               aria-hidden="true"
               key={store.name}
               className="pointer-events-none absolute z-0 hidden h-[60px] 2xl:block"
               style={{
                  ...store.position,
                  width: storeCardWidths[store.type],
                  transform: `rotate(${store.rotation})`,
               }}
            >
               <div
                  className="searchonce-float flex h-[60px] w-full items-center justify-center overflow-hidden rounded-2xl border bg-[#101114]/95 px-2.5 py-2 backdrop-blur-xl transition-colors duration-300"
                  style={{
                     animationDelay: store.delay,
                     borderColor: store.borderColor,
                     background: `linear-gradient(135deg, ${store.tint} 0%, rgba(16,17,20,0.96) 62%)`,
                     boxShadow: `0 8px 20px rgba(0,0,0,0.26), 0 0 8px ${store.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
               >
                  <StoreLogo type={store.type} />
               </div>
            </div>
         ))}
         {/* Main content */}
         <section className="relative z-10 flex min-h-screen flex-col items-center justify-start px-6 pb-24 pt-7 text-center sm:pt-9">
            {/* SearchOnce logo */}
            <div className="mb-6">
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
            <p className="mt-5 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
               Find products from stores around you and compare prices,
               availability and offers in one simple place.
            </p>
            {/* Search */}
            <div
               className="mt-7 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2 shadow-2xl backdrop-blur-xl"
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
               className="mt-4 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2 text-xs sm:text-sm"
               onClick={(event) => event.stopPropagation()}
            >
               <span className="inline-flex items-center text-white/55">
                  <span>Location</span>
               </span>
               <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-white transition hover:bg-white/10 disabled:opacity-50"
               >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-rose-400" fill="currentColor">
                     <path d="M12 22s7-6.1 7-13A7 7 0 1 0 5 9c0 6.9 7 13 7 13Zm0-10.2A2.8 2.8 0 1 1 12 6.2a2.8 2.8 0 0 1 0 5.6Z" />
                  </svg>
                  {locationLoading ? "Locating..." : "Detect"}
               </button>
               <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80">
                  <span className="text-white/40">City</span>
                  <span className="max-w-32 truncate">{city || "—"}</span>
               </div>
               <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80">
                  <span className="text-white/40">{locationAreaLabel}</span>
                  <span className="max-w-40 truncate">{locationState || "—"}</span>
               </div>
                  {locationCounty && (
                     <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80">
                        <span className="text-white/40">County / District</span>
                        <span className="max-w-40 truncate">{locationCounty}</span>
                     </div>
                  )}
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
               className="mt-2 flex w-full max-w-[280px] items-center gap-2"
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
            {(locationMessage || postalCode) && (
            <p
               role="status"
               aria-live="polite"
               className="mt-1 text-center text-xs text-white/50"
            >
               {locationMessage}
               {locationMessage && postalCode ? " · " : ""}
               {postalCode && `PIN / Postal code: ${postalCode}`}
            </p>
            )}
            {/* Bottom message */}
            <div
               className={`mt-8 sm:mt-10 transition-all duration-700 ${
                  started ? "opacity-0" : "animate-pulse opacity-60"
               }`}
            >
               <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Find what you're looking for
               </p>
            </div>
            <p className="mt-1 pb-0 text-center text-xs text-white/25">
               One search • Multiple stores • Better decisions
            </p>
         </section>
      {/* Compact bottom category navigation */}
      <nav
         aria-label="Product categories"
         className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07080b]/90 px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-[0_-10px_35px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
         onClick={(event) => event.stopPropagation()}
      >
         <div
            className="mx-auto flex max-w-[1500px] items-stretch justify-between gap-1 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
         >
            {navigationCategories.map((category) => {
               const isHome = category.slug === "home";
               return (
                  <button
                     key={category.slug}
                     type="button"
                     onClick={() => openCategory(category.slug)}
                     aria-label={isHome ? "Go to homepage" : `Browse ${category.label}`}
                     aria-current={isHome ? "page" : undefined}
                     className={`group relative flex min-w-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-t-lg px-2 py-1.5 text-[10px] leading-tight transition-colors duration-200 sm:min-w-0 sm:text-[11px] ${
                        isHome ? "text-white" : "text-white/65 hover:text-white"
                     }`}
                  >
                     <CategoryIcon name={category.icon} color={category.color} />
                     <span className="whitespace-nowrap">{category.label}</span>
                     <span
                        className={`absolute bottom-0 h-0.5 w-5 rounded-full transition-colors ${
                           isHome ? "bg-blue-400" : "bg-transparent group-hover:bg-white/40"
                        }`}
                     />
                  </button>
               );
            })}
         </div>
      </nav>
      </main>
   );
}
