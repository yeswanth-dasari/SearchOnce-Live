import { NextResponse } from "next/server";

type Country =

  | "India"

  | "United States"

  | "United Kingdom"

  | "Ireland"

  | "Canada"

  | "Australia"

  | "Germany"

  | "UAE";

type CountryConfig = {

  code: string;

  symbol: string;

  googleLocation: string;

  ebayMarketplace: string | null;

};

type SerpShoppingResult = {

  position?: number;

  product_id?: string;

  title?: string;

  source?: string;

  price?: string;

  extracted_price?: number;

  rating?: number;

  reviews?: number;

  delivery?: string;

  thumbnail?: string;

  product_link?: string;

  badge?: string;

  second_hand_condition?: string;

  snippet?: string;

  extensions?: string[];

  tagline?: string;

};

type SerpApiResponse = {

  error?: string;

  shopping_results?: SerpShoppingResult[];

  search_information?: {

    query_displayed?: string;

    shopping_results_state?: string;

  };

};

const countryConfig: Record<Country, CountryConfig> = {

  India: { code: "INR", symbol: "₹", googleLocation: "in", ebayMarketplace: null },

  "United States": { code: "USD", symbol: "$", googleLocation: "us", ebayMarketplace: "EBAY_US" },

  "United Kingdom": { code: "GBP", symbol: "£", googleLocation: "uk", ebayMarketplace: "EBAY_GB" },

  Ireland: { code: "EUR", symbol: "€", googleLocation: "ie", ebayMarketplace: "EBAY_IE" },

  Canada: { code: "CAD", symbol: "C$", googleLocation: "ca", ebayMarketplace: "EBAY_CA" },

  Australia: { code: "AUD", symbol: "A$", googleLocation: "au", ebayMarketplace: "EBAY_AU" },

  Germany: { code: "EUR", symbol: "€", googleLocation: "de", ebayMarketplace: "EBAY_DE" },

  UAE: { code: "AED", symbol: "AED ", googleLocation: "ae", ebayMarketplace: null },

};

const validCountries = Object.keys(countryConfig) as Country[];

function slugify(value: string) {

  return value

    .toLowerCase()

    .normalize("NFKD")

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-|-$/g, "")

    .slice(0, 90);

}

function safeProductUrl(value?: string): string | null {

  if (!value) return null;

  try {

    const parsed = new URL(value);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

    return parsed.toString();

  } catch {

    return null;

  }

}

function normalizeText(value: string): string {

  return value

    .toLowerCase()

    .normalize("NFKD")

    .replace(/[^a-z0-9]+/g, " ")

    .trim()

    .replace(/\s+/g, " ");

}

function getTokens(value: string): Set<string> {

  return new Set(normalizeText(value).split(" ").filter(Boolean));

}

function parsePrice(item: SerpShoppingResult): number | null {

  if (

    typeof item.extracted_price === "number" &&

    Number.isFinite(item.extracted_price) &&

    item.extracted_price >= 0

  ) {

    return item.extracted_price;

  }

  if (!item.price) return null;

  // This is a last-resort fallback. Prefer SerpApi's extracted_price whenever available.

  const match = item.price.match(/[0-9][0-9,.]*/);

  if (!match) return null;

  const parsed = Number(match[0].replace(/,/g, ""));

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;

}

function getDeliveryDays(delivery?: string): number {

  if (!delivery) return 0;

  const range = delivery.match(/(\d+)\s*(?:-|–|to)\s*(\d+)\s*days?/i);

  if (range) return Number(range[1]);

  const single = delivery.match(/(?:in|within|by)\s*(\d+)\s*days?/i);

  if (single) return Number(single[1]);

  return 0;

}

type ModelIdentity = {

  family: "iphone" | "samsung-galaxy" | "pixel" | "oneplus" | "redmi-note" | "macbook";

  model: string;

  suffix: string;

};

/**

 * Extract model identifiers only for product families with recognisable model naming.

 * This avoids applying a generic digit rule to storage sizes, years, and unrelated products.

 */

function getModelIdentity(value: string): ModelIdentity | null {

  let match: RegExpMatchArray | null;

  match = value.match(/\biphone\s*(\d{1,2})(e)?\b/i);

  if (match) {

    return { family: "iphone", model: match[1], suffix: (match[2] ?? "").toLowerCase() };

  }

  if (/\b(?:samsung|galaxy)\b/i.test(value)) {

    match = value.match(/\b([aszmf])\s*(\d{1,3})\s*(fe|ultra|plus|edge|lite|pro)?\b/i);

    if (match) {

      return {

        family: "samsung-galaxy",

        model: `${match[1].toLowerCase()}${match[2]}`,

        suffix: (match[3] ?? "").toLowerCase(),

      };

    }

  }

  match = value.match(/\b(?:google\s+)?pixel\s*(\d{1,2})(a)?\b/i);

  if (match) {

    return { family: "pixel", model: match[1], suffix: (match[2] ?? "").toLowerCase() };

  }

  match = value.match(/\boneplus\s*(\d{1,2})(r|t)?\b/i);

  if (match) {

    return { family: "oneplus", model: match[1], suffix: (match[2] ?? "").toLowerCase() };

  }

  match = value.match(/\bredmi\s+note\s*(\d{1,2})\b/i);

  if (match) {

    return { family: "redmi-note", model: match[1], suffix: "" };

  }

  match = value.match(/\bmacbook\b.*?\bm([1-9])\b/i);

  if (match) {

    return { family: "macbook", model: `m${match[1]}`, suffix: "" };

  }

  return null;

}

function familyIsMentioned(title: string, family: ModelIdentity["family"]): boolean {

  switch (family) {

    case "iphone":

      return /\biphone\b/i.test(title);

    case "samsung-galaxy":

      return /\b(?:samsung|galaxy)\b/i.test(title);

    case "pixel":

      return /\bpixel\b/i.test(title);

    case "oneplus":

      return /\boneplus\b/i.test(title);

    case "redmi-note":

      return /\bredmi\b.*\bnote\b/i.test(title);

    case "macbook":

      return /\bmacbook\b/i.test(title);

  }

}

function isSecondHandListing(item: SerpShoppingResult): boolean {

  const condition = normalizeText(item.second_hand_condition ?? "");

  const titleAndSnippet = normalizeText(`${item.title ?? ""} ${item.snippet ?? ""}`);

  const secondHandPhrases = [

    "used",

    "refurbished",

    "renewed",

    "pre owned",

    "preowned",

    "second hand",

    "open box",

  ];

  return secondHandPhrases.some(

    (phrase) => condition.includes(phrase) || titleAndSnippet.includes(phrase)

  );

}

