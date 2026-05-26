import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TravelJournal, { normalizeTravelJournal } from "@/models/TravelJournal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        await connectToDatabase();
        let journal = await TravelJournal.findOne({}).lean();
        
        if (!journal) {
            // Create default journal if it doesn't exist
            const newJournal = await TravelJournal.create({});
            journal = newJournal.toObject();
        }
        
        const result = normalizeTravelJournal(journal);
        
        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-store, max-age=0, must-revalidate",
            }
        });
    } catch (error) {
        console.error("Travel Journal fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch Travel Journal" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        await connectToDatabase();
        const journal = await TravelJournal.findOneAndUpdate({}, body, { returnDocument: "after", upsert: true });
        return NextResponse.json(normalizeTravelJournal(journal));
    } catch (error) {
        console.error("Travel Journal update error:", error);
        return NextResponse.json({ error: "Failed to update Travel Journal" }, { status: 500 });
    }
}
