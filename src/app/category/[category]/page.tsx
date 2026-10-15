"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Choice = {
   label: string;
   search: string;
   description: string;
};

type CategoryDefinition = {
   title: string;
   subtitle: string;
   eyebrow: string;
   accent: string;
   choices: Choice[];
};

const categoryDefinitions: Record<string, CategoryDefinition> = {
   mobiles: {
      title: "Choose your mobile brand",
      subtitle: "Explore phone offers for your selected country and compare available listings.",
      eyebrow: "MOBILES",
      accent: "#3B82F6",
      choices: [
         { label: "Apple", search: "Apple iPhone", description: "iPhone models and offers" },
         { label: "Samsung", search: "Samsung Galaxy smartphone", description: "Galaxy phones and offers" },
         { label: "OnePlus", search: "OnePlus smartphone", description: "OnePlus phone offers" },
         { label: "Google Pixel", search: "Google Pixel phone", description: "Pixel phones and offers" },
         { label: "Xiaomi", search: "Xiaomi smartphone", description: "Xiaomi phone offers" },
         { label: "Redmi", search: "Redmi smartphone", description: "Redmi phone offers" },
         { label: "Vivo", search: "Vivo smartphone", description: "Vivo phone offers" },
         { label: "OPPO", search: "OPPO smartphone", description: "OPPO phone offers" },
         { label: "Motorola", search: "Motorola smartphone", description: "Motorola phone offers" },
         { label: "realme", search: "realme smartphone", description: "realme phone offers" },
         { label: "Nothing", search: "Nothing Phone smartphone", description: "Nothing phone offers" },
         { label: "iQOO", search: "iQOO smartphone", description: "Performance phones and offers" },
         { label: "ASUS", search: "ASUS smartphone", description: "Zenfone and gaming phones" },
         { label: "Infinix", search: "Infinix smartphone", description: "Infinix phone offers" },
         { label: "Tecno", search: "Tecno smartphone", description: "Tecno phone offers" },
         { label: "Honor", search: "Honor smartphone", description: "HONOR phone offers" },
      ],
   },
   laptops: {
      title: "Choose your laptop brand",
      subtitle: "Pick a brand to search its laptop listings and compare current prices.",
      eyebrow: "LAPTOPS",
      accent: "#A855F7",
      choices: [
         { label: "Apple", search: "Apple MacBook laptop", description: "MacBook models and offers" },
         { label: "HP", search: "HP laptop", description: "HP laptop offers" },
         { label: "Dell", search: "Dell laptop", description: "Dell laptop offers" },
         { label: "Lenovo", search: "Lenovo laptop", description: "Lenovo laptop offers" },
         { label: "ASUS", search: "ASUS laptop", description: "ASUS laptop offers" },
         { label: "Acer", search: "Acer laptop", description: "Acer laptop offers" },
         { label: "MSI", search: "MSI laptop", description: "MSI laptop offers" },
         { label: "Microsoft Surface", search: "Microsoft Surface laptop", description: "Surface laptop offers" },
         { label: "Samsung", search: "Samsung laptop", description: "Samsung laptop offers" },
         { label: "LG", search: "LG laptop", description: "LG laptop offers" },
      ],
   },
   electronics: {
      title: "Explore electronics",
      subtitle: "Choose the type of electronic product you want to compare.",
      eyebrow: "ELECTRONICS",
      accent: "#22C55E",
      choices: [
         { label: "Headphones", search: "headphones", description: "Wired and wireless headphones" },
         { label: "Earbuds", search: "wireless earbuds", description: "True wireless and Bluetooth earbuds" },
         { label: "Speakers", search: "Bluetooth speakers", description: "Portable and home speakers" },
         { label: "Soundbars", search: "soundbar", description: "Soundbars for home entertainment" },
         { label: "Keyboards", search: "computer keyboard", description: "Wired and wireless keyboards" },
         { label: "Mice", search: "computer mouse", description: "Office and gaming mice" },
         { label: "Monitors", search: "computer monitor", description: "Work and gaming monitors" },
         { label: "Webcams", search: "webcam", description: "Webcams for work and streaming" },
         { label: "Microphones", search: "USB microphone", description: "USB and streaming microphones" },
      ],
   },
   accessories: {
      title: "Explore accessories",
      subtitle: "Find useful add-ons for phones, computers and everyday devices.",
      eyebrow: "ACCESSORIES",
      accent: "#F97316",
      choices: [
         { label: "Chargers", search: "mobile phone charger", description: "Wall and fast chargers" },
         { label: "Power banks", search: "power bank", description: "Portable charging" },
         { label: "Phone cases", search: "phone case", description: "Cases and protective covers" },
         { label: "Laptop bags", search: "laptop bag", description: "Bags and sleeves" },
         { label: "USB hubs", search: "USB-C hub", description: "Hubs and adapters" },
         { label: "Laptop stands", search: "laptop stand", description: "Stands and risers" },
         { label: "Screen protectors", search: "phone screen protector", description: "Protective glass and films" },
         { label: "Cables", search: "USB-C cable", description: "Charging and data cables" },
      ],
   },
   tablets: {
      title: "Choose your tablet brand",
      subtitle: "Select a manufacturer to compare tablet listings.",
      eyebrow: "TABLETS",
      accent: "#EF4444",
      choices: [
         { label: "Apple", search: "Apple iPad tablet", description: "iPad models and offers" },
         { label: "Samsung", search: "Samsung Galaxy Tab tablet", description: "Galaxy Tab offers" },
         { label: "Lenovo", search: "Lenovo tablet", description: "Lenovo tablet offers" },
         { label: "Xiaomi", search: "Xiaomi tablet", description: "Xiaomi tablet offers" },
         { label: "OnePlus", search: "OnePlus tablet", description: "OnePlus Pad offers" },
         { label: "Microsoft", search: "Microsoft Surface tablet", description: "Surface tablet offers" },
      ],
   },
   wearables: {
      title: "Explore wearables",
      subtitle: "Compare smartwatches, fitness trackers and wearable tech.",
      eyebrow: "WEARABLES",
      accent: "#A855F7",
      choices: [
         { label: "Apple Watch", search: "Apple Watch smartwatch", description: "Apple Watch models" },
         { label: "Samsung Galaxy Watch", search: "Samsung Galaxy Watch", description: "Galaxy Watch models" },
         { label: "Garmin", search: "Garmin smartwatch", description: "Sports and fitness watches" },
         { label: "Fitbit", search: "Fitbit fitness tracker", description: "Fitness bands and trackers" },
         { label: "boAt", search: "boAt smartwatch", description: "boAt wearable offers" },
         { label: "Noise", search: "Noise smartwatch", description: "Noise wearable offers" },
         { label: "Amazfit", search: "Amazfit smartwatch", description: "Amazfit wearable offers" },
      ],
   },
   tvs: {
      title: "Choose your TV brand",
      subtitle: "Pick a manufacturer to explore televisions and displays.",
      eyebrow: "TVS & DISPLAYS",
      accent: "#EAB308",
      choices: [
         { label: "Samsung", search: "Samsung smart TV", description: "Samsung TV offers" },
         { label: "LG", search: "LG smart TV", description: "LG TV offers" },
         { label: "Sony", search: "Sony smart TV", description: "Sony TV offers" },
         { label: "TCL", search: "TCL smart TV", description: "TCL TV offers" },
         { label: "Xiaomi", search: "Xiaomi smart TV", description: "Xiaomi TV offers" },
         { label: "Hisense", search: "Hisense smart TV", description: "Hisense TV offers" },
      ],
   },
   gaming: {
      title: "Explore gaming",
      subtitle: "Choose a console or gaming accessory category to compare listings.",
      eyebrow: "GAMING",
      accent: "#9333EA",
      choices: [
         { label: "PlayStation", search: "PlayStation console", description: "Consoles and bundles" },
         { label: "Xbox", search: "Xbox console", description: "Xbox consoles and offers" },
         { label: "Nintendo Switch", search: "Nintendo Switch console", description: "Nintendo Switch offers" },
         { label: "Gaming laptops", search: "gaming laptop", description: "Laptops built for gaming" },
         { label: "Gaming keyboards", search: "gaming keyboard", description: "Mechanical and gaming keyboards" },
         { label: "Gaming mice", search: "gaming mouse", description: "Gaming mice and accessories" },
         { label: "Controllers", search: "gaming controller", description: "Controllers and gamepads" },
      ],
   },
   cameras: {
      title: "Choose your camera brand",
      subtitle: "Explore cameras and camera equipment by manufacturer.",
      eyebrow: "CAMERAS",
      accent: "#EC4899",
      choices: [
         { label: "Canon", search: "Canon digital camera", description: "Canon camera offers" },
         { label: "Nikon", search: "Nikon digital camera", description: "Nikon camera offers" },
         { label: "Sony", search: "Sony mirrorless camera", description: "Sony camera offers" },
         { label: "Fujifilm", search: "Fujifilm digital camera", description: "Fujifilm camera offers" },
         { label: "GoPro", search: "GoPro action camera", description: "Action cameras" },
         { label: "DJI", search: "DJI camera", description: "DJI cameras and imaging gear" },
      ],
   },
};


