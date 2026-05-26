import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import TourPackage from '../../../../models/TourPackage';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dubai_adventures";

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        // Find by id or slug
        const pkg = await TourPackage.findOne({
            $or: [{ id: id }, { slug: id }],
            status: 'PUBLISHED'
        }).lean();

        if (!pkg) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        return NextResponse.json(pkg);
    } catch (error) {
        console.error("Error fetching package details:", error);
        return NextResponse.json(
            { error: "Failed to fetch package details" },
            { status: 500 }
        );
    }
}
