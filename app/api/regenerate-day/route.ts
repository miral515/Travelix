import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY!;

async function getUnsplashImage(query: string) {
  try {
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

    if (!res.ok) return "";

    const data = await res.json();

    return data.results?.[0]?.urls?.regular || "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      destination,
      day,
      currentItems,
      budget,
      travelers,
      interests,
    } = body;

    const prompt = `
You are Travelix AI, an expert travel planner.

Regenerate ONLY ONE DAY of an existing travel itinerary.

Destination: ${destination}
Day: ${day}
Total Trip Budget: ${budget}
Number of Travelers: ${travelers || 1}
Interests: ${(interests || []).join(", ")}

Current activities:
${JSON.stringify(currentItems, null, 2)}

Create a completely NEW version of this day.

Rules:
- Return exactly 3 activities.
- Morning, Afternoon, and Evening.
- Use REAL places.
- Do NOT repeat the current activities.
- Use specific attractions, restaurants, landmarks, or experiences.
- Keep the activities realistic and geographically sensible.
- Consider the user's interests.
- Keep estimated costs realistic.
- Do not exceed the overall budget.
- "place" must be the exact location name.
- Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "day": "${day}",
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
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: {
        type: "json_object",
      },
    });

    const text = response.choices[0].message.content;

    if (!text) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const regeneratedDay = JSON.parse(text);

    if (
      !Array.isArray(regeneratedDay.items) ||
      regeneratedDay.items.length !== 3
    ) {
      throw new Error("Invalid day returned by AI.");
    }

    for (const item of regeneratedDay.items) {
      item.image = await getUnsplashImage(
        `${item.place} ${destination}`
      );

      item.googleMaps = item.place
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            item.place
          )}`
        : "";
    }

    return NextResponse.json(regeneratedDay);
  } catch (error) {
    console.error("REGENERATE DAY ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to regenerate day",
      },
      {
        status: 500,
      }
    );
  }
}