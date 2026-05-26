import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import {
  normalizeEmail,
  normalizeOptionalText,
  normalizeText,
} from "@/lib/normalizers";
import Booking from "@/models/Booking";
import { getAssetAvailability, findAvailableAsset } from "@/lib/assetManager";
import {
  calculateBookingSubtotal,
  calculateCouponDiscount,
  resolveBookingExperience,
} from "@/lib/booking-products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const bookingFields = [
  "activityId",
  "activityTitle",
  "date",
  "adults",
  "fullName",
  "email",
  "phone",
] as const;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, message }, { status, headers: noStoreHeaders });
}

function normalizeTimeSlot(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : undefined;

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    await connectToDatabase();

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(bookings, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return jsonError("Failed to fetch bookings", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : undefined;

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const body = await req.json();
    const missingField = bookingFields.find((field) => {
      const value = body[field];
      return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
    });
    if (missingField) {
      return jsonError(`${missingField} is required`, 400);
    }

    await connectToDatabase();

    const experience = await resolveBookingExperience(body);
    if (!experience) {
      return jsonError("Experience not found", 404);
    }

    const bookingDate = new Date(body.date);
    if (Number.isNaN(bookingDate.getTime())) {
      return jsonError("Invalid booking date", 400);
    }

    // Dubai Time (UTC+4) past-date prevention
    const now = new Date();
    const dubaiOffset = 4; // hours
    const dubaiNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3600000 * dubaiOffset));
    const startOfToday = new Date(dubaiNow);
    startOfToday.setHours(0, 0, 0, 0);
    if (bookingDate < startOfToday) {
      return jsonError("Cannot book a date in the past. Please select a future date.", 400);
    }

    const adults = Number(body.adults);
    const children = Number(body.children ?? 0);

    if (!Number.isFinite(adults) || adults < 1) {
      return jsonError("Adults must be at least 1", 400);
    }

    if (!Number.isFinite(children) || children < 0) {
      return jsonError("Children cannot be negative", 400);
    }

    const fullName = normalizeText(String(body.fullName));
    const email =
      body.email ? normalizeEmail(String(body.email)) : (session?.user?.email ? normalizeEmail(session.user.email) : "");
    const phone = normalizeOptionalText(body.phone);
    const nationality = normalizeOptionalText(body.nationality);
    const pickupAddress = normalizeOptionalText(body.pickupAddress);
    const dropoffAddress = normalizeOptionalText(body.dropoffAddress);

    if (!fullName) {
      return jsonError("fullName is required", 400);
    }

    if (!email) {
      return jsonError("email is required", 400);
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return jsonError("email is invalid", 400);
    }

    const requestedSlots = adults + children;
    const timeSlot = normalizeTimeSlot(body.timeSlot) || (experience.kind === "activity" ? "" : "Flexible");

    if (experience.kind === "activity" && !timeSlot) {
      return jsonError("timeSlot is required", 400);
    }

    let assignedAssetId: string | null = null;
    if (experience.kind === "activity") {
      // --- Asset Availability Check ---
      const availability = await getAssetAvailability(experience.id, body.date, timeSlot);
      if (availability < requestedSlots) {
        return jsonError("Insufficient asset capacity for this time slot. Please try another time.", 403);
      }

      assignedAssetId = body.assignedAssetId || null;
      if (!assignedAssetId) {
        assignedAssetId = await findAvailableAsset(experience.id, body.date, timeSlot, requestedSlots);
      }

      if (experience.linkedAssets.length > 0 && !assignedAssetId) {
        return jsonError("No single asset is available for the selected group size.", 403);
      }
    }

    const transportType =
      typeof body.transportType === "string"
        ? body.transportType
        : typeof body.transportationTier?.type === "string"
          ? body.transportationTier.type
          : null;

    const resolvedTransportTier =
      experience.kind === "activity" && transportType
        ? experience.transportation?.find((tier) => tier.type === transportType) || null
        : null;

    if (experience.kind === "activity" && transportType && !resolvedTransportTier) {
      return jsonError("Selected transportation tier is unavailable.", 400);
    }

    if (resolvedTransportTier && (!pickupAddress || !dropoffAddress)) {
      return jsonError("Pickup and drop-off addresses are required when transportation is selected.", 400);
    }

    const subtotalPrice =
      experience.kind === "bundle"
        ? Number(body.bundleSubtotal ?? body.subtotalPrice ?? body.totalPrice)
        : calculateBookingSubtotal(experience, {
            date: bookingDate,
            adults,
            children,
            transportationTier: resolvedTransportTier,
            transportType,
          });

    if (!Number.isFinite(subtotalPrice) || subtotalPrice < 0) {
      return jsonError("Subtotal price is invalid", 400);
    }

    const { discountAmount: recalculatedDiscount, coupon } = await calculateCouponDiscount(
      body.couponCode || "",
      subtotalPrice,
      experience.id,
    );

    // Compute package date range for multi-day packages
    let packageStartDate: Date | null = null;
    let packageEndDate: Date | null = null;
    if (experience.kind === "package" && experience.totalDays && experience.totalDays > 1) {
      packageStartDate = bookingDate;
      packageEndDate = new Date(bookingDate);
      packageEndDate.setDate(packageEndDate.getDate() + (experience.totalDays - 1));
    } else if (body.packageStartDate && body.packageEndDate) {
      packageStartDate = new Date(body.packageStartDate);
      packageEndDate = new Date(body.packageEndDate);
    }

    const booking = await Booking.create({
      ...body,
      userId,
      activityId: experience.id,
      activityTitle: experience.title,
      date: bookingDate,
      timeSlot,
      adults,
      children,
      subtotalPrice,
      totalPrice: Math.max(0, subtotalPrice - recalculatedDiscount),
      fullName,
      email,
      phone,
      nationality,
      status: "confirmed",
      productType: experience.kind,
      isBundle: experience.kind === "bundle" || Boolean(body.isBundle),
      bundledItems: Array.isArray(body.bundledItems) ? body.bundledItems : [],
      assignedAssetId: experience.kind === "activity" ? assignedAssetId : null,
      transportType: resolvedTransportTier?.type || null,
      transportLabel: resolvedTransportTier?.label || "",
      transportFee: resolvedTransportTier
        ? (resolvedTransportTier.type === "Shared"
            ? resolvedTransportTier.basePrice * requestedSlots
            : resolvedTransportTier.basePrice)
        : 0,
      pickupAddress,
      dropoffAddress,
      couponCode: coupon?.code || null,
      discountAmount: recalculatedDiscount,
      packageStartDate,
      packageEndDate,
    });

    // Increment coupon usedCount if a coupon was successfully applied
    if (coupon && recalculatedDiscount > 0) {
      try {
        const { default: CouponModel } = await import("@/models/Coupon");
        await CouponModel.findOneAndUpdate(
          { code: coupon.code },
          { $inc: { usedCount: 1 } }
        );
      } catch (couponError) {
        console.error("Failed to increment coupon usage:", couponError);
      }
    }

    // --- Generate PDF & Send Email Asynchronously ---
    (async () => {
      try {
        const { generateTicketPDF } = await import("@/lib/pdfGenerator");
        const { sendBookingConfirmation, sendAdminNotification } = await import("@/lib/email");
        
        console.log("DEBUG: BOOKING DATA FOR EMAIL:", JSON.stringify(booking, null, 2));

        const activityDetails = {
          ...experience.source,
          id: experience.id,
          title: experience.title,
          subtitle: experience.subtitle,
          image: experience.image,
          location: experience.location,
          reviewPath: experience.reviewPath,
        };

        const pdfBuffer = await generateTicketPDF(booking, activityDetails);
        
        // Parallel email sending with full details
        await Promise.all([
          sendBookingConfirmation(booking, activityDetails, pdfBuffer),
          sendAdminNotification(booking, activityDetails)
        ]);
      } catch (err) {
        console.error("Failed to generate PDF or send email:", err);
      }
    })();

    return NextResponse.json(
      {
        bookingId: booking._id.toString(),
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking create error:", error);
    return jsonError(error?.message || "Failed to create booking", 500);
  }
}