function isAccessoryListing(item: SerpShoppingResult, query: string): boolean {

  const rawTitle = item.title ?? "";

  const listingTitle = normalizeText(rawTitle);

  const listingSource = normalizeText(item.source ?? "");

  const normalizedQuery = normalizeText(query);

  const accessoryPattern =

    /\b(?:accessor(?:y|ies)|cases?|covers?|screen protectors?|tempered glass|camera protectors?|lens protectors?|chargers?|charging cables?|usb cables?|wall chargers?|wireless chargers?|phone holders?|replacement screens?|screen replacements?|lcd\s*(?:screen|display|assembly|replacement|panel|flex)|oled\s*(?:screen|assembly|replacement|panel|flex)|(?:screen|display)\s*(?:assembly|replacement|flex|panel)|touch\s*screen|touchscreen|digitizer|display\s*panel|battery replacements?|battery packs?|skins?|sleeves?|mounts?|adapters?|power banks?|phone stands?|mobile holders?|bumpers?|wallet cases?|back covers?|phone cases?|straps?|lanyards?|screen guards?|protective glass|kickstands?|pop sockets?|car mounts?|car holders?|phone rings?|lens glass|charging ports?|sim trays?|volume buttons?|camera modules?|speaker replacements?|vibration motors?|rear glass|front glass|glass replacements?|parts?|replacement parts?|spare parts?|repair kits?|repair tools?|housing|frames?|flex cables?|screen assemblies?|display assemblies?|digitizers?|dock connectors?|logic boards?|motherboards?|earpieces?|loudspeakers?|adhesive strips?|repair services?|laptop bags?|computer bags?|backpacks?|cooling pads?|keyboards?|computer mice|mice|monitors?|external displays?|docking stations?|docks?|styluses?|apple pencils?|earbuds?|headphones?|headsets?|webcams?|game controllers?|carrying cases?)\b/i;

  // Some accessory listings use product-line names instead of the word "case",

  // and international listings may describe camera glass/lenses in another language.

  const translatedAccessoryPattern =

    /\b(?:lenti vetro|macchina fotografica|lente fotocamera|lenti fotocamera|fotocamera posteriore|vetro fotocamera|camera lens kit|rear camera glass|lens glass set|per iphone|per samsung|per galaxy|per ipad|for iphone|for samsung|for galaxy|for ipad|compatible with|designed for)\b/i;

  const accessoryFirstBrandPattern =

    /\b(?:rhinoshield|rhino shield|spigen|otterbox|mous|uag|urban armor gear|pitaka|dbrand|zagg|supcase)\b/i;

  const knownAccessoryLinePattern = /\b(?:solidx|mod nx|crashguard)\b/i;

  const deviceQuery =

    /\b(?:iphone|ipad|samsung|galaxy|pixel|oneplus|redmi|macbook|smartphone|mobile phone|laptop|tablet)\b/i.test(

      normalizedQuery

    );

  const explicitAccessoryQuery =

    queryRequestsAccessories(query) ||

    accessoryFirstBrandPattern.test(normalizedQuery) ||

    knownAccessoryLinePattern.test(normalizedQuery);

  if (accessoryPattern.test(listingTitle)) return true;

  if (translatedAccessoryPattern.test(listingTitle)) return true;

  // When users search for a device rather than its accessories, suppress

  // accessory-focused retailers/product lines that omit words like "case".

  if (!explicitAccessoryQuery && deviceQuery) {

    if (accessoryFirstBrandPattern.test(listingSource) ||

        accessoryFirstBrandPattern.test(listingTitle) ||

        knownAccessoryLinePattern.test(listingTitle)) {

      return true;

    }

  }

  return false;

}

function isRentalOrBundleListing(item: SerpShoppingResult): boolean {

  const listingTitle = normalizeText(item.title ?? "");

  return /\b(on rent|for rent|rent|rental|renting|lease|hire|monthly rental|rental plan|rental service|bundles?|combos?|batch|wholesale|bulk lot|lot of|packs? of|assorted pack|bulk order|subscription)\b/i.test(

    listingTitle

  );

}

function queryRequestsAccessories(query: string): boolean {

  return /\b(accessor(?:y|ies)|cases?|covers?|screen protectors?|tempered glass|chargers?|charging cables?|usb cables?|power banks?|phone holders?|skins?|sleeves?|mounts?|adapters?|replacement screens?|battery replacements?|batteries|parts?|spare parts?|replacement parts?|repair kits?|repair tools?|camera protectors?|lens protectors?|camera lenses?|lens glass|rear camera glass|lenti vetro|macchina fotografica|lente fotocamera|lenti fotocamera|bumpers?|charging ports?|sim trays?|screen guards?|display assemblies?|digitizers?|phone stands?|straps?|lanyards?|laptop bags?|computer bags?|backpacks?|cooling pads?|keyboards?|computer mice|mice|monitors?|external displays?|docking stations?|docks?|styluses?|apple pencils?|earbuds?|headphones?|headsets?|webcams?|game controllers?|carrying cases?|solidx|mod nx|crashguard|rhinoshield|rhino shield|spigen|otterbox|mous|uag|pitaka|dbrand|zagg|supcase)\b/i.test(

    query

  );

}

function queryRequestsRental(query: string): boolean {

  return /\b(rent|rental|lease|hire|subscription)\b/i.test(query);

}

function queryRequestsBundle(query: string): boolean {

  return /\b(bundle|bundles|combo|combos|batch|wholesale|bulk|lot|lots|pack|packs|assorted)\b/i.test(

    query

  );

}

/**

 * Product titles sometimes contain a phone model name while the actual item is

 * a case, skin, lens kit, or replacement part. Shopping APIs do not consistently

 * return a usable category field, so for phone/tablet searches we also require

 * a positive handset/device signal (storage, unlocked/SIM details, or explicit

 * device wording) unless the user specifically searched for an accessory.

 *

 * This is intentionally conservative: sparse titles without device specs may be

 * excluded rather than presenting an accessory as a phone.

 */

function isPhoneOrTabletQuery(query: string): boolean {

  const normalized = normalizeText(query);

  const identity = getModelIdentity(query);

  if (

    identity &&

    ["iphone", "samsung-galaxy", "pixel", "oneplus", "redmi-note"].includes(identity.family)

  ) {

    return true;

  }

  return /\b(?:iphone\d*|ipad|pixel(?:\s+\d{1,2})?|oneplus(?:\s+\d{1,2})?|redmi(?:\s+note)?(?:\s+\d{1,2})?|smartphone|mobile phone|cell phone|handset|galaxy\s+[aszmf]\s*\d{1,3})\b/i.test(

    normalized

  );

}