const popularMobileBrands = new Set([
   "Apple", "Samsung", "OnePlus", "Google Pixel", "Xiaomi", "Redmi",
   "Vivo", "OPPO", "Motorola", "realme", "Nothing", "iQOO",
]);

const categoryNames: Record<string, string> = {
   mobiles: "Mobiles",
   laptops: "Laptops",
   electronics: "Electronics",
   accessories: "Accessories",
   tablets: "Tablets",
   wearables: "Wearables",
   tvs: "TVs & Displays",
   gaming: "Gaming",
   cameras: "Cameras",
};

const navCategories = [
   { slug: "mobiles", label: "Mobiles", color: "#3B82F6", icon: "mobile" },
   { slug: "laptops", label: "Laptops", color: "#A855F7", icon: "laptop" },
   { slug: "electronics", label: "Electronics", color: "#22C55E", icon: "headphones" },
   { slug: "accessories", label: "Accessories", color: "#F97316", icon: "bag" },
   { slug: "tablets", label: "Tablets", color: "#EF4444", icon: "tablet" },
   { slug: "wearables", label: "Wearables", color: "#A855F7", icon: "watch" },
   { slug: "tvs", label: "TVs", color: "#EAB308", icon: "tv" },
   { slug: "gaming", label: "Gaming", color: "#D946EF", icon: "gamepad" },
   { slug: "cameras", label: "Cameras", color: "#EC4899", icon: "camera" },
   { slug: "home", label: "Home", color: "#F8FAFC", icon: "home" },
];

