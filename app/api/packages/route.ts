import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import TourPackage from '../../../models/TourPackage';

// Ensure DB connection is initialized
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dubai_adventures";

async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    await mongoose.connect(MONGODB_URI);
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const url = new URL(request.url);
        
        // Pagination logic similar to activities
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Use standard find to get published packages only
        const filter = { status: 'PUBLISHED' };

        const total = await TourPackage.countDocuments(filter);
        const packages = await TourPackage.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            data: packages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching packages:", error);
        return NextResponse.json(
            { error: "Failed to fetch packages" },
            { status: 500 }
        );
    }
}
