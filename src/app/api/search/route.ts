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
};

type SerpApiResponse = {
  error?: string;
  shopping_results?: SerpShoppingResult[];
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

function parsePrice(item: SerpShoppingResult): number | null {
  if (
    typeof item.extracted_price === "number" &&
    Number.isFinite(item.extracted_price) &&
    item.extracted_price >= 0
  ) {
    return item.extracted_price;
  }

  if (!item.price) return null;

  // Fallback for responses where SerpApi has a formatted price but no numeric field.
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

function isLikelyWrongVariant(title: string, query: string): boolean {
  // Avoid mixing common model variants (e.g. iPhone 16 Plus/Pro Max) into a
  // numbered model search, while leaving broad searches such as "iPhone" open.
  if (!/\d/.test(query)) return false;

  const normalizedTitle = ` ${title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const normalizedQuery = ` ${query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const variants = ["plus", "pro", "max", "ultra", "mini", "lite", "fold", "flip", "refurbished", "renewed", "used"];

  if (variants.some((variant) => normalizedTitle.includes(` ${variant} `) && !normalizedQuery.includes(` ${variant} `))) {
    return true;
  }

  // A common suffix-model case: iPhone 16e should not be mixed into iPhone 16.
  if (/iphone\s*16e/i.test(title) && !/iphone\s*16e/i.test(query)) {
    return true;
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

    const parsedResults = rawResults
      .filter((item) => Boolean(item.title?.trim()) && Boolean(item.source?.trim()))
      .filter((item) => !isLikelyWrongVariant(item.title ?? "", query))
      .map((item, index) => {
        const price = parsePrice(item);
        const store = item.source?.trim() || "Shopping result";
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
          // No made-up promotional badge: only mark the lowest listed price below.
          badge: null as string | null,
          productUrl: item.product_link ?? null,
          reviews: typeof item.reviews === "number" ? item.reviews : null,
          priceText: item.price ?? null,
        };
      })
      .filter((item) => item.price !== null)
      .sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));

    if (parsedResults.length > 0) {
      parsedResults[0].badge = "LOWEST LISTED PRICE";
    }

    return NextResponse.json({
      success: true,
      source: "Google Shopping via SerpApi",
      query,
      country,
      currency: config.code,
      currencySymbol: config.symbol,
      resultCount: parsedResults.length,
      results: parsedResults,
      message:
        parsedResults.length === 0
          ? "No priced shopping listings were returned for this search. Try a more specific or different query."
          : undefined,
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
