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
  India: { code: "INR", symbol: "₹", googleLocation: "in" },
  "United States": { code: "USD", symbol: "$", googleLocation: "us" },
  "United Kingdom": { code: "GBP", symbol: "£", googleLocation: "uk" },
  Ireland: { code: "EUR", symbol: "€", googleLocation: "ie" },
  Canada: { code: "CAD", symbol: "C$", googleLocation: "ca" },
  Australia: { code: "AUD", symbol: "A$", googleLocation: "au" },
  Germany: { code: "EUR", symbol: "€", googleLocation: "de" },
  UAE: { code: "AED", symbol: "AED ", googleLocation: "ae" },
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

function isAccessoryListing(item: SerpShoppingResult): boolean {
  const listingText = normalizeText(`${item.title ?? ""} ${item.snippet ?? ""}`);
  return /\b(case|cover|screen protector|tempered glass|camera protector|lens protector|charger|charging cable|wall charger|phone holder|replacement screen|screen replacement|battery replacement|skin|sleeve|mount|adapter|power bank|phone stand|mobile holder|bumper case|wallet case|back cover|phone case|case cover|strap|lanyard|screen guard|protective glass)\b/i.test(
    listingText
  );
}

function isRentalOrBundleListing(item: SerpShoppingResult): boolean {
  const listingText = normalizeText(`${item.title ?? ""} ${item.snippet ?? ""}`);
  return /\b(on rent|for rent|rent|rental|renting|lease|hire|monthly rental|rental plan|rental service|bundle|combo|batch|wholesale|bulk lot|lot of|pack of|assorted pack|bulk order|subscription)\b/i.test(
    listingText
  );
}

function queryRequestsAccessories(query: string): boolean {
  return /\b(accessories|accessory|case|cover|screen protector|tempered glass|charger|charging cable|power bank|phone holder|skin|sleeve|mount|adapter|replacement screen|battery replacement)\b/i.test(
    query
  );
}

function queryRequestsRental(query: string): boolean {
  return /\b(rent|rental|lease|hire|subscription)\b/i.test(query);
}

function isLikelyWrongVariant(item: SerpShoppingResult, query: string): boolean {
  const title = item.title?.trim() ?? "";
  if (!title) return true;

  const normalizedQuery = normalizeText(query);
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

  const queryIdentity = getModelIdentity(query);
  if (!queryIdentity) {
    // Keep broad category and unrecognized product searches open.
    return false;
  }

  if (isAccessoryListing(item) && !queryRequestsAccessories(query)) return true;
  if (isRentalOrBundleListing(item) && !queryRequestsRental(query)) return true;

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const countryParam = searchParams.get("country") ?? "India";

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

    const apiUrl = new URL("https://serpapi.com/search.json");
    apiUrl.searchParams.set("engine", "google_shopping");
    apiUrl.searchParams.set("q", query);
    apiUrl.searchParams.set("gl", config.googleLocation);
    apiUrl.searchParams.set("hl", "en");
    apiUrl.searchParams.set("api_key", apiKey);

    const apiResponse = await fetch(apiUrl.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const payload = (await apiResponse.json()) as SerpApiResponse;

    if (!apiResponse.ok || payload.error) {
      // Do not expose the API key or full provider request URL to the client.
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

    // Keep listings with a title even when the provider omits the seller/source field.
    const titledResults = rawResults.filter((item) => Boolean(item.title?.trim()));
    const priceableResults = titledResults
      .map((item, index) => {
        const price = parsePrice(item);
        const store = item.source?.trim() || "Shopping seller";
        const product = item.title?.trim() || query;

        return {
          id: `shopping-${slugify(store)}-${slugify(item.product_id || product)}-${item.position ?? index + 1}`,
          store,
          product,
          image: item.thumbnail ?? "",
          price,
          currency: config.code,
          currencySymbol: config.symbol,
          rating: typeof item.rating === "number" ? item.rating : null,
          country,
          delivery: item.delivery?.trim() || "Delivery details not provided by listing",
          deliveryDays: getDeliveryDays(item.delivery),
          badge: null as string | null,
          productUrl: item.product_link ?? null,
          reviews: typeof item.reviews === "number" ? item.reviews : null,
          priceText: item.price ?? null,
          _raw: item,
        };
      })
      .filter((item) => item.price !== null);

    const matchingResults = priceableResults
      .filter((item) => !isLikelyWrongVariant(item._raw, query))
      .map(({ _raw: _unused, ...item }) => item)
      .sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));

    if (matchingResults.length > 0) {
      matchingResults[0].badge = "LOWEST LISTED PRICE";
    }

    let message: string | undefined;
    if (matchingResults.length === 0) {
      if (rawResults.length === 0) {
        message = "Google Shopping did not return listings for this search in the selected country. Try a shorter query or another country.";
      } else if (priceableResults.length === 0) {
        message = "Listings were found, but none included a readable price. Try another search or country.";
      } else if (priceableResults.length > 0) {
        message = "Listings were found, but none matched the requested model/variant with a price. Try a simpler query or check another country.";
      }
    }

    return NextResponse.json({
      success: true,
      source: "Google Shopping via SerpApi",
      query,
      country,
      currency: config.code,
      currencySymbol: config.symbol,
      resultCount: matchingResults.length,
      results: matchingResults,
      message,
      diagnostics: {
        providerResultCount: rawResults.length,
        titledResultCount: titledResults.length,
        pricedResultCount: priceableResults.length,
        matchedResultCount: matchingResults.length,
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