function hasHandsetEvidence(item: SerpShoppingResult): boolean {

  const evidenceText = normalizeText(

    [

      item.title ?? "",

      item.snippet ?? "",

      item.tagline ?? "",

      ...(item.extensions ?? []),

      item.second_hand_condition ?? "",

    ].join(" ")

  );

  // Strong product signals commonly present on actual phone/device listings.

  // We intentionally do not count colour, slogans, "5G", or the model name alone.

  return /\b(?:\d{2,4}\s?(?:gb|tb)|\d(?:\.\d)?\s?tb|unlocked|factory unlocked|sim free|dual sim|esim|nano sim|smartphone|mobile phone|cell phone|handset|imei|battery health|internal storage|storage capacity|wi fi\s?(?:only|cellular)|wi fi cellular|cellular version|with sim|sim card)\b/i.test(

    evidenceText

  );

}

function isLikelyAccessoryOnlyTitleForDeviceSearch(

  item: SerpShoppingResult,

  query: string

): boolean {

  if (!isPhoneOrTabletQuery(query)) return false;

  // When the user explicitly asks for accessories/parts, do not apply the

  // handset-only signal rule.

  if (queryRequestsAccessories(query)) return false;

  return !hasHandsetEvidence(item);

}
type StrictVariantAttributes = {
  storage: number | null;
  ram: number | null;
  color: string | null;
};

function extractStrictVariantAttributes(
  value: string
): StrictVariantAttributes {
  const normalized = normalizeText(value);

  // Extract RAM separately so it is not confused with storage.
  const ramMatch = normalized.match(
    /\b(\d{1,3})\s*gb\s*ram\b|\bram\s*[:\-]?\s*(\d{1,3})\s*gb\b/
  );

  const ram = ramMatch
    ? Number(ramMatch[1] ?? ramMatch[2])
    : null;

  const withoutRam = normalized
    .replace(/\b\d{1,3}\s*gb\s*ram\b/g, " ")
    .replace(/\bram\s*[:\-]?\s*\d{1,3}\s*gb\b/g, " ");

  const storageMatch = withoutRam.match(
    /\b(\d{1,4})\s*(tb|gb)\b/
  );

  const storage = storageMatch
    ? Number(storageMatch[1]) *
      (storageMatch[2] === "tb" ? 1024 : 1)
    : null;

  const colors = [
    "natural titanium",
    "desert titanium",
    "black titanium",
    "white titanium",
    "space black",
    "space gray",
    "space grey",
    "starlight",
    "midnight",
    "black",
    "white",
    "silver",
    "gold",
    "gray",
    "grey",
    "blue",
    "green",
    "red",
    "pink",
    "purple",
    "yellow",
    "orange",
    "brown",
  ];

  const color =
    colors.find((candidate) =>
      new RegExp(`\\b${candidate}\\b`).test(normalized)
    ) ?? null;

  return { storage, ram, color };
}

function hasStrictVariantMismatch(
  item: SerpShoppingResult,
  query: string
): boolean {
  const requested = extractStrictVariantAttributes(query);

  const listingText = [
    item.title ?? "",
    item.snippet ?? "",
    item.tagline ?? "",
    ...(item.extensions ?? []),
  ].join(" ");

  const actual = extractStrictVariantAttributes(listingText);

  if (
    requested.storage !== null &&
    requested.storage !== actual.storage
  ) {
    return true;
  }

  if (
    requested.ram !== null &&
    requested.ram !== actual.ram
  ) {
    return true;
  }

  if (
    requested.color !== null &&
    requested.color !== actual.color
  ) {
    return true;
  }

  return false;
}

function isLikelyWrongVariant(item: SerpShoppingResult, query: string): boolean {

  const title = item.title?.trim() ?? "";

  if (!title) return true;

  const normalizedQuery = normalizeText(query);

  if (hasStrictVariantMismatch(item, query)) return true;

  const queryTokens = getTokens(query);

  const titleTokens = getTokens(title);

  const queryWantsSecondHand = [

    "used",

    "refurbished",

    "renewed",

    "preowned",

    "pre-owned",

    "second hand",

    "open box",

  ].some((term) => normalizedQuery.includes(normalizeText(term)));

  if (isSecondHandListing(item) && !queryWantsSecondHand) return true;

  // Apply accessory and rental/bundle filtering for every query, including

  // broad searches such as "iPhone", "laptop", or unrecognized model families.

  // Explicit searches for cases, parts, rentals, or bundles are allowed through.

  if (isAccessoryListing(item, query) && !queryRequestsAccessories(query)) return true;

  if (

    isRentalOrBundleListing(item) &&

    !queryRequestsRental(query) &&

    !queryRequestsBundle(query)

  ) {

    return true;

  }

  // Suppress ambiguous phone/tablet listings whose titles contain the model

  // name but provide no evidence that the listing is the actual device.

  if (isLikelyAccessoryOnlyTitleForDeviceSearch(item, query)) return true;

  const queryIdentity = getModelIdentity(query);

  if (!queryIdentity) {

    // Keep broad category and unrecognized product searches open after filtering

    // clear accessory and rental/bundle listings.

    return false;

  }

  const normalizedTitle = normalizeText(title);

  // Reject mixed-device promotions (e.g. "Android + iPhone 17 September Batch")

  // when the user searched for one exact Apple phone model.

  if (

    queryIdentity.family === "iphone" &&

    /\bandroid\b/.test(normalizedTitle) &&

    /\biphone\b/.test(normalizedTitle)

  ) {

    return true;

  }

  // A recognized model search must return the same product family and model.

  if (!familyIsMentioned(title, queryIdentity.family)) return true;

  const titleIdentity = getModelIdentity(title);

  // If the title doesn't expose a parseable model identity, don't pass it off as

  // an exact match for a specific model query.

  if (!titleIdentity) return true;

  if (

    titleIdentity.family !== queryIdentity.family ||

    titleIdentity.model !== queryIdentity.model ||

    titleIdentity.suffix !== queryIdentity.suffix

  ) {

    return true;

  }

  // Reject malformed/ambiguous iPhone titles that repeat the main model number,

  // e.g. "iPhone 17 Pro Max 17 ///" which may be an accessory listing with a poor title.

  if (queryIdentity.family === "iphone") {

    const modelNumber = queryIdentity.model;

    const numberPattern = new RegExp(`\\b${modelNumber}\\b`, "g");

    const queryNumberCount = (query.match(numberPattern) ?? []).length;

    const titleNumberCount = (title.match(numberPattern) ?? []).length;

    if (titleNumberCount > queryNumberCount) return true;

  }

  // Require modifiers such as Pro, Max, FE, Ultra, and Mini to match both ways.

  // The model suffix above additionally catches joined labels such as "S25FE".

  const variantTokens = [

    "plus",

    "pro",

    "max",

    "ultra",

    "mini",

    "lite",

    "fold",

    "flip",

    "fe",

    "se",

    "air",

    "xl",

  ];

  for (const variant of variantTokens) {

    const queryHasVariant = queryTokens.has(variant);

    const titleHasVariant = titleTokens.has(variant);

    if (queryHasVariant !== titleHasVariant) return true;

  }

  return false;

}

