import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      destination,
      budget,
      budgetBreakdown,
      days,
      interests,
      travelers,
    } = body;

    const prompt = `
You are Travelix AI, an expert travel optimization assistant.

Analyze the user's existing travel itinerary.

Destination: ${destination}
Budget: ${budget}
Travelers: ${travelers || 1}
Interests: ${(interests || []).join(", ")}

Current budget:
${JSON.stringify(budgetBreakdown, null, 2)}

Current itinerary:
${JSON.stringify(days, null, 2)}

Find the most useful improvements.

Look for:
1. Opportunities to save money.
2. Opportunities to reduce unnecessary travel time.
3. Activities that better match the user's interests.
4. Days that are too crowded.
5. Better ordering of activities.

IMPORTANT:
- Do NOT change anything yet.
- Only provide recommendations.
- Be realistic.
- Do not invent savings that are impossible.
- Use the existing itinerary.
- Return ONLY valid JSON.

Return exactly:

{
  "summary": "",
  "totalEstimatedSavings": "",
  "travelTimeSaved": "",
  "suggestions": [
    {
      "type": "SAVE_MONEY",
      "title": "",
      "description": "",
      "estimatedSaving": "",
      "day": ""
    },
    {
      "type": "SAVE_TIME",
      "title": "",
      "description": "",
      "estimatedSaving": "",
      "day": ""
    },
    {
      "type": "BETTER_MATCH",
      "title": "",
      "description": "",
      "estimatedSaving": "",
      "day": ""
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
      temperature: 0.3,
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

    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("OPTIMIZE TRIP ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to optimize trip",
      },
      { status: 500 }
    );
  }
}