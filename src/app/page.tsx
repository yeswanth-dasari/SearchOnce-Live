"use client";
import { useState, type CSSProperties} from "react";
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
         className="relative min-h-screen min-h-[100svh] cursor-pointer overflow-x-clip bg-[#050505] text-white"
      >
         {/* Background glow */}
         <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Smart World Grid: refined dotted world-map watermark */}
            <svg
               aria-hidden="true"
               viewBox="0 0 1200 700"
               preserveAspectRatio="xMidYMid slice"
               className="searchonce-world-grid absolute inset-0 h-full w-full"
            >
               <defs>
                  <pattern id="searchonce-world-dots" width="10" height="10" patternUnits="userSpaceOnUse">
                     <circle cx="2" cy="2" r="1.45" fill="#0EA5E9" fillOpacity="0.95" />
                  </pattern>
                  <linearGradient id="searchonce-world-arc" x1="0" y1="0" x2="1" y2="1">
                     <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.18" />
                     <stop offset="52%" stopColor="#0EA5E9" stopOpacity="0.72" />
                     <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.20" />
                  </linearGradient>
                  <radialGradient id="searchonce-world-node">
                     <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.95" />
                     <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.48" />
                     <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </radialGradient>
                  <mask id="searchonce-world-fade">
                     <rect width="1200" height="700" fill="url(#searchonce-world-mask-gradient)" />
                  </mask>
                  <radialGradient id="searchonce-world-mask-gradient">
                     <stop offset="0%" stopColor="white" stopOpacity="0.82" />
                     <stop offset="58%" stopColor="white" stopOpacity="0.96" />
                     <stop offset="100%" stopColor="white" stopOpacity="0.34" />
                  </radialGradient>
               </defs>
               <g fill="url(#searchonce-world-dots)" opacity="0.98" mask="url(#searchonce-world-fade)">
                  {/* Simplified continent silhouettes made from dots, not sharp outlines */}
                  <path d="M116 190 L154 155 205 143 240 118 286 132 318 157 346 174 365 204 343 228 320 246 307 277 281 293 264 322 238 313 218 284 191 267 179 238 150 224 132 207 Z" />
                  <path d="M274 323 L307 333 330 365 326 399 344 431 330 470 310 506 292 477 282 437 265 400 259 361 Z" />
                  <path d="M448 171 L478 150 512 156 536 178 565 184 583 207 569 228 542 231 525 252 500 246 483 226 460 216 Z" />
                  <path d="M498 266 L538 253 575 269 595 303 586 341 566 377 548 418 526 405 514 371 497 337 487 303 Z" />
                  <path d="M584 179 L624 150 671 143 704 158 741 149 775 166 812 162 844 184 875 190 895 218 871 240 835 237 810 255 781 244 755 260 726 244 698 253 674 230 644 225 620 204 596 210 Z" />
                  <path d="M686 269 L719 258 755 272 774 300 762 328 739 350 721 383 697 366 686 334 671 306 Z" />
                  <path d="M847 391 L884 378 918 391 936 418 920 441 887 449 860 431 Z" />
                  <path d="M948 458 L979 448 1004 462 1011 483 990 496 965 486 Z" />
               </g>
               {/* A few restrained global connection arcs */}
               <g fill="none" stroke="url(#searchonce-world-arc)" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M250 218 Q600 35 858 204" />
                  <path d="M335 410 Q600 170 850 390" />
                  <path d="M390 300 Q650 525 905 420" />
                  <path d="M170 270 Q600 620 1030 275" strokeDasharray="2 12" strokeOpacity="0.48" />
               </g>
               {/* Small, soft nodes; deliberately no large bright halos */}
               <g fill="url(#searchonce-world-node)">
                  <circle cx="250" cy="218" r="13" />
                  <circle cx="600" cy="250" r="15" />
                  <circle cx="858" cy="204" r="12" />
                  <circle cx="850" cy="390" r="11" />
                  <circle cx="905" cy="420" r="10" />
               </g>
               <g fill="#BAE6FD" fillOpacity="0.95">
                  <circle cx="250" cy="218" r="2.4" />
                  <circle cx="600" cy="250" r="2.6" />
                  <circle cx="858" cy="204" r="2.3" />
                  <circle cx="850" cy="390" r="2.2" />
                  <circle cx="905" cy="420" r="2.1" />
               </g>
            </svg>
            <div className="absolute left-1/2 top-[42%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.08] blur-[100px] sm:top-1/2 sm:h-[500px] sm:w-[500px] sm:bg-blue-500/10 sm:blur-[120px]" />
            <div className="absolute left-1/2 top-[42%] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 sm:top-1/2 sm:h-[300px] sm:w-[300px]" />
            <div className="absolute left-1/2 top-[42%] h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] sm:top-1/2 sm:h-[430px] sm:w-[430px]" />
         </div>
         {/* Mobile-only subtle spotlight */}
            <div
            aria-hidden="true"
            className="searchonce-mobile-spotlight"
         />
         {/* Floating store logos: logo-only for Amazon/eBay; names remain on the other cards. */}
         {stores.map((store) => (
            <div
               aria-hidden="true"
               key={store.name}
               className={`searchonce-store-card pointer-events-none absolute z-0 hidden min-[1280px]:block h-[60px] ${
                  store.position.left ? "searchonce-store-card-left" : "searchonce-store-card-right"
               }`}
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
         <section className="relative z-10 flex min-h-screen min-h-[100svh] flex-col items-center justify-center px-5 pb-[calc(84px+env(safe-area-inset-bottom))] pt-5 text-center sm:justify-center sm:px-6 sm:pb-24 sm:pt-9 md:pt-10 lg:pt-12 xl:justify-start">
            {/* SearchOnce logo */}
            <div className="mb-5 sm:mb-6">
               <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-black text-black shadow-[0_0_32px_rgba(255,255,255,0.12)] sm:h-12 sm:w-12 sm:text-xl sm:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                     S
                  </div>
                  <span className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                     SearchOnce
                  </span>
               </div>
            </div>
            {/* Main heading */}
            <h1 className="w-full max-w-[360px] px-0.5 text-[clamp(2rem,8.8vw,3rem)] font-semibold leading-[1.04] tracking-[-0.05em] sm:max-w-4xl sm:px-0 sm:text-6xl md:max-w-[600px] md:text-6xl lg:max-w-[600px] xl:max-w-4xl xl:text-7xl">
               Search once.
               <br />
               <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                  Compare everywhere.
               </span>
            </h1>
            {/* Description */}
            <p className="mt-3 max-w-[340px] px-1 text-sm leading-6 text-white/55 sm:mt-5 sm:max-w-xl sm:px-0 sm:text-lg sm:leading-7">
               Find products from stores around you and compare prices,
               availability and offers in one simple place.
            </p>
            {/* Search */}
            <div
               className="mt-5 flex w-full max-w-2xl items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.05] p-1.5 shadow-2xl backdrop-blur-xl sm:mt-7 sm:gap-3 sm:p-2 md:mt-8 md:max-w-[680px] lg:max-w-[600px] xl:max-w-2xl"
               onClick={(event) => event.stopPropagation()}
            >
               <div className="flex h-11 min-w-0 flex-1 items-center sm:h-12">
                  <span className="ml-2 mr-2 text-lg text-white/40 sm:ml-4 sm:mr-3 sm:text-xl">⌕</span>
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
                     className="h-full min-w-0 w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/35 sm:text-base"
                  />
               </div>
               <button
                  onClick={goToResults}
                  className="shrink-0 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 sm:px-5"
               >
                  Search
               </button>
            </div>
                        {/* Location and country controls */}
         <div
            className="mt-3 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2 text-xs sm:mt-4 sm:gap-2 sm:text-sm md:max-w-[720px] lg:max-w-[640px] xl:max-w-5xl"
            onClick={(event) => event.stopPropagation()}
         >
            <span className="inline-flex items-center text-white/55">Location</span>
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
            {/* Full location details remain visible on desktop in the first row. */}
            <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80 sm:inline-flex">
               <span className="text-white/40">City</span>
               <span className="max-w-32 truncate">{city || "—"}</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80 sm:inline-flex">
               <span className="text-white/40">{locationAreaLabel}</span>
               <span className="max-w-40 truncate">{locationState || "—"}</span>
            </div>
            {locationCounty && (
               <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80 sm:inline-flex">
                  <span className="text-white/40">County / District</span>
                  <span className="max-w-40 truncate">{locationCounty}</span>
               </div>
            )}
            <select
               value={country}
               onChange={(event) => setCountry(event.target.value)}
               onClick={(event) => event.stopPropagation()}
               aria-label="Select country"
               className="max-w-[142px] cursor-pointer rounded-lg border border-white/10 bg-[#17181d] px-2.5 py-2 text-white outline-none transition hover:bg-white/10 sm:max-w-none sm:px-3"
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
         {/* On phones, show every location value in compact cards instead of hiding it. */}
         <div
            className="mt-2 grid w-full max-w-[360px] grid-cols-2 gap-1.5 sm:hidden"
            onClick={(event) => event.stopPropagation()}
         >
            <div className="col-span-2 flex min-w-0 flex-col items-start gap-0.5 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1.5 text-left">
               <span className="text-[10px] leading-4 text-white/40">City</span>
               <span className="w-full truncate text-xs leading-4 text-white/80">{city || "—"}</span>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-0.5 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-left">
               <span className="w-full truncate text-[10px] leading-4 text-white/40">{locationAreaLabel}</span>
               <span className="w-full truncate text-xs leading-4 text-white/80">{locationState || "—"}</span>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-0.5 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-left">
               <span className="w-full truncate text-[10px] leading-4 text-white/40">County / District</span>
               <span className="w-full truncate text-xs leading-4 text-white/80">{locationCounty || "—"}</span>
            </div>
         </div>
            <div
               className="mt-2 flex w-full max-w-[320px] items-center gap-2 px-1 sm:max-w-[280px] sm:px-0"
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
            <p
               role="status"
               aria-live="polite"
               className="mt-1 min-h-[2rem] w-full max-w-[350px] px-2 text-center text-[10px] leading-4 text-white/50 sm:min-h-0 sm:max-w-none sm:px-0 sm:text-xs sm:leading-normal"
            >
               {locationMessage}
               {locationMessage && postalCode ? " · " : ""}
               {postalCode && `PIN / Postal code: ${postalCode}`}
            </p>
            {/* Bottom message */}
            <div
               className={`mt-4 sm:mt-8 md:mt-10 transition-all duration-700 ${
                  started ? "opacity-0" : "animate-pulse opacity-60"
               }`}
            >
               <p className="text-[10px] uppercase tracking-[0.14em] text-white/40 sm:text-xs sm:tracking-[0.3em]">
                  Find what you're looking for
               </p>
            </div>
            <p className="mt-3 px-3 pb-0 text-center text-[11px] text-white/25 sm:mt-3 sm:px-0 sm:text-xs">
               One search • Multiple stores • Better decisions
            </p>
         </section>
      
      {/* Premium glass category navigation: swipe categories on small screens; Home stays accessible. */}
      <nav
         aria-label="Product categories"
         className="searchonce-category-nav fixed inset-x-0 bottom-0 z-40 overflow-hidden px-1.5 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+6px)] sm:px-2"
         onClick={(event) => event.stopPropagation()}
      >
         <div className="searchonce-category-nav-inner mx-auto flex max-w-[1500px] items-stretch gap-1">
            <div
               className="flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x scroll-smooth sm:overflow-visible"
               style={{ scrollbarWidth: "none" }}
            >
               {navigationCategories
                  .filter((category) => category.slug !== "home")
                  .map((category) => (
                     <button
                        key={category.slug}
                        type="button"
                        onClick={() => openCategory(category.slug)}
                        aria-label={`Browse ${category.label}`}
                        className="searchonce-category-item group relative flex min-w-[66px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-[10px] leading-tight text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:min-w-0 sm:flex-1 sm:px-2 sm:text-[11px]"
                        style={
                           {
                              "--category-accent": category.color,
                           } as CSSProperties
                        }
                     >
                        <span className="searchonce-category-content relative z-[1] flex flex-col items-center justify-center gap-1">
                           <CategoryIcon
                              name={category.icon}
                              color={category.color}
                           />
                           <span className="whitespace-nowrap">
                              {category.label}
                           </span>
                        </span>
                     </button>
                  ))}
            </div>

            <div
               aria-hidden="true"
               className="my-1 w-px shrink-0 bg-white/15"
            />

            <button
               type="button"
               onClick={() => openCategory("home")}
               aria-label="Go to homepage"
               aria-current="page"
               className="searchonce-category-item searchonce-category-home group relative flex w-[56px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] leading-tight text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:w-[74px] sm:px-2 sm:text-[11px]"
               style={
                  {
                     "--category-accent": "#F3F4F6",
                  } as CSSProperties
               }
            >
               <span className="searchonce-category-content relative z-[1] flex flex-col items-center justify-center gap-1">
                  <CategoryIcon name="home" color="#F3F4F6" />
                  <span className="whitespace-nowrap">Home</span>
                  <span className="h-0.5 w-5 rounded-full bg-blue-400" />
               </span>
            </button>
         </div>
      </nav>
      </main>
   );
}
