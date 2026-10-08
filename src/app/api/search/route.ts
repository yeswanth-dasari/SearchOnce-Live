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

type Product = {
  name: string;
  keywords: string[];
  image: string;
  prices: Record<Country, number>;
};

type Store = {
  id: string;
  name: string;
  multiplier: number;
  rating: number;
};

const currencyMap: Record<
  Country,
  {
    code: string;
    symbol: string;
  }
> = {
  India: {
    code: "INR",
    symbol: "₹",
  },

  "United States": {
    code: "USD",
    symbol: "$",
  },

  "United Kingdom": {
    code: "GBP",
    symbol: "£",
  },

  Ireland: {
    code: "EUR",
    symbol: "€",
  },

  Canada: {
    code: "CAD",
    symbol: "C$",
  },

  Australia: {
    code: "AUD",
    symbol: "A$",
  },

  Germany: {
    code: "EUR",
    symbol: "€",
  },

  UAE: {
    code: "AED",
    symbol: "AED ",
  },
};

/*
  Prototype product catalogue.

  Later this will be replaced by real
  product data from approved APIs/feeds.
*/
const products: Product[] = [
  {
    name: "Samsung S25",
    keywords: [
      "samsung",
      "s25",
      "galaxy s25",
      "samsung galaxy s25",
      "samsung s25",
    ],
    image: "/products/samsung-s25.png",

    prices: {
      India: 69999,
      "United States": 799,
      "United Kingdom": 699,
      Ireland: 799,
      Canada: 1099,
      Australia: 1299,
      Germany: 799,
      UAE: 2999,
    },
  },

  {
    name: "iPhone 16",
    keywords: [
      "iphone",
      "iphone 16",
      "iphone16",
      "apple iphone",
      "apple phone",
      "apple",
    ],
    image: "/products/iphone-16.png",

    prices: {
      India: 69900,
      "United States": 799,
      "United Kingdom": 699,
      Ireland: 829,
      Canada: 1099,
      Australia: 1299,
      Germany: 799,
      UAE: 2999,
    },
  },

  {
    name: "MacBook Air",
    keywords: [
      "macbook",
      "macbook air",
      "macbookair",
      "mac book",
      "mac book air",
      "apple laptop",
      "mac air",
      "laptop",
    ],
    image: "/products/macbook-air.png",

    prices: {
      India: 99900,
      "United States": 999,
      "United Kingdom": 1099,
      Ireland: 1199,
      Canada: 1349,
      Australia: 1599,
      Germany: 1199,
      UAE: 4299,
    },
  },

  {
    name: "Nike Air Max",
    keywords: [
      "nike",
      "nike shoes",
      "nike air max",
      "air max",
      "shoes",
      "shoe",
      "sneakers",
      "sneaker",
    ],
    image: "/products/nike-air-max.png",

    prices: {
      India: 12995,
      "United States": 160,
      "United Kingdom": 145,
      Ireland: 170,
      Canada: 220,
      Australia: 250,
      Germany: 160,
      UAE: 599,
    },
  },
];

/*
  Prototype store catalogue.

  The frontend will receive the complete
  store information from this API.
*/
const stores: Store[] = [
  {
    id: "product-amazon",
    name: "Amazon",
    multiplier: 1,
    rating: 4.6,
  },

  {
    id: "product-flipkart",
    name: "Flipkart",
    multiplier: 0.978,
    rating: 4.5,
  },

  {
    id: "product-croma",
    name: "Croma",
    multiplier: 1.012,
    rating: 4.4,
  },

  {
    id: "product-ebay",
    name: "eBay",
    multiplier: 1.025,
    rating: 4.3,
  },
];

/*
  Prototype store availability by country.
*/
const countryStores: Record<
  Country,
  string[]
> = {
  India: [
    "Amazon",
    "Flipkart",
    "Croma",
    "eBay",
  ],

  "United States": [
    "Amazon",
    "eBay",
  ],

  "United Kingdom": [
    "Amazon",
    "eBay",
  ],

  Ireland: [
    "Amazon",
    "eBay",
  ],

  Canada: [
    "Amazon",
    "eBay",
  ],

  Australia: [
    "Amazon",
    "eBay",
  ],

  Germany: [
    "Amazon",
    "eBay",
  ],

  UAE: [
    "Amazon",
    "eBay",
  ],
};

/*
  Prototype delivery information.

  Later this will come from the real store
  API response.
*/
const deliveryInfo: Record<
  string,
  {
    delivery: Record<Country, string>;
    deliveryDays: Record<Country, number>;
    badge?: string;
  }