type EbayMoney = {

  value?: string;

  currency?: string;

};

type EbayShippingOption = {

  shippingCost?: EbayMoney;

  minEstimatedDeliveryDate?: string;

  maxEstimatedDeliveryDate?: string;

};

type EbayItemSummary = {

  itemId?: string;

  title?: string;

  shortDescription?: string;

  price?: EbayMoney;

  image?: { imageUrl?: string };

  additionalImages?: Array<{ imageUrl?: string }>;

  itemWebUrl?: string;

  condition?: string;

  seller?: { username?: string };

  itemLocation?: { country?: string };

  shippingOptions?: EbayShippingOption[];

};

type EbaySearchResponse = {

  total?: number;

  itemSummaries?: EbayItemSummary[];

  errors?: Array<{ errorId?: number; message?: string; longMessage?: string }>;

};

type EbayProviderResult = {

  results: Array<{

    id: string;

    store: string;

    product: string;

    image: string;

    price: number;

    currency: string;

    currencySymbol: string;

    rating: number | null;

    country: Country;

    delivery: string;

    deliveryDays: number;

    badge: string | null;

    productUrl: string | null;

    reviews: number | null;

    priceText: string;

    condition: string | null;

    provider: "eBay Browse API";

    shippingCost: number | null;

    shippingStatus: "known" | "unknown";

    shippingText: string;

    totalPrice: number | null;

    totalPriceText: string | null;

    brand?: string | null;
    model?: string | null;
    color?: string | null;
    storage?: string | null;
    ram?: string | null;
    processor?: string | null;
    display?: string | null;
    battery?: string | null;
    camera?: string | null;
    operatingSystem?: string | null;
    connectivity?: string | null;
    resolution?: string | null;
    warranty?: string | null;
    description?: string | null;
    descriptionText?: string | null;

  }>;

  status: "success" | "unsupported-marketplace" | "not-configured" | "oauth-error" | "browse-error" | "no-matches";

  marketplace: string | null;

  total: number;

  message: string;

};

type EbayTokenResponse = {

  access_token?: string;

  error?: string;

  error_description?: string;

};

function formatMoney(amount: number, symbol: string): string {

  const formatted = new Intl.NumberFormat("en-US", {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  }).format(amount);

  return `${symbol}${formatted}`;

}

type ShippingInfo = {

  amount: number | null;

  status: "known" | "unknown";

  label: string;

};

function unknownShipping(label = "Shipping cost not confirmed"): ShippingInfo {

  return { amount: null, status: "unknown", label };

}

function knownShipping(amount: number, symbol: string): ShippingInfo {

  return {

    amount,

    status: "known",

    label: amount === 0 ? "Free shipping" : `Shipping cost: ${formatMoney(amount, symbol)}`,

  };

}

/**

 * Google Shopping often returns only a delivery phrase or date, not an amount.

 * Calculate a total only when the delivery text explicitly confirms free shipping

 * or includes a shipping amount with a currency that matches the selected market.

 */

function parseGoogleShipping(deliveryText: string | undefined, config: CountryConfig): ShippingInfo {

  const text = (deliveryText ?? "").trim();

  if (!text) return unknownShipping();

  if (/\bfree\b.{0,24}\b(?:shipping|delivery|postage)\b|\b(?:shipping|delivery|postage)\s+(?:is\s+)?free\b/i.test(text)) {

    return knownShipping(0, config.symbol);

  }

  const moneyPattern =

    /(CA\$|AU\$|C\$|A\$|₹|£|€|\$|AED)\s*([0-9][0-9,.]*[0-9]|[0-9])|([0-9][0-9,.]*[0-9]|[0-9])\s*(INR|USD|GBP|EUR|CAD|AUD|AED)\b/gi;

  for (const match of text.matchAll(moneyPattern)) {

    const index = match.index ?? 0;

    const matchEnd = index + match[0].length;

    const context = text.slice(Math.max(0, index - 32), Math.min(text.length, matchEnd + 32));

    const insideDeliveryField = Boolean(deliveryText && index < deliveryText.length);

    // If a separate descriptor is present, require the money amount to be linked

    // to shipping/delivery. The delivery field itself is already provider-labeled.

    if (

      !insideDeliveryField &&

      !/\b(?:shipping|ship|delivery|postage|freight|courier)\b/i.test(context)

    ) {

      continue;

    }

    let detectedCurrency: string | null = null;

    if (match[4]) {

      detectedCurrency = match[4].toUpperCase();

    } else {

      const marker = (match[1] ?? "").toUpperCase();

      if (marker === "₹") detectedCurrency = "INR";

      else if (marker === "£") detectedCurrency = "GBP";

      else if (marker === "€") detectedCurrency = "EUR";

      else if (marker === "CA$" || marker === "C$") detectedCurrency = "CAD";

      else if (marker === "AU$" || marker === "A$") detectedCurrency = "AUD";

      else if (marker === "AED") detectedCurrency = "AED";

      else if (marker === "$") detectedCurrency = config.code === "USD" ? "USD" : null;

    }

    if (detectedCurrency !== config.code) continue;

    const rawAmount = (match[2] ?? match[3] ?? "").replace(/\s/g, "");

    let normalizedAmount = rawAmount;

    if (rawAmount.includes(",") && rawAmount.includes(".")) {

      // The last separator is treated as the decimal separator.

      if (rawAmount.lastIndexOf(".") > rawAmount.lastIndexOf(",")) {

        normalizedAmount = rawAmount.replace(/,/g, "");

      } else {

        normalizedAmount = rawAmount.replace(/\./g, "").replace(",", ".");

      }

    } else if (rawAmount.includes(",")) {

      const lastGroupLength = rawAmount.length - rawAmount.lastIndexOf(",") - 1;

      normalizedAmount =

        lastGroupLength === 1 || lastGroupLength === 2

          ? rawAmount.slice(0, rawAmount.lastIndexOf(",")).replace(/,/g, "") +

            "." +

            rawAmount.slice(rawAmount.lastIndexOf(",") + 1)

          : rawAmount.replace(/,/g, "");

    }

    const amount = Number(normalizedAmount);

    if (Number.isFinite(amount) && amount >= 0) {

      return knownShipping(amount, config.symbol);

    }

  }

  return unknownShipping();

}