function NavIcon({ name, color }: { name: string; color: string }) {
   const common = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
   return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common} className="h-5 w-5 sm:h-[22px] sm:w-[22px]">
         {name === "mobile" && <><rect x="6.5" y="2.5" width="11" height="19" rx="2" /><path d="M10 5h4M11 18.5h2" /></>}
         {name === "laptop" && <><rect x="4" y="3" width="16" height="13" rx="1.5" /><path d="m2 20 2-4h16l2 4H2Z" /></>}
         {name === "headphones" && <><path d="M3 13v-2a9 9 0 0 1 18 0v2" /><rect x="3" y="12" width="4" height="8" rx="1.5" /><rect x="17" y="12" width="4" height="8" rx="1.5" /></>}
         {name === "bag" && <><path d="M4 8h16l1 13H3L4 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>}
         {name === "tablet" && <><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M10 5h4M11 18.5h2" /></>}
         {name === "watch" && <><path d="M9 2h6l1 4H8l1-4ZM8 18h8l-1 4H9l-1-4Z" /><rect x="6" y="6" width="12" height="12" rx="3" /></>}
         {name === "tv" && <><rect x="2.5" y="3.5" width="19" height="13" rx="1.5" /><path d="M9 21h6M12 16.5V21" /></>}
         {name === "gamepad" && <><path d="M6.5 8h11a4 4 0 0 1 3.8 5.2l-1 3.3a2.5 2.5 0 0 1-4.1 1.1l-2-1.7h-4.4l-2 1.7a2.5 2.5 0 0 1-4.1-1.1l-1-3.3A4 4 0 0 1 6.5 8Z" /><path d="M7 11v4M5 13h4M16.5 12h.01M18.5 14h.01" /></>}
         {name === "camera" && <><path d="M3 8h4l1.5-3h7L17 8h4v12H3V8Z" /><circle cx="12" cy="14" r="4" /></>}
         {name === "home" && <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>}
      </svg>
   );
}

function AppleMark() {
   return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M16.37 1.43c.1 1.14-.39 2.28-1.18 3.15-.79.9-2.1 1.6-3.37 1.51-.15-1.12.42-2.29 1.19-3.14.83-.91 2.25-1.56 3.36-1.52ZM20.54 17.02c-.58 1.32-.86 1.9-1.62 3.08-1.05 1.58-2.53 3.55-4.36 3.57-1.62.01-2.04-1.07-4.23-1.06-2.19.01-2.65 1.08-4.27 1.06-1.83-.02-3.24-1.79-4.28-3.37-2.9-4.37-3.22-9.5-1.41-12.22 1.27-1.91 3.28-3.04 5.17-3.04 1.92 0 3.14 1.05 4.72 1.05 1.55 0 2.49-1.05 4.71-1.05 1.67 0 3.45.91 4.72 2.5-4.14 2.27-3.47 8.16.85 9.48Z" transform="translate(1 0) scale(.91)" /></svg>;
}

