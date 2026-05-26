import { NextResponse } from "next/server";
import { generateGeminiContentText } from "@/lib/ai/gemini";
import connectToDatabase from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        await connectToDatabase();
        
        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const config = await SiteConfig.findOne({ type: "integration", "value.provider": "gemini" });
            apiKey = config?.value?.apiKey;
        }

        if (!apiKey) {
            console.error("Gemini API key is missing");
            return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
        }

        const systemInstruction = `You are a luxury travel concierge for Dubai Adventures.
The user wants a personalized travel itinerary based on this request: "${query}".
Create a detailed, exciting, and realistic itinerary.
You MUST respond ONLY with valid JSON matching this exact structure, with no markdown formatting or backticks:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title (e.g., Arrival & Marina Walk)",
      "description": "Brief summary of the day.",
      "activities": [
        {
          "time": "10:00 AM",
          "activity": "Activity Name",
          "description": "Short engaging description.",
          "price": 150,
          "category": "Sightseeing"
        }
      ]
    }
  ]
}`;

        const result = await generateGeminiContentText({
            apiKey,
            systemInstruction,
            promptParts: [{ text: "Generate the JSON itinerary." }]
        });

        // Clean up markdown code blocks if the model accidentally includes them
        const jsonStr = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error("AI Planner error:", error);
        return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
    }
}
