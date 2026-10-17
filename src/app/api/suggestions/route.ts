
import { NextResponse } from "next/server";

const countryCodes: Record<string, string> = {
  India: "in",
  "United States": "us",
  "United Kingdom": "uk",
  Ireland: "ie",
  Canada: "ca",
  Australia: "au",
  Germany: "de",
  UAE: "ae",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    const country = searchParams.get("country") || "India";

    if (q.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    if (q.length > 100) {
      return NextResponse.json(
        { success: false, error: "Search query is too long." },
        { status: 400 }
      );
    }

    const gl = countryCodes[country];

    if (!gl) {
      return NextResponse.json(
        { success: false, error: "Unsupported country." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Search API key is not configured." },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      engine: "google_autocomplete",
      q,
      gl,
      hl: "en",
      api_key: apiKey,
    });

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error("Suggestions provider returned status:", response.status);

      return NextResponse.json(
        { success: false, error: "Suggestions are temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = await response.json();

    const suggestions: string[] = Array.isArray(data.suggestions)
      ? data.suggestions
          .map((item: { value?: unknown }) => item.value)
          .filter(
            (value: unknown): value is string =>
              typeof value === "string" && value.trim().length > 0
          )
          .slice(0, 8)
      : [];

    return NextResponse.json({
      success: true,
      query: q,
      country,
      suggestions,
    });
  } catch (error) {
    console.error("Suggestions API error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load suggestions right now." },
      { status: 500 }
    );
  }
}
