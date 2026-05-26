import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/Booking";
import {
  calculateBookingSubtotal,
  calculateCouponDiscount,
  resolveBookingExperienceFromBooking,
} from "@/lib/booking-products";
import { getAssetAvailability, findAvailableAsset } from "@/lib/assetManager";
import { normalizeEmail, normalizeOptionalText, normalizeText } from "@/lib/normalizers";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, message }, { status });
}

function normalizeTimeSlot(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveTransportType(body: any, booking: any) {
  if (typeof body.transportType === "string" && body.transportType.trim()) {
    return body.transportType.trim();
  }

  if (typeof body.transportationTier?.type === "string" && body.transportationTier.type.trim()) {
    return body.transportationTier.type.trim();
  }

  if (typeof booking.transportType === "string" && booking.transportType.trim()) {
    return booking.transportType.trim();
  }

  return null;
}

async function loadOwnedBooking(id: string, userId: string) {
  return Booking.findOne({ _id: id, userId }).lean();
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? String(session.user.id) : undefined;

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonError("Invalid booking ID", 400);
    }

    await connectToDatabase();

    const booking = await loadOwnedBooking(id, userId);
    if (!booking) {
      return jsonError("Booking not found", 404);
    }

    const experience = await resolveBookingExperienceFromBooking(booking);

    return NextResponse.json({
      booking,
      experience,
    });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return jsonError("Failed to fetch booking", 500);
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? String(session.user.id) : undefined;

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonError("Invalid booking ID", 400);
    }

    await connectToDatabase();

    const existingBooking = await loadOwnedBooking(id, userId);
    if (!existingBooking) {
      return jsonError("Booking not found or unauthorized", 404);
    }

    const bookingProduct = await resolveBookingExperienceFromBooking(existingBooking);
    if (!bookingProduct) {
      return jsonError("Associated experience not found", 404);
    }

    const body = await req.json();
    const bookingDate = body.date ? new Date(body.date) : new Date(existingBooking.date);
    if (Number.isNaN(bookingDate.getTime())) {
      return jsonError("Invalid booking date", 400);
    }

    const adults = Number(body.adults ?? existingBooking.adults);
    const children = Number(body.children ?? existingBooking.children ?? 0);

    if (!Number.isFinite(adults) || adults < 1) {
      return jsonError("Adults must be at least 1", 400);
    }

    if (!Number.isFinite(children) || children < 0) {
      return jsonError("Children cannot be negative", 400);
    }

    const fullName = normalizeText(String(body.fullName ?? existingBooking.fullName));
    const email = body.email
      ? normalizeEmail(String(body.email))
      : (existingBooking.email ? normalizeEmail(existingBooking.email) : "");
    const phone = normalizeOptionalText(body.phone) || normalizeOptionalText(existingBooking.phone);

    if (!fullName) {
      return jsonError("fullName is required", 400);
    }

    if (!email) {
      return jsonError("email is required", 400);
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return jsonError("email is invalid", 400);
    }

    if (!phone) {
      return jsonError("phone is required", 400);
    }

    const timeSlot = normalizeTimeSlot(body.timeSlot) || (bookingProduct.kind === "activity" ? existingBooking.timeSlot : "Flexible");
    if (bookingProduct.kind === "activity" && !timeSlot) {
      return jsonError("timeSlot is required", 400);
    }

    const requestedSlots = adults + children;
    const hasPaymentMethodField = Object.prototype.hasOwnProperty.call(body, "paymentMethod");
    const hasWalletTypeField = Object.prototype.hasOwnProperty.call(body, "walletType");
    const transportType = resolveTransportType(body, existingBooking);
    const resolvedTransportTier =
      bookingProduct.kind === "activity" && transportType
        ? bookingProduct.transportation?.find((tier) => tier.type === transportType) || null
        : null;

    const baseSubtotal =
      bookingProduct.kind === "bundle"
        ? Number(
            body.subtotalPrice ??
            body.bundleSubtotal ??
            existingBooking.subtotalPrice ??
            Number(existingBooking.totalPrice || 0) + Number(existingBooking.discountAmount || 0)
          )
        : calculateBookingSubtotal(bookingProduct, {
            date: bookingDate,
            adults,
            children,
            transportationTier: resolvedTransportTier,
            transportType,
          });

    const preservedTransportFee = !resolvedTransportTier && transportType
      ? Number(body.transportationTier?.basePrice ?? existingBooking.transportFee ?? 0)
      : 0;

    const subtotalPrice = bookingProduct.kind === "activity"
      ? baseSubtotal + preservedTransportFee
      : baseSubtotal;

    if (!Number.isFinite(subtotalPrice) || subtotalPrice < 0) {
      return jsonError("Subtotal price is invalid", 400);
    }

    let assignedAssetId = existingBooking.assignedAssetId || null;
    if (bookingProduct.kind === "activity") {
      const availability = await getAssetAvailability(bookingProduct.id, body.date || bookingDate.toISOString(), timeSlot, id);
      if (availability < requestedSlots) {
        return jsonError("Insufficient asset capacity for this time slot. Please try another time.", 403);
      }

      assignedAssetId = body.assignedAssetId || assignedAssetId;
      if (!assignedAssetId) {
        assignedAssetId = await findAvailableAsset(bookingProduct.id, body.date || bookingDate.toISOString(), timeSlot, requestedSlots, id);
      }

      if (bookingProduct.linkedAssets.length > 0 && !assignedAssetId) {
        return jsonError("No single asset is available for the selected group size.", 403);
      }
    }

    const hasCouponCodeField = Object.prototype.hasOwnProperty.call(body, "couponCode");
    const previousCouponCode = normalizeOptionalText(existingBooking.couponCode);
    const couponCode = hasCouponCodeField
      ? normalizeOptionalText(body.couponCode)
      : normalizeOptionalText(existingBooking.couponCode);
    const { discountAmount, coupon } = await calculateCouponDiscount(
      couponCode,
      subtotalPrice,
      bookingProduct.id,
    );

    const nationality = normalizeOptionalText(body.nationality) || normalizeOptionalText(existingBooking.nationality);
    const pickupAddress = normalizeOptionalText(body.pickupAddress) || normalizeOptionalText(existingBooking.pickupAddress);
    const dropoffAddress = normalizeOptionalText(body.dropoffAddress) || normalizeOptionalText(existingBooking.dropoffAddress);

    const finalTotal = Math.max(0, subtotalPrice - discountAmount);
    const transportFee = resolvedTransportTier
      ? (resolvedTransportTier.type === "Shared"
          ? resolvedTransportTier.basePrice * requestedSlots
          : resolvedTransportTier.basePrice)
      : preservedTransportFee || Number(existingBooking.transportFee || 0);

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          date: bookingDate,
          timeSlot,
          adults,
          children,
          subtotalPrice,
          totalPrice: finalTotal,
          fullName,
          email,
          phone,
          nationality,
          couponCode: coupon?.code || null,
          discountAmount,
          productType: existingBooking.productType || bookingProduct.kind,
          isBundle: bookingProduct.kind === "bundle" || Boolean(existingBooking.isBundle),
          bundledItems: Array.isArray(existingBooking.bundledItems) ? existingBooking.bundledItems : [],
          assignedAssetId: bookingProduct.kind === "activity" ? assignedAssetId : null,
          transportType: resolvedTransportTier?.type || transportType || existingBooking.transportType || null,
          transportLabel: resolvedTransportTier?.label || body.transportationTier?.label || existingBooking.transportLabel || "",
          transportFee,
          pickupAddress,
          dropoffAddress,
          paymentMethod: hasPaymentMethodField
            ? (body.paymentMethod === "wallet" ? "wallet" : "card")
            : (existingBooking.paymentMethod || "card"),
          walletType: hasWalletTypeField
            ? (typeof body.walletType === "string" && body.walletType.trim()
                ? body.walletType.trim()
                : null)
            : (existingBooking.walletType || null),
        },
      },
      { new: true, runValidators: true, returnDocument: "after" }
    ).lean();

    if (!booking) {
      return jsonError("Booking not found or unauthorized", 404);
    }

    if (previousCouponCode && previousCouponCode !== coupon?.code) {
      try {
        const { default: CouponModel } = await import("@/models/Coupon");
        await CouponModel.findOneAndUpdate({ code: previousCouponCode }, { $inc: { usedCount: -1 } });
      } catch (couponError) {
        console.error("Failed to decrement previous coupon usage:", couponError);
      }
    }

    if (coupon && discountAmount > 0 && coupon.code !== previousCouponCode) {
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

    return NextResponse.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error: any) {
    console.error("Booking update error:", error);
    return jsonError(error?.message || "Failed to update booking", 500);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user && "id" in session.user ? session.user.id : undefined;

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonError("Invalid booking ID", 400);
    }

    await connectToDatabase();

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      { status: "cancelled" },
      { returnDocument: "after" }
    ).lean();

    if (!booking) {
      return jsonError("Booking not found", 404);
    }

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking cancel error:", error);
    return jsonError("Failed to cancel booking", 500);
  }
}
