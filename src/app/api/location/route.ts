import { NextRequest, NextResponse } from "next/server";

type GeoapifyProperties = {
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  district?: string;
  postcode?: string;
  formatted?: string;
  lat?: number;
  lon?: number;
};

type GeoapifyFeature = GeoapifyProperties & {
  properties?: GeoapifyProperties;
  geometry?: {
    coordinates?: number[];
  };
};

type GeoapifyResponse = {
  features?: GeoapifyFeature[];
  results?: GeoapifyFeature[];
};

function formatLocation(feature: GeoapifyFeature) {
  const p = feature.properties ?? feature;
  const coordinates = feature.geometry?.coordinates ?? [];

  return {
    city:
      p.city ??
      p.town ??
      p.village ??
      p.municipality ??
      p.suburb ??
      p.district ??
      "",
    state: p.state ?? p.county ?? "",
    country: p.country ?? "",
    countryCode: p.country_code?.toUpperCase() ?? "",
    postalCode: p.postcode ?? "",
    formattedAddress: p.formatted ?? "",
    latitude: p.lat ?? coordinates[1] ?? null,
    longitude: p.lon ?? coordinates[0] ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geoapify API key is missing. Check the .env.local file and restart the development server.",
        },
        { status: 500 }
      );
    }

    const params = request.nextUrl.searchParams;

    const latText = params.get("lat");
    const lonText = params.get("lon");
    const postcode = params.get("postcode")?.trim();
    const countryCode = params.get("countryCode")?.trim().toLowerCase();

    const hasCoordinates = latText !== null || lonText !== null;

    let apiUrl: URL;
    let source: "coordinates" | "postcode";

    // Option 1: Convert latitude/longitude to an address.
    if (hasCoordinates) {
      if (latText === null || lonText === null) {
        return NextResponse.json(
          {
            success: false,
            error: "Provide both latitude (lat) and longitude (lon).",
          },
          { status: 400 }
        );
      }

      const lat = Number(latText);
      const lon = Number(lonText);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Latitude or longitude is invalid.",
          },
          { status: 400 }
        );
      }

      apiUrl = new URL("https://api.geoapify.com/v1/geocode/reverse");
      apiUrl.searchParams.set("lat", String(lat));
      apiUrl.searchParams.set("lon", String(lon));
      apiUrl.searchParams.set("limit", "1");
      apiUrl.searchParams.set("type", "city");
      source = "coordinates";
    } else if (postcode) {
      // Option 2: Look up a postal code.
      if (postcode.length > 32) {
        return NextResponse.json(
          {
            success: false,
            error: "Postal code is too long.",
          },
          { status: 400 }
        );
      }

      if (countryCode && !/^[a-z]{2}$/.test(countryCode)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Country code must contain two letters, for example IN, US or GB.",
          },
          { status: 400 }
        );
      }

      apiUrl = new URL("https://api.geoapify.com/v1/geocode/search");
      apiUrl.searchParams.set("text", postcode);
      apiUrl.searchParams.set("type", "postcode");
      apiUrl.searchParams.set("limit", "5");

      if (countryCode) {
        apiUrl.searchParams.set(
          "filter",
          `countrycode:${countryCode}`
        );
      }

      source = "postcode";
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Provide coordinates (lat and lon) or a postal code (postcode).",
        },
        { status: 400 }
      );
    }

    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("lang", "en");
    apiUrl.searchParams.set("apiKey", apiKey);

    const response = await fetch(apiUrl.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Geoapify could not process the location request.",
          providerStatus: response.status,
        },
        { status: 502 }
      );
    }

    const data = (await response.json()) as GeoapifyResponse;
    const features = data.features ?? data.results ?? [];
    let locations = features.map(formatLocation);

// If postal-code search has no city, look up the city
// using the coordinates returned by Geoapify.
if (
  source === "postcode" &&
  locations.length > 0 &&
  !locations[0].city &&
  locations[0].latitude !== null &&
  locations[0].longitude !== null
) {
  const cityUrl = new URL(
    "https://api.geoapify.com/v1/geocode/reverse"
  );

  cityUrl.searchParams.set(
    "lat",
    String(locations[0].latitude)
  );

  cityUrl.searchParams.set(
    "lon",
    String(locations[0].longitude)
  );

  cityUrl.searchParams.set("type", "city");
  cityUrl.searchParams.set("limit", "1");
  cityUrl.searchParams.set("format", "json");
  cityUrl.searchParams.set("lang", "en");
  cityUrl.searchParams.set("apiKey", apiKey);

  const cityResponse = await fetch(cityUrl.toString(), {
    cache: "no-store",
  });

  if (cityResponse.ok) {
    const cityData =
      (await cityResponse.json()) as GeoapifyResponse;

    const cityFeatures =
      cityData.features ?? cityData.results ?? [];

    if (cityFeatures.length > 0) {
      const nearbyCity = formatLocation(cityFeatures[0]);

      if (nearbyCity.city) {
        locations[0] = {
          ...locations[0],
          city: nearbyCity.city,
          state: locations[0].state || nearbyCity.state,
          country: locations[0].country || nearbyCity.country,
          countryCode:
            locations[0].countryCode || nearbyCity.countryCode,
        };
      }
    }
  }
}

    if (locations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No matching location was found. Check the coordinates or postal code.",
          results: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      source,
      results: locations,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while looking up the location.",
      },
      { status: 500 }
    );
  }
}