> = {
  Amazon: {
    delivery: {
      India: "Delivery in 2 days",
      "United States": "Delivery in 2 days",
      "United Kingdom": "Delivery in 2–3 days",
      Ireland: "Delivery in 2–3 days",
      Canada: "Delivery in 3–5 days",
      Australia: "Delivery in 3–5 days",
      Germany: "Delivery in 2–3 days",
      UAE: "Delivery in 2–3 days",
    },

    deliveryDays: {
      India: 2,
      "United States": 2,
      "United Kingdom": 2,
      Ireland: 2,
      Canada: 3,
      Australia: 3,
      Germany: 2,
      UAE: 2,
    },

    badge: "TOP RESULT",
  },

  Flipkart: {
    delivery: {
      India: "Delivery tomorrow",
      "United States": "Delivery in 2–3 days",
      "United Kingdom": "Delivery in 2–3 days",
      Ireland: "Delivery in 2–3 days",
      Canada: "Delivery in 3–5 days",
      Australia: "Delivery in 3–5 days",
      Germany: "Delivery in 2–3 days",
      UAE: "Delivery in 2–3 days",
    },

    deliveryDays: {
      India: 1,
      "United States": 2,
      "United Kingdom": 2,
      Ireland: 2,
      Canada: 3,
      Australia: 3,
      Germany: 2,
      UAE: 2,
    },

    badge: "BEST PRICE",
  },

  Croma: {
    delivery: {
      India: "Delivery in 3 days",
      "United States": "Delivery in 3–4 days",
      "United Kingdom": "Delivery in 3–4 days",
      Ireland: "Delivery in 3–4 days",
      Canada: "Delivery in 4–5 days",
      Australia: "Delivery in 4–5 days",
      Germany: "Delivery in 3–4 days",
      UAE: "Delivery in 3–4 days",
    },

    deliveryDays: {
      India: 3,
      "United States": 3,
      "United Kingdom": 3,
      Ireland: 3,
      Canada: 4,
      Australia: 4,
      Germany: 3,
      UAE: 3,
    },
  },

  eBay: {
    delivery: {
      India: "Delivery in 4 days",
      "United States": "Delivery in 3–5 days",
      "United Kingdom": "Delivery in 3–5 days",
      Ireland: "Delivery in 3–5 days",
      Canada: "Delivery in 4–6 days",
      Australia: "Delivery in 4–6 days",
      Germany: "Delivery in 3–5 days",
      UAE: "Delivery in 3–5 days",
    },

    deliveryDays: {
      India: 4,
      "United States": 3,
      "United Kingdom": 3,
      Ireland: 3,
      Canada: 4,
      Australia: 4,
      Germany: 3,
      UAE: 3,
    },
  },
};

/*
  Normalize search text.

  Examples:

  MacBook Air
  macbook air
  MACBOOK AIR
  Mac Book Air
  MacBookAir

  all become comparable.
*/
function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/*
  Search product.
*/
function findProduct(query: string) {
  const normalizedQuery =
    normalizeText(query);

  if (!normalizedQuery) {
    return null;
  }

  /*
    1. Product name match
  */
  const nameMatch = products.find(
    (product) => {
      const normalizedName =
        normalizeText(product.name);

      return (
        normalizedQuery.includes(
          normalizedName
        ) ||
        normalizedName.includes(
          normalizedQuery
        )
      );
    }
  );

  if (nameMatch) {
    return nameMatch;
  }

  /*
    2. Keyword match
  */
  const keywordMatch = products.find(
    (product) =>
      product.keywords.some(
        (keyword) =>
          normalizedQuery.includes(
            normalizeText(keyword)
          )
      )
  );

  if (keywordMatch) {
    return keywordMatch;
  }

  /*
    3. Word-based match
  */
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const wordMatch = products.find(
    (product) => {
      const searchableText = [
        product.name,
        ...product.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return queryWords.every(
        (word) =>
          searchableText.includes(word)
      );
    }
  );

  return wordMatch || null;
}

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    const countryParam =
      searchParams.get("country") ||
      "India";

    /*
      Validate country.
    */
    const validCountries =
      Object.keys(
        currencyMap
      ) as Country[];

    const country =
      validCountries.includes(
        countryParam as Country
      )
        ? (countryParam as Country)
        : "India";

    /*
      Search query is required.
    */
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Search query is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Find matching product.
    */
    const product =
      findProduct(query);

    if (!product) {
      return NextResponse.json({
        success: true,
        query,
        country,
        currency:
          currencyMap[country].code,
        currencySymbol:
          currencyMap[country].symbol,
        results: [],
        message:
          "No matching product found.",
      });
    }

    /*
      Determine available stores.
    */
    const availableStoreNames =
      countryStores[country];

    const availableStores =
      stores.filter((store) =>
        availableStoreNames.includes(
          store.name
        )
      );

    /*
      Build complete standardized
      store results.
    */
    const results = availableStores.map(
      (store) => {
        const basePrice =
          product.prices[country];

        const price = Math.round(
          basePrice *
            store.multiplier
        );

        const storeDelivery =
          deliveryInfo[store.name];

        return {
          id: store.id,

          store: store.name,

          product: product.name,

          image: product.image,

          price,

          currency:
            currencyMap[country].code,

          currencySymbol:
            currencyMap[country].symbol,

          rating: store.rating,

          country,

          delivery:
            storeDelivery?.delivery[
              country
            ] ||
            "Delivery information available",

          deliveryDays:
            storeDelivery?.deliveryDays[
              country
            ] || 0,

          badge:
            storeDelivery?.badge || null,
        };
      }
    );

    /*
      Final API response.
    */
    return NextResponse.json({
      success: true,

      query,

      country,

      currency:
        currencyMap[country].code,

      currencySymbol:
        currencyMap[country].symbol,

      results,
    });
  } catch (error) {
    console.error(
      "Search API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while processing the search.",
      },
      {
        status: 500,
      }
    );
  }
}