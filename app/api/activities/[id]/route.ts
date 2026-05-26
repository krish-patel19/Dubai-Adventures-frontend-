import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Activity from "@/models/Activity";
import { enrichActivity } from "@/lib/experience-templates";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const activity = await Activity.findOne({ id }).lean();

        if (!activity) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        const enriched = enrichActivity(activity);
        return NextResponse.json(enriched);
    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json(
            { error: "Failed to fetch activity" },
            { status: 500 }
        );
    }
}
