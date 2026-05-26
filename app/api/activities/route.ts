import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Activity from "@/models/Activity";
import { EXPERIENCE_TEMPLATES, enrichActivity } from "@/lib/experience-templates";

export async function GET() {
    try {
        await connectToDatabase();
        const activities = await Activity.find({}).sort({ createdAt: -1 }).lean();
        if (!activities.length) {
            return NextResponse.json(EXPERIENCE_TEMPLATES);
        }

        const enriched = activities.map((activity) => enrichActivity(activity));
        return NextResponse.json(enriched);
    } catch (error) {
        console.error("Activities fetch error:", error);
        return NextResponse.json([], { status: 200 }); // return empty array, never crash
    }
}
