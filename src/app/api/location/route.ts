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
  county: string;
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

function normalizePostcode(value: string): string {
  // Ignore formatting spaces and hyphens (e.g. UK/Irish-style postcodes).
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

function formatLocation(feature: GeoapifyFeature): LocationResult {
  const p = feature.properties ?? feature;
  const coordinates = feature.geometry?.coordinates ?? [];
  const resultType = firstNonEmpty(p.result_type, p.type).toLowerCase();
  const nameIsCity = ["city", "town", "village", "municipality", "locality"].includes(resultType);

  return {
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
    state: firstNonEmpty(p.state),
    county: firstNonEmpty(p.county),
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
  // IMPORTANT: Resolve the nearest address first. It is the best source for
  // postcode/address details. A type=city result can refer to a city-level
  // record and its postcode may not match the user's exact coordinates.
  const [addressFeatures, cityFeatures] = await Promise.all([
    fetchGeoapifyFeatures(buildReverseUrl(apiKey, lat, lon)),
    fetchGeoapifyFeatures(buildReverseUrl(apiKey, lat, lon, "city")),
  ]);

  const addressLocations = addressFeatures.map(formatLocation);
  const cityLocations = cityFeatures.map(formatLocation);
  const nearestAddress = addressLocations[0];
  const addressWithCity = addressLocations.find((location) => location.city !== "");
  const cityMatch = cityLocations.find((location) => location.city !== "");

  if (nearestAddress) {
    // Use the nearest address record as the primary record. Enrich only missing
    // administrative fields from other results. Never borrow a postcode from a
    // city-level fallback, because that can display a postcode for another area.
    return {
      city: firstNonEmpty(nearestAddress.city, addressWithCity?.city, cityMatch?.city),
      state: firstNonEmpty(nearestAddress.state, addressWithCity?.state, cityMatch?.state),
      county: firstNonEmpty(nearestAddress.county, addressWithCity?.county, cityMatch?.county),
      country: firstNonEmpty(nearestAddress.country, addressWithCity?.country, cityMatch?.country),
      countryCode: firstNonEmpty(nearestAddress.countryCode, addressWithCity?.countryCode, cityMatch?.countryCode),
      // Postcode comes only from the nearest address-level result.
      postalCode: nearestAddress.postalCode,
      formattedAddress: nearestAddress.formattedAddress,
      // Keep the actual coordinates supplied by the browser as the source point.
      latitude: lat,
      longitude: lon,
    };
  }

  // If no address record is returned, city-level information can still help
  // identify the city and administrative area, but do not invent a postcode.
  if (cityMatch) {
    return {
      ...cityMatch,
      postalCode: "",
      latitude: lat,
      longitude: lon,
    };
  }

  return null;
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
      const normalizedInput = normalizePostcode(postcode);

      // Never silently substitute a nearby/different postcode. Only accept a
      // result whose normalized postcode matches exactly within the chosen country.
      const baseLocation = postcodeLocations.find(
        (item) => item.postalCode !== "" && normalizePostcode(item.postalCode) === normalizedInput
      );

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
          county: firstNonEmpty(baseLocation.county, nearbyLocation?.county),
          country: firstNonEmpty(baseLocation.country, nearbyLocation?.country),
          countryCode: firstNonEmpty(baseLocation.countryCode, nearbyLocation?.countryCode),
          // Preserve the exact postcode the user entered after validation.
          postalCode: baseLocation.postalCode,
          formattedAddress: firstNonEmpty(baseLocation.formattedAddress, nearbyLocation?.formattedAddress),
          latitude: baseLocation.latitude,
          longitude: baseLocation.longitude,
        }];
      } else {
        locations = [{ ...baseLocation, postalCode: baseLocation.postalCode }];
      }

      source = "postcode";
    } else {
      return NextResponse.json(
        { success: false, error: "Provide coordinates (lat and lon) or a postal code (postcode)." },
        { status: 400 }
      );
    }

    if (locations.length === 0) {
      const error = source === "postcode"
        ? "No exact match found for this postal code in the selected country. Check the postal code and country."
        : "No matching location was found. Check the coordinates.";
      return NextResponse.json(
        { success: false, error, results: [] },
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
