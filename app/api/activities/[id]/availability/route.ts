import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month");
        const timeSlot = searchParams.get("timeSlot");

        // Returns an empty object, allowing DatePriceCalendar to fallback to default availability.
        // In a real implementation, this would query bookings and assets for the month.
        return NextResponse.json({});
    } catch (error) {
        console.error("Availability fetch error:", error);
        return NextResponse.json({}, { status: 500 });
    }
}
