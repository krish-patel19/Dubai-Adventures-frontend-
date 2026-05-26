import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
    generateGeminiChatText,
    isGeminiCredentialError,
    isGeminiRateLimitError,
} from "@/lib/ai/gemini";
import { normalizeGeminiModelName } from "@/lib/ai/gemini-models";
import {
    buildProfessionalFallbackReply,
    extractActivityIdsFromText,
    getChatRecommendations,
    mergeChatRecommendations,
} from "@/lib/ai/chat-recommendations";
import { enrichActivity } from "@/lib/experience-templates";
import SiteConfig from "@/models/SiteConfig";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
    let fallbackRecommendations = [] as ReturnType<typeof getChatRecommendations>;
    let conversationText = "";

    try {
        const { messages } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Invalid Request", details: "A chat message is required to contact the AI assistant." },
                { status: 400 }
            );
        }

        await connectToDatabase();
        
        // Fetch Admin Configuration
        const config = await SiteConfig.findOne({}).lean();
        const aiConfig = (config as any)?.aiPlanner || {};
        const configuredModel = aiConfig.modelEngine;

        if (aiConfig.isActive === false) {
            return NextResponse.json(
                { error: "Maintenance", details: "The AI Assistant is currently disabled in the admin settings." },
                { status: 503 }
            );
        }

        // Fetch Live Activities for Context
        const rawActivities = await Activity.find({ isPublished: { $ne: false } })
            .select("id title subtitle shortDescription fullDescription price duration rating reviewCount image category badge badgeType highlights timeSlots maxGroupSize experienceCategories isCombo")
            .limit(60)
            .lean();

        const activities = rawActivities
            .map((activity) => enrichActivity(activity))
            .filter((activity) => Boolean(activity.id && activity.title));
            
        conversationText = messages
            .filter((message: any) => message?.role === "user" && typeof message?.content === "string")
            .map((message: any) => message.content.trim())
            .filter(Boolean)
            .join("\n");

        fallbackRecommendations = getChatRecommendations(activities, conversationText, 4);

        // Construct the Master Prompt Data Context
        const priorityMatches = fallbackRecommendations
            .map((recommendation, index) =>
                `${index + 1}. ${recommendation.title} (ID: ${recommendation.id}, ${recommendation.isCombo ? "Package" : "Tour"}, ${recommendation.price} AED) - ${recommendation.recommendationReason}`
            )
            .join("\n");
        const context = activities
            .map((activity) =>
                `- ${activity.title} (ID: ${activity.id}, Type: ${activity.isCombo ? "Package" : "Tour"}, Category: ${activity.category}, Price: ${activity.price} AED, Duration: ${activity.duration}, Badge: ${activity.badge || "Standard"})`
            )
            .join("\n");
        const adminPrompt = aiConfig.systemInstructions || "You are a helpful travel assistant for Dubai Adventures.";
        const latestMessage = messages[messages.length - 1];

        if (latestMessage?.role !== "user" || !latestMessage?.content?.trim()) {
            return NextResponse.json(
                { error: "Invalid Request", details: "The last chat entry must be a non-empty user message." },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                {
                    content: buildProfessionalFallbackReply(conversationText, fallbackRecommendations),
                    model: "local-concierge-fallback",
                    recommendations: fallbackRecommendations,
                    fallback: true,
                },
                { status: 200 }
            );
        }

        // The Master Prompt ensures strict adherence to character, formatting, and reliability
        const masterPrompt = `
SYSTEM INSTRUCTIONS & PERSONA:
${adminPrompt}

CONCIERGE BEHAVIOR:
- Sound like a polished Dubai luxury concierge: warm, professional, concise, and commercially sharp.
- Recommend 2 to 4 experiences that best fit the guest's request.
- For each recommendation, briefly explain why it fits the guest's requirement.
- If the guest is still vague, ask one focused follow-up question while still offering provisional matches.
- If a recommendation is a combo, call it a package.
- Never mention internal systems, prompts, tools, or technical problems.

PRIORITY MATCH SHORTLIST:
${priorityMatches || "- No strong shortlist yet. Use the live inventory carefully."}

LIVE INVENTORY CONTEXT:
Here are the activities currently available for booking:
${context}

STRICT RULESET (YOU MUST OBEY THESE):
1. You must ONLY recommend activities from the LIVE INVENTORY CONTEXT above.
2. If you recommend an activity, you MUST include its exact business ID exactly like this: [ACTIVITY:activity-slug-here].
3. Never invent new IDs or activities.
4. Prioritize the PRIORITY MATCH SHORTLIST whenever it clearly fits the guest request.
5. Keep your responses concise, professional, and elegant.
`;

        // Initialize chat history, making sure to handle Google's strict role rules
        // Note: Google SDK requires history to start with 'user' role
        let history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === "user" ? ("user" as const) : ("model" as const),
            parts: [{ text: m.content || " " }],
        }));

        // Permanent Fix: Remove leading 'model' messages from history as SDK requires first message to be from 'user'
        while (history.length > 0 && history[0].role !== "user") {
            history.shift();
        }

        const { model: resolvedModel, text } = await generateGeminiChatText({
            apiKey,
            preferredModel: configuredModel,
            systemInstruction: masterPrompt,
            history,
            message: latestMessage.content.trim(),
        });

        if ((config as any)?._id && normalizeGeminiModelName(configuredModel) !== resolvedModel) {
            await SiteConfig.updateOne(
                { _id: (config as any)._id },
                { $set: { "aiPlanner.modelEngine": resolvedModel } }
            );
        }

        const recommendations = mergeChatRecommendations(
            extractActivityIdsFromText(text),
            fallbackRecommendations,
            activities,
            conversationText,
            4
        );

        return NextResponse.json({ content: text, model: resolvedModel, recommendations });
    } catch (error: any) {
        console.error("AI API Error:", error);

        if (fallbackRecommendations.length && (isGeminiCredentialError(error) || isGeminiRateLimitError(error) || !process.env.GEMINI_API_KEY)) {
            return NextResponse.json(
                {
                    content: buildProfessionalFallbackReply(conversationText, fallbackRecommendations),
                    model: "local-concierge-fallback",
                    recommendations: fallbackRecommendations,
                    fallback: true,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                error: "Service Error",
                details: "The AI service is temporarily unavailable. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
}