function getEbayShippingInfo(item: EbayItemSummary, config: CountryConfig): ShippingInfo {

  const option = item.shippingOptions?.find(

    (entry) =>

      entry.shippingCost?.value !== undefined &&

      entry.shippingCost.currency === config.code

  );

  if (!option?.shippingCost) return unknownShipping();

  const amount = Number(option.shippingCost.value);

  if (!Number.isFinite(amount) || amount < 0) return unknownShipping();

  return knownShipping(amount, config.symbol);

}

function formatEbayDate(value?: string): string | null {

  if (!value) return null;

  const datePart = value.slice(0, 10);

  const parsed = new Date(`${datePart}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return datePart;

  return new Intl.DateTimeFormat("en-GB", {

    day: "numeric",

    month: "short",

  }).format(parsed);

}

function getEbayDelivery(item: EbayItemSummary): string {

  const option = item.shippingOptions?.find(

    (entry) => entry.minEstimatedDeliveryDate || entry.maxEstimatedDeliveryDate

  );

  if (!option) return "Delivery estimate not provided by listing";

  const min = formatEbayDate(option.minEstimatedDeliveryDate);

  const max = formatEbayDate(option.maxEstimatedDeliveryDate);

  if (min && max) return min === max ? `Estimated delivery: ${min}` : `Estimated delivery: ${min}–${max}`;

  if (min) return `Estimated delivery from ${min}`;

  if (max) return `Estimated delivery by ${max}`;

  return "Delivery estimate not provided by listing";

}

function includeEbayListing(item: EbayItemSummary, query: string): boolean {

  const title = item.title?.trim() ?? "";

  if (!title) return false;

  const proxy: SerpShoppingResult = {

    title,

    source: item.seller?.username ?? "",

    snippet: item.shortDescription ?? "",

    second_hand_condition: item.condition ?? "",

  };

  // These filters apply even for broad queries such as "iphone".

  if (isAccessoryListing(proxy, query) && !queryRequestsAccessories(query)) return false;

  if (

    isRentalOrBundleListing(proxy) &&

    !queryRequestsRental(query) &&

    !queryRequestsBundle(query)

  ) {

    return false;

  }

  // Keep the project's existing exact-model and default used/refurbished policy.

  return !isLikelyWrongVariant(proxy, query);

}

async function searchEbay(

  query: string,

  country: Country,

  config: CountryConfig

): Promise<EbayProviderResult> {

  const marketplace = config.ebayMarketplace;

  if (!marketplace) {

    return {

      results: [],

      status: "unsupported-marketplace",

      marketplace: null,

      total: 0,

      message: `eBay Browse API does not have a supported local marketplace for ${country}. Google Shopping results remain available for this country.`,

    };

  }

  const clientId = process.env.EBAY_PRODUCTION_CLIENT_ID;

  const clientSecret = process.env.EBAY_PRODUCTION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {

    return {

      results: [],

      status: "not-configured",

      marketplace,

      total: 0,

      message: "eBay Production credentials are not configured. Google Shopping results remain available.",

    };

  }

  try {

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {

      method: "POST",

      headers: {

        Authorization: `Basic ${basicAuth}`,

        "Content-Type": "application/x-www-form-urlencoded",

      },

      body: new URLSearchParams({

        grant_type: "client_credentials",

        scope: "https://api.ebay.com/oauth/api_scope",

      }).toString(),

      cache: "no-store",

      signal: AbortSignal.timeout(15000),

    });

    const tokenPayload = (await tokenResponse.json().catch(() => ({}))) as EbayTokenResponse;

    if (!tokenResponse.ok || !tokenPayload.access_token) {

      console.error(

        "eBay Production OAuth failed:",

        tokenPayload.error_description ?? tokenPayload.error ?? `HTTP ${tokenResponse.status}`

      );

      return {

        results: [],

        status: "oauth-error",

        marketplace,

        total: 0,

        message: "eBay Production authentication failed. Google Shopping results are still shown; verify the Production credentials.",

      };

    }

    const searchUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");

    searchUrl.searchParams.set("q", query);

    searchUrl.searchParams.set("limit", "50");

    // SearchOnce is a price-comparison experience, so exclude auction/bid-only listings.

    searchUrl.searchParams.set("filter", "buyingOptions:{FIXED_PRICE}");

    const searchResponse = await fetch(searchUrl.toString(), {

      method: "GET",

      headers: {

        Authorization: `Bearer ${tokenPayload.access_token}`,

        "X-EBAY-C-MARKETPLACE-ID": marketplace,

        Accept: "application/json",

      },

      cache: "no-store",

      signal: AbortSignal.timeout(15000),

    });

    const searchPayload = (await searchResponse.json().catch(() => ({}))) as EbaySearchResponse;

    if (!searchResponse.ok) {

      const providerError = searchPayload.errors?.[0];

      console.error(

        "eBay Browse API failed:",

        providerError?.longMessage ?? providerError?.message ?? `HTTP ${searchResponse.status}`

      );

      return {

        results: [],

        status: "browse-error",

        marketplace,

        total: 0,

        message:

          searchResponse.status === 401 || searchResponse.status === 403

            ? `eBay Production Browse API is not authorized for ${marketplace}. Google Shopping results remain available.`

            : "eBay listings are temporarily unavailable. Google Shopping results remain available.",

      };

    }

    const providerItems = searchPayload.itemSummaries ?? [];

    const currencyMatchingItems = providerItems.filter(

      (item) =>

        item.price?.value !== undefined &&

        item.price.currency === config.code &&

        Number.isFinite(Number(item.price.value)) &&

        Number(item.price.value) >= 0

    );

    const results = currencyMatchingItems

      .filter((item) => includeEbayListing(item, query))

      .map((item, index) => {

        const price = Number(item.price!.value);

        const symbol = config.symbol;

        const shipping = getEbayShippingInfo(item, config);

        const totalPrice = shipping.amount === null ? null : price + shipping.amount;

        const productTitle = item.title?.trim() ?? "Untitled eBay listing";
        const productSpecs = extractProductSpecs(productTitle, [item.shortDescription]);

        return {

          id: item.itemId ?? `ebay-${marketplace.toLowerCase()}-${index + 1}`,

          store: item.seller?.username ? `eBay · ${item.seller.username}` : "eBay",

          product: productTitle,

          ...productSpecs,

          descriptionText: item.shortDescription?.trim() || productSpecs.description,

          image: item.image?.imageUrl ?? item.additionalImages?.[0]?.imageUrl ?? "",

          price,

          currency: config.code,

          currencySymbol: symbol,

          rating: null,

          country,

          delivery: getEbayDelivery(item),

          deliveryDays: 0,

          badge: null as string | null,

          productUrl: item.itemWebUrl ?? null,

          reviews: null,

          priceText: formatMoney(price, symbol),

          condition: item.condition ?? null,

          provider: "eBay Browse API" as const,

          shippingCost: shipping.amount,

          shippingStatus: shipping.status,

          shippingText: shipping.label,

          totalPrice,

          totalPriceText: totalPrice === null ? null : formatMoney(totalPrice, symbol),

        };

      });

    if (results.length === 0) {

      const message =

        providerItems.length === 0

          ? `eBay returned no listings for this search on ${marketplace}.`

          : currencyMatchingItems.length === 0

            ? `eBay returned listings, but none had prices in ${config.code}; those listings were omitted to avoid mislabeling currency.`

            : `eBay returned listings for ${marketplace}, but none passed SearchOnce's current model and accessory filters.`;

      return {

        results: [],

        status: "no-matches",

        marketplace,

        total: searchPayload.total ?? providerItems.length,

        message: `${message} Google Shopping results remain available.`,

      };

    }

    return {

      results,

      status: "success",

      marketplace,

      total: searchPayload.total ?? providerItems.length,

      message: `eBay Production returned ${results.length} relevant priced listings from ${marketplace}.`,

    };

  } catch (error) {

    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    console.error(

      "eBay Production search error:",

      isTimeout ? "Request timed out" : error instanceof Error ? error.message : "Unknown error"

    );

    return {

      results: [],

      status: "browse-error",

      marketplace,

      total: 0,

      message: isTimeout

        ? "eBay Production search timed out. Google Shopping results remain available."

        : "eBay Production search is temporarily unavailable. Google Shopping results remain available.",

    };

  }

}


