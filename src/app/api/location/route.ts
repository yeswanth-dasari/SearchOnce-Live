import { NextRequest, NextResponse } from "next/server";

type GeoapifyProperties = {
  name?: string;
  result_type?: string;
  type?: string;
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  locality?: string;
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

type LocationResult = {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  postalCode: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
};

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function formatLocation(feature: GeoapifyFeature): LocationResult {
  const p = feature.properties ?? feature;
  const coordinates = feature.geometry?.coordinates ?? [];
  const resultType = firstNonEmpty(p.result_type, p.type).toLowerCase();
  const nameIsCity = ["city", "town", "village", "municipality", "locality"].includes(resultType);

  return {
    // Use firstNonEmpty rather than ?? because providers sometimes return empty strings.
    city: firstNonEmpty(
      p.city,
      p.town,
      p.village,
      p.municipality,
      p.locality,
      nameIsCity ? p.name : "",
      p.suburb,
      p.district
    ),
    state: firstNonEmpty(p.state, p.county),
    country: firstNonEmpty(p.country),
    countryCode: firstNonEmpty(p.country_code).toUpperCase(),
    postalCode: firstNonEmpty(p.postcode),
    formattedAddress: firstNonEmpty(p.formatted),
    latitude: typeof p.lat === "number" ? p.lat : coordinates[1] ?? null,
    longitude: typeof p.lon === "number" ? p.lon : coordinates[0] ?? null,
  };
}

async function fetchGeoapifyFeatures(url: URL): Promise<GeoapifyFeature[]> {
  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return [];

  const data = (await response.json()) as GeoapifyResponse;
  return data.results ?? data.features ?? [];
}

function buildReverseUrl(apiKey: string, lat: number, lon: number, type?: "city") {
  const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("limit", "5");
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "en");
  url.searchParams.set("apiKey", apiKey);
  if (type) url.searchParams.set("type", type);
  return url;
}

async function resolveCoordinateLocation(
  apiKey: string,
  lat: number,
  lon: number
): Promise<LocationResult | null> {
  // First ask Geoapify for a city/town/village-level result.
  const cityFeatures = await fetchGeoapifyFeatures(
    buildReverseUrl(apiKey, lat, lon, "city")
  );
  const cityLocations = cityFeatures.map(formatLocation);
  const cityMatch = cityLocations.find((location) => location.city !== "");
  if (cityMatch) return cityMatch;

  // If Geoapify cannot resolve a city-level record, ask for the nearest address
  // without restricting the result type. Its address may still contain city data.
  const addressFeatures = await fetchGeoapifyFeatures(
    buildReverseUrl(apiKey, lat, lon)
  );
  const addressLocations = addressFeatures.map(formatLocation);
  const addressCityMatch = addressLocations.find((location) => location.city !== "");
  if (addressCityMatch) return addressCityMatch;

  // Do not invent a city if neither response supplies a reliable locality.
  return addressLocations[0] ?? cityLocations[0] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Geoapify API key is missing. Check GEOAPIFY_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    const params = request.nextUrl.searchParams;
    const latText = params.get("lat");
    const lonText = params.get("lon");
    const postcode = params.get("postcode")?.trim() ?? "";
    const countryCode = params.get("countryCode")?.trim().toLowerCase() ?? "";
    const hasCoordinates = latText !== null || lonText !== null;

    let locations: LocationResult[] = [];
    let source: "coordinates" | "postcode";

    if (hasCoordinates) {
      if (latText === null || lonText === null) {
        return NextResponse.json(
          { success: false, error: "Provide both latitude (lat) and longitude (lon)." },
          { status: 400 }
        );
      }

      const lat = Number(latText);
      const lon = Number(lonText);
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 || lat > 90 ||
        lon < -180 || lon > 180
      ) {
        return NextResponse.json(
          { success: false, error: "Latitude or longitude is invalid." },
          { status: 400 }
        );
      }

      const location = await resolveCoordinateLocation(apiKey, lat, lon);
      locations = location ? [location] : [];
      source = "coordinates";
    } else if (postcode) {
      if (postcode.length > 32) {
        return NextResponse.json(
          { success: false, error: "Postal code is too long." },
          { status: 400 }
        );
      }

      if (countryCode && !/^[a-z]{2}$/.test(countryCode)) {
        return NextResponse.json(
          {
            success: false,
            error: "Country code must contain two letters, for example IN, US or GB.",
          },
          { status: 400 }
        );
      }

      const searchUrl = new URL("https://api.geoapify.com/v1/geocode/search");
      searchUrl.searchParams.set("text", postcode);
      searchUrl.searchParams.set("type", "postcode");
      searchUrl.searchParams.set("limit", "5");
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("lang", "en");
      searchUrl.searchParams.set("apiKey", apiKey);
      if (countryCode) searchUrl.searchParams.set("filter", `countrycode:${countryCode}`);

      const postcodeFeatures = await fetchGeoapifyFeatures(searchUrl);
      const postcodeLocations = postcodeFeatures.map(formatLocation);
      const baseLocation = postcodeLocations.find((item) => item.postalCode !== "") ?? postcodeLocations[0];

      if (!baseLocation) {
        locations = [];
      } else if (
        !baseLocation.city &&
        baseLocation.latitude !== null &&
        baseLocation.longitude !== null
      ) {
        const nearbyLocation = await resolveCoordinateLocation(
          apiKey,
          baseLocation.latitude,
          baseLocation.longitude
        );

        locations = [{
          ...baseLocation,
          city: firstNonEmpty(baseLocation.city, nearbyLocation?.city),
          state: firstNonEmpty(baseLocation.state, nearbyLocation?.state),
          country: firstNonEmpty(baseLocation.country, nearbyLocation?.country),
          countryCode: firstNonEmpty(baseLocation.countryCode, nearbyLocation?.countryCode),
          postalCode: firstNonEmpty(baseLocation.postalCode, postcode),
          formattedAddress: firstNonEmpty(baseLocation.formattedAddress, nearbyLocation?.formattedAddress),
          latitude: baseLocation.latitude ?? nearbyLocation?.latitude ?? null,
          longitude: baseLocation.longitude ?? nearbyLocation?.longitude ?? null,
        }];
      } else {
        locations = [{ ...baseLocation, postalCode: firstNonEmpty(baseLocation.postalCode, postcode) }];
      }

      source = "postcode";
    } else {
      return NextResponse.json(
        { success: false, error: "Provide coordinates (lat and lon) or a postal code (postcode)." },
        { status: 400 }
      );
    }

    if (locations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching location was found. Check the coordinates or postal code.",
          results: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, source, results: locations });
  } catch (error) {
    console.error("Location API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while looking up the location." },
      { status: 500 }
    );
  }
}
