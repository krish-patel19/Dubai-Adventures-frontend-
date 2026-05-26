import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { calculateCouponDiscount } from "@/lib/booking-products";

export async function POST(req: Request) {
    try {
        const { code, activityId, totalPrice } = await req.json();

        if (!code || !activityId || totalPrice === undefined) {
            return NextResponse.json({ valid: false, error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const { discountAmount, coupon } = await calculateCouponDiscount(code, totalPrice, activityId);

        if (coupon) {
            return NextResponse.json({
                valid: true,
                discountAmount,
                code: coupon.code,
                description: `Successfully applied ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : 'AED ' + coupon.discountValue} discount.`,
            });
        }

        return NextResponse.json({
            valid: false,
            error: "Invalid or expired coupon code",
        });
    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
    }
}
