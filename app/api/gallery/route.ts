import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export async function GET() {
    try {
        await connectToDatabase();
        const images = await Gallery.find().sort({ sortOrder: 1, createdAt: -1 });
        return NextResponse.json(images);
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
    }
}
