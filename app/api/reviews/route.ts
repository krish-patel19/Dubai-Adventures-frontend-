import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const activityTitle = searchParams.get("activityTitle");
        
        const query: any = { status: "published" };
        if (activityTitle) {
            query.activityTitle = activityTitle;
        }

        const reviews = await Review.find(query).sort({ createdAt: -1 });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json([], { status: 200 }); // Return empty array on failure to prevent frontend crashes
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();
        
        // Basic validation
        if (!body.name || !body.rating || !body.comment) {
            return NextResponse.json({ error: "Name, rating, and comment are required" }, { status: 400 });
        }

        const newReview = await Review.create({
            name: body.name,
            email: body.email || "",
            activityTitle: body.activityTitle || "",
            activityId: body.activityId || "",
            rating: body.rating,
            comment: body.comment,
            status: "pending", // Reviews must be approved by admin
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("Error submitting review:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