function BrandMark({ label, accent, category }: { label: string; accent: string; category: string }) {
   const n = label.toLowerCase();
   const box = "grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/35";
   if (n.includes("apple")) return <span className={`${box} text-white`}><AppleMark /></span>;
   if (n === "samsung" || n === "samsung galaxy watch") return <span className={`${box} text-white`}><span className="max-w-[39px] overflow-hidden whitespace-nowrap rounded-full bg-[#142C70] px-1 py-1 text-[7px] font-black italic tracking-tight">SAMSUNG</span></span>;
   if (n === "oneplus") return <span className={`${box} border-red-500/20 text-red-500`}><span className="text-2xl font-black leading-none">1⁺</span></span>;
   if (n.includes("google pixel")) return <span className={`${box} text-3xl font-black`} style={{ backgroundImage: "conic-gradient(from 40deg, #4285F4 0 25%, #34A853 25% 47%, #FBBC05 47% 68%, #EA4335 68% 85%, #4285F4 85%)", backgroundClip: "text", color: "transparent", WebkitBackgroundClip: "text" }}>G</span>;
   if (n.includes("xiaomi") || n === "mi") return <span className={box}><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FF6900] text-lg font-black tracking-tighter text-white">mi</span></span>;
   if (n === "redmi") return <span className={`${box} text-[11px] font-extrabold tracking-tight text-[#FF3B45]`}><span className="max-w-full truncate">Redmi</span></span>;
   if (n === "vivo") return <span className={`${box} text-[12px] font-black italic tracking-tight text-[#2387FF]`}><span className="max-w-full truncate">vivo</span></span>;
   if (n === "oppo") return <span className={`${box} text-[11px] font-black tracking-tight text-[#28C76F]`}><span className="max-w-full truncate">oppo</span></span>;
   if (n === "motorola" || n.includes("motorola")) return <span className={`${box} text-xl font-black text-white`}><span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white">M</span></span>;
   if (n === "realme") return <span className={box}><span className="rounded-md bg-[#F7E000] px-1 py-1 text-[8px] font-black tracking-tight text-black">realme</span></span>;
   if (n === "nothing") return <span className={`${box} text-[10px] font-black tracking-[.12em] text-white`}>N···</span>;
   if (n === "iqoo") return <span className={`${box} text-[12px] font-black italic text-[#FFD400]`}>iQOO</span>;
   if (n === "hp") return <span className={`${box} rounded-full text-xl font-bold italic text-[#0096D6]`}><span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0096D6]">hp</span></span>;
   if (n === "dell") return <span className={`${box} text-[11px] font-black text-[#1687C9]`}>DELL</span>;
   if (n === "lenovo") return <span className={box}><span className="rounded bg-[#E2231A] px-1 py-1 text-[9px] font-black text-white">Lenovo</span></span>;
   if (n === "asus") return <span className={`${box} text-[11px] font-black italic text-white`}>ASUS</span>;
   if (n === "acer") return <span className={`${box} text-sm font-black italic text-[#83B81A]`}>acer</span>;
   if (n === "msi") return <span className={`${box} text-lg font-black italic text-[#E31837]`}>MSI</span>;
   if (n.includes("microsoft")) return <span className={`${box} grid-cols-2 gap-1 p-2`}><i className="h-3 w-3 bg-[#F25022]" /><i className="h-3 w-3 bg-[#7FBA00]" /><i className="h-3 w-3 bg-[#00A4EF]" /><i className="h-3 w-3 bg-[#FFB900]" /></span>;
   if (n === "lg") return <span className={`${box} text-base font-black text-[#E11B5A]`}>LG</span>;
   if (n === "sony") return <span className={`${box} text-[11px] font-black tracking-tight text-white`}>SONY</span>;
   if (n === "canon") return <span className={`${box} text-[11px] font-black text-[#D71920]`}>Canon</span>;
   if (n === "nikon") return <span className={`${box} bg-[#FFE100] text-base font-black italic text-black`}>Nikon</span>;
   if (n.includes("playstation")) return <span className={`${box} text-2xl font-black text-white`}>PS</span>;
   if (n === "xbox") return <span className={`${box} text-xl font-black text-[#107C10]`}>X</span>;
   if (n.includes("nintendo")) return <span className={`${box} text-[10px] font-black text-white`}>NINTENDO</span>;
   if (n === "garmin") return <span className={`${box} text-[9px] font-black italic text-[#00A4E4]`}>GARMIN</span>;
   if (n === "fitbit") return <span className={`${box} text-[11px] font-black text-[#00B0B9]`}>fitbit</span>;
   const productIcon = category === "electronics"
      ? (n.includes("head") ? "♬" : n.includes("ear") ? "◖" : n.includes("speaker") || n.includes("soundbar") ? "◖))" : n.includes("keyboard") ? "⌨" : n.includes("mouse") ? "⌁" : n.includes("monitor") ? "▣" : n.includes("microphone") ? "♩" : "⌁")
      : category === "accessories"
         ? (n.includes("charger") ? "ϟ" : n.includes("power") ? "▥" : n.includes("case") || n.includes("protector") ? "▯" : n.includes("bag") ? "▱" : n.includes("cable") || n.includes("hub") ? "⌁" : "＋")
         : category === "gaming" ? "✣" : category === "cameras" ? "◎" : category === "wearables" ? "◷" : category === "tvs" ? "▣" : category === "tablets" ? "▯" : "✦";
   return <span className={`${box} text-2xl font-semibold`} style={{ color: accent }}>{productIcon}</span>;
}