type ExtractedProductSpecs = {
  brand: string | null;
  model: string | null;
  color: string | null;
  storage: string | null;
  ram: string | null;
  processor: string | null;
  display: string | null;
  battery: string | null;
  camera: string | null;
  operatingSystem: string | null;
  connectivity: string | null;
  resolution: string | null;
  warranty: string | null;
  description: string | null;
};

function extractProductSpecs(title: string, descriptionParts: Array<string | undefined | null> = []): ExtractedProductSpecs {
  const description = [...new Set(descriptionParts.map((part) => (part ?? "").trim()).filter(Boolean))].join(" · ");
  const source = `${title} ${description}`;
  const find = (pattern: RegExp) => source.match(pattern)?.[0]?.trim() ?? null;

  let brand: string | null = null;
  const brands = [
    "Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Redmi", "POCO", "Motorola",
    "Nothing", "Realme", "Oppo", "Vivo", "Sony", "LG", "HP", "Dell", "Lenovo",
    "ASUS", "Acer", "MSI", "Microsoft", "Huawei", "Honor", "JBL", "Bose", "Canon", "Nikon"
  ];
  brand = brands.find((name) => new RegExp("\\b" + name + "\\b", "i").test(title)) ?? null;

  const model = find(/\b(?:iPhone\s?\d{1,2}(?:\s?(?:Pro Max|Pro|Plus|Mini|e))?|Galaxy\s?[A-Z]?\s?\d{1,3}(?:\s?(?:FE|Ultra|Plus))?|Pixel\s?\d{1,2}(?:\s?Pro)?|OnePlus\s?\d{1,2}(?:\s?R)?|MacBook(?:\s+(?:Air|Pro))?(?:\s+M\d)?|ThinkPad\s+[A-Z0-9-]+|Surface\s+(?:Pro|Laptop)\s?\d*)\b/i);
  const storage = find(/\b(?:\d{1,4}\s?(?:GB|TB))(?:\s?(?:SSD|UFS|NVMe))?\b/i);
  const ram = find(/\b\d{1,3}\s?GB\s?(?:RAM|LPDDR[345X]?|DDR[3455X]*)\b/i) ??
    (/\b(?:RAM|memory)\s*[:\-]?\s*\d{1,3}\s?GB\b/i.test(source) ? find(/\b\d{1,3}\s?GB\b/i) : null);
  const processor = find(/\b(?:Intel\s+(?:Core\s+)?(?:i[3579]|Ultra\s+[579])(?:[- ][A-Z0-9]+)?|AMD\s+Ryzen\s+[3579](?:\s+\d{3,5}[A-Z]*)?|Apple\s+M[1-5](?:\s+(?:Pro|Max|Ultra))?|Snapdragon\s+[A-Z0-9 +]+|MediaTek\s+Dimensity\s+\d+|Exynos\s+\d+|Tensor\s+G\d+)\b/i);
  const display = find(/\b\d{1,2}(?:\.\d)?\s?(?:inch|inches|")\b/i);
  const battery = find(/\b\d{3,5}\s?mAh\b/i);
  const camera = find(/\b\d{1,3}\s?MP\b/i);
  const operatingSystem = find(/\b(?:Android\s?\d{1,2}|iOS\s?\d{1,2}|Windows\s?(?:11|10)|macOS|ChromeOS|Linux)\b/i);
  const connectivity = find(/\b(?:5G|4G LTE|Wi-?Fi\s?6E?|Bluetooth\s?[5-9](?:\.\d)?|NFC|Dual SIM|eSIM)\b/i);
  const resolution = find(/\b(?:4K|8K|Full HD|FHD|QHD|UHD|2K|1080p|1440p|2160p|3840\s?×\s?2160)\b/i);
  const color = find(/\b(?:Black|White|Silver|Gold|Gray|Grey|Blue|Green|Red|Pink|Purple|Yellow|Titanium|Midnight|Starlight|Graphite|Natural)\b/i);
  const warranty = find(/\b\d+\s?[- ]?year\s+warranty\b/i);

  return { brand, model, color, storage, ram, processor, display, battery, camera, operatingSystem, connectivity, resolution, warranty, description: description || null };
}



type ProductOffer = {
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
  image: string;
  provider: string;
};

type ProductGroup = {
  id: string;
  product: string;
  image: string;
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
  offers: ProductOffer[];
};

/**
 * Build conservative cross-store groups without removing individual offers.
 * When we cannot identify the variant confidently, only identical normalized
 * titles are grouped; missing specifications are never treated as a match.
 */
function buildProductGroups(
  results: Array<{
    id: string;
    store: string;
    product: string;
    image: string;
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
    provider: string;
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    storage?: string | null;
    ram?: string | null;
  }>,
  query: string
): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  for (const item of results) {
    const identity = getModelIdentity(item.product);
    const variant = extractStrictVariantAttributes(item.product);
    const brand = normalizeText(item.brand ?? "");
    const modelVariantTokens = ["plus", "pro", "max", "ultra", "mini", "lite", "fold", "flip", "fe", "se", "air", "xl"];
    const modelModifiers = modelVariantTokens.filter((token) => getTokens(item.product).has(token)).join("-");
    const model = identity
      ? `${identity.family}:${identity.model}:${identity.suffix}:${modelModifiers}`
      : normalizeText(item.model ?? "");
    const storageValue = variant.storage ?? (item.storage ? Number.parseFloat(item.storage) * (/tb/i.test(item.storage) ? 1024 : 1) : null);
    const ramValue = variant.ram ?? (item.ram ? Number.parseFloat(item.ram) : null);
    const storage = storageValue === null || !Number.isFinite(storageValue) ? null : String(storageValue);
    const ram = ramValue === null || !Number.isFinite(ramValue) ? null : String(ramValue);
    const color = variant.color ?? (item.color ? normalizeText(item.color) : null);
    const titleFallback = normalizeText(item.product)
      .replace(/\b(?:buy|online|best price|price|offer|offers|sale)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Require a stable model identity to group differently worded listings.
    // Otherwise, group only when the normalized titles are identical.
    const hasStableModel = Boolean(model);
    const key = hasStableModel
      ? [
          item.currency,
          brand || identity?.family || "unknown-brand",
          model,
          storage ?? "storage-unknown",
          ram ?? "ram-unknown",
          color ?? "color-unknown",
        ].join("|")
      : `${item.currency}|title:${titleFallback}`;

    const offer: ProductOffer = {
      id: item.id,
      store: item.store,
      product: item.product,
      price: item.price,
      currency: item.currency,
      currencySymbol: item.currencySymbol,
      priceText: item.priceText,
      productUrl: item.productUrl,
      shippingCost: item.shippingCost,
      shippingStatus: item.shippingStatus,
      shippingText: item.shippingText,
      totalPrice: item.totalPrice,
      totalPriceText: item.totalPriceText,
      delivery: item.delivery,
      image: item.image,
      provider: item.provider,
    };

    const existing = groups.get(key);
    if (existing) {
      existing.offers.push(offer);
      existing.offerCount = existing.offers.length;
      existing.stores = [...new Set(existing.offers.map((entry) => entry.store))];
      if (item.price < existing.lowestPrice) {
        existing.lowestPrice = item.price;
        existing.lowestPriceText = item.priceText;
      }
      if (!existing.image && item.image) existing.image = item.image;
      continue;
    }

    groups.set(key, {
      id: `group-${slugify(key)}`,
      product: item.product,
      image: item.image,
      brand: item.brand ?? null,
      model: item.model ?? (identity ? item.product.match(/\b(?:iPhone|Pixel|OnePlus|MacBook|Galaxy)\b.*$/i)?.[0] ?? null : null),
      color: item.color ?? color,
      storage: item.storage ?? storage,
      ram: item.ram ?? ram,
      currency: item.currency,
      currencySymbol: item.currencySymbol,
      lowestPrice: item.price,
      lowestPriceText: item.priceText,
      offerCount: 1,
      stores: [item.store],
      offers: [offer],
    });
  }

  return [...groups.values()].sort((a, b) => a.lowestPrice - b.lowestPrice);
}

export async function GET(request: Request) {

  try {

    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() ?? "";

    const countryParam = searchParams.get("country") ?? "India";

    const city = searchParams.get("city")?.trim() ?? "";

    const state = searchParams.get("state")?.trim() ?? "";

    const county = searchParams.get("county")?.trim() ?? "";

    const postcode = searchParams.get("postcode")?.trim() ?? "";

    if (!query) {

      return NextResponse.json(

        { success: false, error: "Search query is required." },

        { status: 400 }

      );

    }

    if (query.length > 200) {

      return NextResponse.json(

        { success: false, error: "Search query is too long." },

        { status: 400 }

      );

    }

    const country: Country = validCountries.includes(countryParam as Country)

      ? (countryParam as Country)

      : "India";

    // Preserve a normalized location context for provider integrations. The

    // current Google Shopping endpoint supports city/region targeting, while

    // postcode-specific delivery remains unverified unless the retailer supplies it.

    const locationContext = { city, state, county, postcode };

    void locationContext;

    const config = countryConfig[country];

    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {

      return NextResponse.json(

        {

          success: false,

          error: "SERPAPI_API_KEY is not configured on the server.",

        },

        { status: 500 }

      );

    }

    // Start both sources concurrently. eBay failures are non-fatal so Google

    // Shopping continues to work even if eBay is unavailable for a country.

    const ebayPromise = searchEbay(query, country, config);

    const apiUrl = new URL("https://serpapi.com/search.json");

    apiUrl.searchParams.set("engine", "google_shopping");

    apiUrl.searchParams.set("q", query);

    apiUrl.searchParams.set("gl", config.googleLocation);

    // Do not send the user's exact city/village through SerpApi's `location`

    // parameter: many small Indian localities are not supported and cause a

    // provider error. `gl` still targets the selected country. Keep the user's

    // location fields for UI/context, but never claim this gives postcode-level

    // delivery estimates; those require retailer-provided data.

    apiUrl.searchParams.set("hl", "en");

    apiUrl.searchParams.set("api_key", apiKey);

    const apiResponse = await fetch(apiUrl.toString(), {

      cache: "no-store",

      signal: AbortSignal.timeout(20000),

    });

    const payload = (await apiResponse.json().catch(() => ({}))) as SerpApiResponse;

    if (!apiResponse.ok || payload.error) {

      console.error("SerpApi request failed:", payload.error ?? apiResponse.statusText);

      return NextResponse.json(

        {

          success: false,

          error:

            apiResponse.status === 401 || apiResponse.status === 403

              ? "Shopping API authentication or access failed. Check the SerpApi key and account access."

              : apiResponse.status === 429

                ? "Shopping search limit reached. Check your SerpApi account quota."

                : "Shopping results are temporarily unavailable. Please try again.",

        },

        { status: apiResponse.status === 429 ? 429 : 502 }

      );

    }

    const rawResults = payload.shopping_results ?? [];

    const titledResults = rawResults.filter((item) => Boolean(item.title?.trim()));

    const priceableResults = titledResults

      .map((item, index) => {

        const price = parsePrice(item);

        if (price === null) return null;

        // Google Shopping can return a product ID even when it omits product_link.

        // In that case, send the user to Google's product-offers page rather than

        // showing a dead Buy button or inventing a retailer checkout URL.

        const googleProductUrl = item.product_id

          ? `https://www.google.com/shopping/product/${encodeURIComponent(item.product_id)}?gl=${encodeURIComponent(config.googleLocation)}`

          : null;

        const productUrl = safeProductUrl(item.product_link) ?? safeProductUrl(googleProductUrl ?? undefined);

        const store = item.source?.trim() || (productUrl ? "View offers on Google Shopping" : "Retailer not identified");

        const product = item.title?.trim() || query;

        const shippingInfoText = [

          item.delivery,

          ...(item.extensions ?? []),

          item.tagline,

        ].filter(Boolean).join(" ");

        const shipping = parseGoogleShipping(shippingInfoText, config);

        const totalPrice = shipping.amount === null ? null : price + shipping.amount;

        return {

          id: `shopping-${slugify(store)}-${slugify(item.product_id || product)}-${item.position ?? index + 1}`,

          store,

          product,

          ...extractProductSpecs(product, [item.snippet, item.tagline, ...(item.extensions ?? [])]),

          descriptionText: [item.snippet, item.tagline, ...(item.extensions ?? [])].filter(Boolean).join(" · ") || null,

          image: item.thumbnail ?? "",

          price,

          currency: config.code,

          currencySymbol: config.symbol,

          rating: typeof item.rating === "number" ? item.rating : null,

          country,

          delivery: item.delivery?.trim() || "Delivery estimate not provided by listing",

          deliveryDays: getDeliveryDays(item.delivery),

          badge: null as string | null,

          productUrl,

          reviews: typeof item.reviews === "number" ? item.reviews : null,

          priceText: formatMoney(price, config.symbol),

          provider: "Google Shopping via SerpApi" as const,

          shippingCost: shipping.amount,

          shippingStatus: shipping.status,

          shippingText: shipping.label,

          totalPrice,

          totalPriceText: totalPrice === null ? null : formatMoney(totalPrice, config.symbol),

          _raw: item,

        };

      })

      .filter((item): item is NonNullable<typeof item> => item !== null);

    const matchingGoogleResults = priceableResults

      .filter((item) => !isLikelyWrongVariant(item._raw, query))

      .map(({ _raw: _unused, ...item }) => item)

      .sort((a, b) => a.price - b.price);

    const ebayResult = await ebayPromise;

    // Only combine items from the same marketplace currency, preventing the

    // results page from comparing, e.g., USD prices against INR prices.

    const combinedResults = [...matchingGoogleResults, ...ebayResult.results];

    for (const result of combinedResults) {

      result.badge = null;

    }

    const knownTotalResults = combinedResults

      .filter((item) => item.totalPrice !== null)

      .sort((a, b) => (a.totalPrice ?? Number.MAX_SAFE_INTEGER) - (b.totalPrice ?? Number.MAX_SAFE_INTEGER));

    if (knownTotalResults.length > 0) {

      knownTotalResults[0].badge = "LOWEST KNOWN TOTAL";

    } else if (combinedResults.length > 0) {

      [...combinedResults].sort((a, b) => a.price - b.price)[0].badge = "LOWEST LISTED PRICE";

    }

    combinedResults.sort((a, b) => {

      if (a.totalPrice !== null && b.totalPrice !== null) return a.totalPrice - b.totalPrice;

      if (a.totalPrice !== null) return -1;

      if (b.totalPrice !== null) return 1;

      return a.price - b.price;

    });

    let message: string | undefined;

    if (combinedResults.length === 0) {

      if (rawResults.length === 0) {

        message = "Google Shopping and eBay returned no listings for this search in the selected country. Try a shorter query or another country.";

      } else if (priceableResults.length === 0) {

        message = "Listings were found, but none included a readable price. Try another search or country.";

      } else {

        message = "Listings were found, but none matched the requested model/variant with a price. Try a simpler query or another country.";

      }

    }

    const source =

      ebayResult.results.length > 0

        ? "Google Shopping via SerpApi + eBay Browse API"

        : "Google Shopping via SerpApi";

    return NextResponse.json({

      success: true,

      source,

      query,

      country,

      currency: config.code,

      currencySymbol: config.symbol,

      resultCount: combinedResults.length,

      results: combinedResults,

      productGroups: buildProductGroups(combinedResults, query),

      message,

      providers: {

        googleShopping: {

          status: "success",

          marketplace: country,

          providerResultCount: rawResults.length,

          matchedResultCount: matchingGoogleResults.length,

        },

        ebay: {

          status: ebayResult.status,

          marketplace: ebayResult.marketplace,

          providerResultCount: ebayResult.total,

          resultCount: ebayResult.results.length,

          message: ebayResult.message,

        },

      },

      diagnostics: {

        googleProviderResultCount: rawResults.length,

        googlePricedResultCount: priceableResults.length,

        googleMatchedResultCount: matchingGoogleResults.length,

        ebayProviderResultCount: ebayResult.total,

        ebayMatchedResultCount: ebayResult.results.length,

        offersWithConfirmedShipping: combinedResults.filter((item) => item.shippingStatus === "known").length,

        offersWithKnownTotal: combinedResults.filter((item) => item.totalPrice !== null).length,

      },

    });

  } catch (error) {

    console.error("Search API error:", error);

    return NextResponse.json(

      {

        success: false,

        error:

          error instanceof Error && error.name === "TimeoutError"

            ? "Shopping search timed out. Please try again."

            : "Something went wrong while searching shopping listings.",

      },

      { status: 500 }

    );

  }

}
