import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY!;
function getCurrencyFromDestination(destination: string) {
  const d = destination.toLowerCase();

  if (
    d.includes("saudi") ||
    d.includes("riyadh") ||
    d.includes("jeddah") ||
    d.includes("makkah") ||
    d.includes("mecca") ||
    d.includes("medina") ||
    d.includes("dammam")
  ) {
    return "SAR";
  }

  if (
    d.includes("france") ||
    d.includes("paris") ||
    d.includes("italy") ||
    d.includes("rome") ||
    d.includes("milan")
  ) {
    return "EUR";
  }

  if (
    d.includes("uk") ||
    d.includes("london") ||
    d.includes("england")
  ) {
    return "GBP";
  }

  if (
    d.includes("usa") ||
    d.includes("new york") ||
    d.includes("los angeles")
  ) {
    return "USD";
  }

  if (
    d.includes("japan") ||
    d.includes("tokyo")
  ) {
    return "JPY";
  }

  if (
    d.includes("uae") ||
    d.includes("dubai") ||
    d.includes("abu dhabi")
  ) {
    return "AED";
  }

  return "USD";
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200";

async function getUnsplashImage(query: string) {
  try {
    if (!UNSPLASH_KEY) {
      console.log("UNSPLASH_ACCESS_KEY is missing");
      return FALLBACK_IMAGE;
    }

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`,
        },
      }
    );

    if (!res.ok) {
      console.log("Unsplash Error:", res.status);
      return FALLBACK_IMAGE;
    }

    const data = await res.json();

    return data.results?.[0]?.urls?.regular || FALLBACK_IMAGE;
  } catch (error) {
    console.log("Unsplash Failed:", error);
    return FALLBACK_IMAGE;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const interests = Array.isArray(body.interests)
      ? body.interests.join(", ")
      : "";

    const prompt = `
You are Travelix AI, an expert travel planner.

Create a realistic and personalized travel itinerary.

Destination: ${body.destination}
Departure City: ${body.departureCity}
Travel Date: ${body.travelDate}
Trip Length: ${body.tripLength} days
Budget: ${body.budget}
Travelers: ${body.travelers}
Interests: ${interests}

Return ONLY valid JSON.

Use EXACTLY this structure:
"budgetBreakdown": {
  "flights": "",
  "hotel": "",
  "food": "",
  "transport": "",
  "activities": "",
  "shopping": "",
  "other": "",
  "total": "",
  "remaining": ""
},
  }
  "destination": "",
  "duration": "",
  "budget": "",

  "hotel": {
    "name": "",
    "address": "",
    "stars": "",
    "pricePerNight": "",
    "reason": ""
  },

 

  "restaurants": [
    {
      "name": "",
      "priceRange": ""
    }
  ],

  "days": [
    {
      "day": "DAY 1",
      "items": [
        {
          "time": "Morning",
          "activity": "",
          "place": "",
          "estimatedTime": "",
          "estimatedCost": ""
        },
        {
          "time": "Afternoon",
          "activity": "",
          "place": "",
          "estimatedTime": "",
          "estimatedCost": ""
        },
        {
          "time": "Evening",
          "activity": "",
          "place": "",
          "estimatedTime": "",
          "estimatedCost": ""
        }
      ]
    }
  ],

  "travelTips": [
    "",
    "",
    ""
  ]
}

Rules:

- Return ONLY JSON.
- No markdown.
- No explanation.
- Do not use code fences.
- Recommend only REAL places.
- "place" must be the exact location name from the activity.
- Generate exactly 3 activities for EACH day.
- Every day must include Morning, Afternoon, and Evening activities.
- Activities should be detailed and realistic.
- Mention specific attractions, restaurants, hotels, or landmarks.
- Avoid generic activities.
- Recommend different places every day.
- Estimate realistic costs.
- Budget categories must approximately equal the total budget.
- Do not exceed the user's budget.
- Remaining is the estimated money left after expenses.
- "flights" is REQUIRED and must never be empty.
- Estimate the total round-trip flight cost for ALL travelers.
- Calculate the flight estimate using the departure city, destination, travel date, and number of travelers.
- The flight estimate must be included in the total.
- Do not leave "flights" blank or use "N/A".
- Clearly treat the flight amount as an estimated price, not a real-time flight price.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const text = response.choices[0].message.content;

    if (!text) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    console.log("RAW RESPONSE:");
    console.log(text);

    let cleaned = text.trim();

    // Remove markdown code fences if Groq returns them
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    cleaned = cleaned.trim();

    // Extract JSON object
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON found in AI response.");
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    const itinerary = JSON.parse(cleaned);
    const destinationCurrency = getCurrencyFromDestination(
  itinerary.destination
);

itinerary.destinationCurrency = destinationCurrency;

    // ------------------------------------------------
    // Google Maps - Hotel
    // ------------------------------------------------

    if (itinerary.hotel?.name) {
      itinerary.hotel.googleMaps =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${itinerary.hotel.name} ${itinerary.hotel.address || ""}`
        )}`;
    }

    // ------------------------------------------------
    // Hotel image
    // 1 Unsplash request
    // ------------------------------------------------

    if (itinerary.hotel?.name) {
      itinerary.hotel.image = await getUnsplashImage(
        `${itinerary.hotel.name} ${itinerary.destination}`
      );
    }

    // ------------------------------------------------
    // One image per day
    // Much fewer Unsplash API requests
    // ------------------------------------------------

    if (Array.isArray(itinerary.days)) {
      for (const day of itinerary.days) {
        const firstPlace = day.items?.[0]?.place;

        if (firstPlace) {
          day.image = await getUnsplashImage(
            `${firstPlace} ${itinerary.destination}`
          );
        }
      }
    }

    // ------------------------------------------------
    // Restaurants Google Maps
    // ------------------------------------------------

    if (Array.isArray(itinerary.restaurants)) {
      itinerary.restaurants = itinerary.restaurants.map(
        (restaurant: any) => ({
          ...restaurant,

          googleMaps: restaurant.name
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${restaurant.name} ${itinerary.destination}`
              )}`
            : "",
        })
      );
    }

    // ------------------------------------------------
    // Activities Google Maps
    // ------------------------------------------------

    if (Array.isArray(itinerary.days)) {
      itinerary.days = itinerary.days.map((day: any) => ({
        ...day,

        items: Array.isArray(day.items)
          ? day.items.map((item: any) => ({
              ...item,

              googleMaps: item.place
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${item.place} ${itinerary.destination}`
                  )}`
                : "",
            }))
          : [],
      }));
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("GENERATE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}