function MiniPhone({ tint }: { tint: string }) {
   return (
      <span className="relative flex h-[58px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-white/25 bg-gradient-to-br from-white/15 to-black p-1 shadow-lg" style={{ boxShadow: `0 0 22px ${tint}22` }}>
         <span className="relative h-full w-full overflow-hidden rounded-[6px]" style={{ background: `linear-gradient(150deg, ${tint}, #10131b 68%)` }}>
            <span className="absolute left-1 top-1 flex gap-0.5"><i className="h-1.5 w-1.5 rounded-full bg-black/80" /><i className="h-1.5 w-1.5 rounded-full bg-black/80" /></span>
            <span className="absolute bottom-1 left-1 right-1 h-5 rounded-t-md bg-white/10" />
         </span>
      </span>
   );
}

function CategoryContent() {
   const router = useRouter();
   const routeParams = useParams<{ category: string }>();
   const searchParams = useSearchParams();
   const slug = String(routeParams.category || "").toLowerCase();
   const definition = categoryDefinitions[slug];
   const countryFromUrl = searchParams.get("country") || "India";
   const [selectedCountry, setSelectedCountry] = useState(countryFromUrl);
   const city = searchParams.get("city") || "";
   const postcode = searchParams.get("postcode") || "";
   const state = searchParams.get("state") || "";
   const county = searchParams.get("county") || "";
   const [brandSearch, setBrandSearch] = useState("");
   const [activeQuickFilter, setActiveQuickFilter] = useState("All Brands");
   const [sortOrder, setSortOrder] = useState("popular");
   const [showAllBrands, setShowAllBrands] = useState(false);

   const openRoute = (category: string) => {
      if (category === "home") {
         router.push("/");
         return;
      }
      const params = new URLSearchParams({ country: selectedCountry });
      if (city) params.set("city", city);
      if (state) params.set("state", state);
      if (county) params.set("county", county);
      if (postcode) params.set("postcode", postcode);
      router.push(`/category/${category}?${params.toString()}`);
   };

   const handleBack = () => {
      if (typeof window !== "undefined" && window.history.length > 1) {
         router.back();
      } else {
         router.push("/");
      }
   };

   const startSearch = (choice: Choice) => {
      const params = new URLSearchParams({ q: choice.search, country: selectedCountry });
      for (const [key, value] of [["city", city], ["state", state], ["county", county], ["postcode", postcode]] as const) {
         if (value) params.set(key, value);
      }
      params.set("category", slug);
      params.set("brand", choice.label);
      router.push(`/results?${params.toString()}`);
   };

   const directSearch = (query: string, label: string) => {
      const clean = query.trim();
      if (!clean) return;
      const params = new URLSearchParams({ q: clean, country: selectedCountry, category: slug, brand: label });
      for (const [key, value] of [["city", city], ["state", state], ["county", county], ["postcode", postcode]] as const) {
         if (value) params.set(key, value);
      }
      router.push(`/results?${params.toString()}`);
   };

   const filteredChoices = useMemo(() => {
      if (!definition) return [];
      let choices = [...definition.choices];
      if (slug === "mobiles" && activeQuickFilter === "Popular") {
         choices = choices.filter((choice) => popularMobileBrands.has(choice.label));
      }
      if (brandSearch.trim()) {
         const term = brandSearch.toLowerCase().trim();
         choices = choices.filter((choice) => `${choice.label} ${choice.description} ${choice.search}`.toLowerCase().includes(term));
      }
      if (sortOrder === "az") choices.sort((a, b) => a.label.localeCompare(b.label));
      return choices;
   }, [definition, slug, activeQuickFilter, brandSearch, sortOrder]);

   if (!definition) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
            <div className="text-center">
               <h1 className="text-2xl font-semibold">Category not found</h1>
               <button onClick={() => router.push("/")} className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">Back home</button>
            </div>
         </main>
      );
   }

   const pageTitle = categoryNames[slug] || definition.eyebrow;
   const mobile = slug === "mobiles";
   const quickFilters = [
      { label: "All Brands", type: "all" },
      { label: "Popular", type: "popular" },
      { label: "5G Phones", type: "search", query: "5G smartphone" },
      { label: "Budget", type: "search", query: "budget smartphone" },
      { label: "Mid Range", type: "search", query: "mid range smartphone" },
      { label: "Flagship", type: "search", query: "flagship smartphone" },
   ];
   const trending = [
      { label: "iPhone series", sub: "Apple phones", query: "Apple iPhone", tint: "#7C5CFF" },
      { label: "Galaxy S series", sub: "Samsung flagship", query: "Samsung Galaxy S smartphone", tint: "#2D8CFF" },
      { label: "OnePlus series", sub: "OnePlus phones", query: "OnePlus smartphone", tint: "#F43F5E" },
      { label: "Redmi Note series", sub: "Value phones", query: "Redmi Note smartphone", tint: "#FF6900" },
      { label: "Pixel series", sub: "Google phones", query: "Google Pixel phone", tint: "#34A853" },
   ];
   const countryOptions = ["India", "United States", "United Kingdom", "Ireland", "Canada", "Australia", "Germany", "UAE"];

   return (
      <main className="relative min-h-screen overflow-x-hidden bg-[#05070B] pb-28 text-white">
         <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(25,71,130,0.19),transparent_45%),radial-gradient(ellipse_at_92%_22%,rgba(112,40,153,0.08),transparent_30%)]" />
         <div className="relative z-10 mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <header className="sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-white/[0.08] bg-[#05070B]/95 py-3 backdrop-blur-xl sm:gap-4 sm:py-4">
               <button type="button" onClick={handleBack} className="flex w-fit items-center gap-2 rounded-xl text-left text-sm text-white/70 transition hover:text-white" aria-label="Go back to previous page">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-lg">←</span>
                  <span className="hidden sm:inline">Back</span>
               </button>
               <button type="button" onClick={() => router.push("/")} className="flex items-center justify-center gap-2 justify-self-center" aria-label="SearchOnce home">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-base font-black text-black shadow-[0_0_24px_rgba(255,255,255,0.14)] sm:h-10 sm:w-10">S</span>
                  <span className="text-base font-semibold tracking-tight sm:text-2xl">SearchOnce</span>
               </button>
               <div className="flex items-center justify-self-end gap-1.5 sm:gap-2">
                  <label className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-[11px] text-white/80 sm:flex sm:gap-2 sm:px-3 sm:text-sm">
                     <span aria-hidden="true">🌍</span>
                     <select value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)} aria-label="Change country" className="max-w-[67px] cursor-pointer bg-transparent text-white outline-none sm:max-w-[120px]">
                        {countryOptions.map((country) => <option key={country} value={country} className="bg-[#0A0C11]">{country}</option>)}
                     </select>
                  </label>
                  <button type="button" onClick={() => router.push("/")} className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs text-white/75 transition hover:bg-white/[0.08] hover:text-white sm:px-3 sm:text-sm" aria-label="Go to homepage">
                     <span aria-hidden="true">⌂</span><span className="hidden sm:inline">Home</span>
                  </button>
               </div>
            </header>
            <div className="flex justify-end py-2 sm:hidden">
               <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80">
                  <span aria-hidden="true">🌍</span>
                  <select value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)} aria-label="Change country" className="max-w-[150px] cursor-pointer bg-transparent text-white outline-none">
                     {countryOptions.map((country) => <option key={country} value={country} className="bg-[#0A0C11]">{country}</option>)}
                  </select>
               </label>
            </div>

            <section className="relative mt-3 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-white/[0.035] via-white/[0.015] to-transparent p-3 sm:mt-4 sm:p-4 lg:p-5">
               <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: `${definition.accent}18` }} />
               <div className="relative flex items-center gap-4 sm:gap-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-black/40 shadow-[0_0_28px_rgba(59,130,246,0.10)] sm:h-12 sm:w-12" style={{ borderColor: `${definition.accent}70`, color: definition.accent }}>
                     <NavIcon name={slug === "mobiles" ? "mobile" : slug === "laptops" ? "laptop" : slug === "electronics" ? "headphones" : slug === "accessories" ? "bag" : slug === "tablets" ? "tablet" : slug === "wearables" ? "watch" : slug === "tvs" ? "tv" : slug === "gaming" ? "gamepad" : "camera"} color={definition.accent} />
                  </span>
                  <div className="min-w-0 flex-1">
                     <p className="text-[10px] font-semibold tracking-[0.22em] sm:text-xs" style={{ color: definition.accent }}>{definition.eyebrow}</p>
                     <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-3xl">{pageTitle}</h1>
                     <p className="mt-1.5 max-w-2xl text-xs leading-5 text-white/55 sm:mt-2 sm:text-sm">{definition.subtitle}</p>
                  </div>
                  {mobile && <div className="hidden h-20 w-28 shrink-0 items-center justify-center sm:flex sm:h-24 sm:w-32 lg:h-28 lg:w-40">
                     <span className="relative h-20 w-[42px] rotate-[-12deg] rounded-[13px] border border-white/30 bg-gradient-to-br from-[#7D68FF] via-[#211C42] to-black p-1 shadow-[0_0_32px_rgba(124,92,255,0.22)] sm:h-24 sm:w-[48px]">
                        <span className="relative block h-full w-full overflow-hidden rounded-[14px] bg-gradient-to-br from-[#7D68FF] via-[#253D75] to-[#0A0D18]"><span className="absolute left-2 top-2 grid grid-cols-2 gap-1"><i className="h-2.5 w-2.5 rounded-full border border-white/50 bg-black/60" /><i className="h-2.5 w-2.5 rounded-full border border-white/50 bg-black/60" /><i className="h-2.5 w-2.5 rounded-full border border-white/50 bg-black/60" /></span><span className="absolute inset-x-2 bottom-3 h-10 rounded-t-full bg-white/10 blur-sm" /></span>
                     </span>
                     <span className="relative -ml-3 mt-2 h-16 w-[38px] rotate-[10deg] rounded-[11px] border border-white/25 bg-gradient-to-br from-[#D950A5] via-[#29213D] to-black p-1 shadow-[0_0_30px_rgba(217,80,165,0.20)] sm:h-20 sm:w-[42px]"><span className="block h-full w-full rounded-[12px] bg-gradient-to-br from-[#D950A5] via-[#212443] to-[#090A12]"><span className="absolute left-2 top-2 flex gap-1"><i className="h-2.5 w-2.5 rounded-full border border-white/50 bg-black/60" /><i className="h-2.5 w-2.5 rounded-full border border-white/50 bg-black/60" /></span></span></span>
                  </div>}
               </div>
               <div className="relative mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-white/65 sm:mt-3 sm:gap-x-5 sm:text-xs">
                  <span className="inline-flex items-center gap-2"><span className="text-emerald-400">◇</span> Compare prices</span>
                  <span className="inline-flex items-center gap-2"><span className="text-sky-400">✦</span> Multiple stores</span>
                  <span className="inline-flex items-center gap-2"><span className="text-purple-400">▣</span> Current listings</span>
                  <span className="inline-flex items-center gap-2"><span className="text-amber-400">●</span> Available offers in {selectedCountry}</span>
                  {(city || postcode) && <span className="inline-flex items-center gap-2 text-white/45"><span>⌖</span>{[city, postcode ? `PIN ${postcode}` : ""].filter(Boolean).join(" · ")}</span>}
               </div>
            </section>

            <section className="mt-5 sm:mt-6">
               <form className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#11151D]/90 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.22)]" onSubmit={(event) => { event.preventDefault(); directSearch(brandSearch, brandSearch); }}>
                  <span className="pl-3 text-lg text-white/35" aria-hidden="true">⌕</span>
                  <input value={brandSearch} onChange={(event) => setBrandSearch(event.target.value)} placeholder={mobile ? "Search mobile brands (e.g. Apple, Samsung, OnePlus...)" : `Search ${pageTitle.toLowerCase()} brands or products...`} aria-label={`Search ${pageTitle}`} className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:h-11" />
                  <button type="submit" className="rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-white/90 sm:px-5 sm:text-sm">Search</button>
               </form>
            </section>

            {mobile && <section className="mt-4 flex flex-wrap items-center gap-2">
               {quickFilters.map((filter) => {
                  const active = (filter.type === "all" && activeQuickFilter === "All Brands") || (filter.type === "popular" && activeQuickFilter === "Popular");
                  return <button key={filter.label} type="button" onClick={() => {
                     if (filter.type === "all") { setActiveQuickFilter("All Brands"); setBrandSearch(""); return; }
                     if (filter.type === "popular") { setActiveQuickFilter("Popular"); return; }
                     if (filter.query) directSearch(filter.query, filter.label);
                  }} className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${active ? "border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_20px_rgba(59,130,246,0.10)]" : "border-white/10 bg-white/[0.035] text-white/70 hover:border-white/20 hover:text-white"}`}>
                     {filter.label}
                  </button>;
               })}
               <label className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/65">
                  <span aria-hidden="true">A↕Z</span>
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort brands" className="cursor-pointer bg-transparent outline-none"><option value="popular" className="bg-[#0A0C11]">Popular order</option><option value="az" className="bg-[#0A0C11]">A to Z</option></select>
               </label>
            </section>}

            <section className="mt-8 sm:mt-9">
               <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                     <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl"><span style={{ color: definition.accent }} aria-hidden="true">✦</span>{mobile ? (activeQuickFilter === "Popular" ? "Popular Brands" : "Explore Brands") : definition.title}</h2>
                     <p className="mt-1 text-xs text-white/45 sm:text-sm">{mobile ? "Choose a brand to compare available offers in your selected country." : definition.subtitle}</p>
                  </div>
                  {mobile && activeQuickFilter !== "Popular" && !brandSearch && <button type="button" onClick={() => setShowAllBrands((value) => !value)} className="text-xs font-medium text-sky-300 transition hover:text-sky-200">{showAllBrands ? "Show popular only ↑" : "See all brands →"}</button>}
               </div>

               {filteredChoices.length > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(mobile && !showAllBrands && activeQuickFilter !== "Popular" && !brandSearch ? filteredChoices.slice(0, 8) : filteredChoices).map((choice) => (
                     <button key={choice.label} type="button" onClick={() => startSearch(choice)} className="group relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/60 hover:bg-sky-500/[0.06] hover:shadow-[0_0_28px_rgba(59,130,246,0.09)] sm:p-4">
                        <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 opacity-0 transition group-hover:opacity-100" style={{ background: definition.accent }} />
                        <BrandMark label={choice.label} accent={definition.accent} category={slug} />
                        <span className="min-w-0 flex-1 self-center">
                           <span className="block truncate text-sm font-semibold text-white sm:text-[15px]">{choice.label}</span>
                           <span className="mt-1 block min-h-4 line-clamp-2 text-[11px] leading-4 text-white/45 sm:text-xs">{choice.description}</span>
                        </span>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.06] text-sm text-white/55 transition group-hover:border-sky-400/40 group-hover:bg-sky-500/15 group-hover:text-white" aria-hidden="true">›</span>
                     </button>
                  ))}
               </div> : <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center"><p className="font-medium">No matching options found</p><p className="mt-1 text-sm text-white/45">Try another brand or product name.</p><button type="button" onClick={() => { setBrandSearch(""); setActiveQuickFilter("All Brands"); }} className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black">Clear search</button></div>}
            </section>

            {mobile && !brandSearch && <section className="mt-9 pb-2">
               <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><span aria-hidden="true">✷</span> Trending series</h2><p className="mt-1 text-xs text-white/45 sm:text-sm">Explore popular phone families by brand.</p></div><span className="text-xs text-white/35">{selectedCountry}</span></div>
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {trending.map((item) => <button key={item.label} type="button" onClick={() => directSearch(item.query, item.label)} className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.05]">
                     <MiniPhone tint={item.tint} />
                     <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold sm:text-sm">{item.label}</span><span className="mt-1 block truncate text-[11px] text-white/45">{item.sub}</span><span className="mt-2 block text-[10px] font-medium text-sky-300">Explore series →</span></span>
                  </button>)}
               </div>
            </section>}
         </div>

         <nav aria-label="Product categories" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07080b]/95 px-1.5 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-[0_-10px_35px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="mx-auto flex max-w-[1500px] items-stretch justify-between gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
               {navCategories.map((item) => {
                  const isHome = item.slug === "home";
                  return <button key={item.slug} type="button" onClick={() => openRoute(item.slug)} aria-label={isHome ? "Go to homepage" : `Browse ${item.label}`} className={`group relative flex min-w-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-t-lg px-1.5 py-1.5 text-[10px] leading-tight transition sm:min-w-0 sm:py-2 sm:text-[11px] ${item.slug === slug ? "text-white" : "text-white/65 hover:text-white"}`}>
                     <NavIcon name={item.icon} color={item.slug === slug ? item.color : item.color} />
                     <span className="whitespace-nowrap">{item.label}</span>
                     <span className={`absolute bottom-0 h-0.5 w-5 rounded-full ${item.slug === slug ? "opacity-100" : "opacity-0 group-hover:opacity-80"}`} style={{ background: item.color }} />
                  </button>;
               })}
            </div>
         </nav>
      </main>
   );
}

export default function CategoryPage() {
   return <Suspense fallback={<main className="min-h-screen bg-[#05070B] p-8 text-white/60">Loading category…</main>}><CategoryContent /></Suspense>;
}
