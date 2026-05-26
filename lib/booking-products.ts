import mongoose from "mongoose";
import { calculateActivityTotal } from "@/app/lib/pricing";
import type { Activity as ActivityType, TransportTier } from "@/app/types";
import Activity from "@/models/Activity";
import "@/models/PricingRule"; // Pre-register PricingRule model for population
import Coupon from "@/models/Coupon";
import TourPackage from "@/models/TourPackage";
import { resolvePackageImages } from "@/app/lib/package-images";

export type BookingProductKind = "activity" | "package" | "bundle";

export interface BookingExperience {
  kind: BookingProductKind;
  id: string;
  title: string;
  subtitle: string;
  image: string;
  location: {
    address?: string;
    details: string;
  };
  reviewPath: string;
  bookingType: "Shared" | "Private";
  linkedAssets: string[];
  price: number;
  originalPrice?: number;
  duration: string;
  timeSlots: string[];
  maxGroupSize: number;
  transportation?: TransportTier[];
  pricingRules?: ActivityType["pricingRules"];
  dateOverrides?: ActivityType["dateOverrides"];
  category?: ActivityType["category"] | string;
  isCombo?: boolean;
  totalDays?: number;
  totalNights?: number;
  source: any;
}

export interface BookingPricingInput {
  date: Date | null;
  adults: number;
  children: number;
  transportationTier?: TransportTier | null;
  transportType?: string | null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function buildLocation(source: any, fallbackDetails: string) {
  return {
    address: source?.location?.address || "",
    details: source?.location?.details || fallbackDetails,
  };
}

function normalizeActivityExperience(activity: any): BookingExperience {
  const id = activity?.id || activity?._id?.toString() || "";
  return {
    kind: "activity",
    id,
    title: activity?.title || activity?.name || "Dubai Experience",
    subtitle: activity?.subtitle || "",
    image: activity?.image || activity?.images?.[0] || "",
    location: buildLocation(activity, activity?.subtitle || activity?.shortDescription || ""),
    reviewPath: `/activities/${id}#reviews`,
    bookingType: activity?.bookingType || "Shared",
    linkedAssets: asStringArray(activity?.linkedAssets),
    price: Number(activity?.price ?? 0),
    originalPrice: activity?.originalPrice ?? undefined,
    duration: activity?.duration || "",
    timeSlots: asStringArray(activity?.timeSlots),
    maxGroupSize: Number(activity?.maxGroupSize ?? 0),
    transportation: Array.isArray(activity?.transportation) ? activity.transportation : [],
    pricingRules: Array.isArray(activity?.pricingRules) ? activity.pricingRules : [],
    dateOverrides: Array.isArray(activity?.dateOverrides) ? activity.dateOverrides : [],
    category: activity?.category,
    isCombo: Boolean(activity?.isCombo),
    source: activity,
  };
}

function normalizePackageExperience(pkg: any): BookingExperience {
  const id = pkg?.id || pkg?._id?.toString() || "";
  const reviewSlug = pkg?.slug || pkg?.id || id;
  const { heroImage } = resolvePackageImages(pkg);

  return {
    kind: "package",
    id,
    title: pkg?.name || "Dubai Package",
    subtitle: pkg?.subtitle || pkg?.category || "",
    image: heroImage,
    location: buildLocation(
      pkg,
      pkg?.overview || pkg?.fullDescription || "Please review the attached itinerary voucher for the full schedule.",
    ),
    reviewPath: `/packages/${reviewSlug}#reviews`,
    bookingType: "Shared",
    linkedAssets: [],
    price: Number(pkg?.basePrice ?? 0),
    originalPrice: pkg?.originalPrice ?? undefined,
    duration: `${pkg?.totalDays || 1} Day${Number(pkg?.totalDays || 1) === 1 ? "" : "s"}`,
    timeSlots: [],
    maxGroupSize: Number(pkg?.maxGroupSize ?? 0),
    transportation: [],
    pricingRules: [],
    dateOverrides: [],
    category: pkg?.category,
    isCombo: Boolean(pkg?.isCombo),
    totalDays: Number(pkg?.totalDays ?? 0),
    totalNights: Number(pkg?.totalNights ?? 0),
    source: pkg,
  };
}

function normalizeBundleExperience(input: any): BookingExperience {
  const adults = Number(input?.adults ?? 0);
  const children = Number(input?.children ?? 0);
  const guestUnits = Math.max(1, adults + children * 0.5);
  const subtotal = Number(input?.bundleSubtotal ?? input?.subtotalPrice ?? input?.totalPrice ?? 0);
  const unitPrice = guestUnits > 0 ? subtotal / guestUnits : subtotal;

  return {
    kind: "bundle",
    id: input?.activityId || input?.id || input?.bundleId || "",
    title: input?.activityTitle || input?.title || "Custom Bundle",
    subtitle: input?.bundleSubtitle || "Curated multi-experience bundle",
    image: input?.bundleImage || input?.image || "",
    location: {
      address: "",
      details:
        input?.bundleSummary ||
        (Array.isArray(input?.bundledItemTitles) && input.bundledItemTitles.length > 0
          ? `Includes: ${input.bundledItemTitles.join(", ")}`
          : "Please review the full bundle itinerary in your confirmation email."),
    },
    reviewPath: "/bookings",
    bookingType: "Shared",
    linkedAssets: [],
    price: unitPrice,
    originalPrice: input?.originalPrice ?? undefined,
    duration: input?.bundleDuration || input?.duration || "Flexible",
    timeSlots: input?.timeSlot ? [input.timeSlot] : [],
    maxGroupSize: Number(input?.maxGroupSize ?? 0),
    transportation: [],
    pricingRules: [],
    dateOverrides: [],
    category: "bundle",
    isCombo: true,
    source: input,
  };
}

function findActivity(identifier: string) {
  const query: Record<string, unknown>[] = [{ id: identifier }];
  if (mongoose.isValidObjectId(identifier)) {
    query.push({ _id: identifier });
  }

  return Activity.findOne({ $or: query }).populate("pricingRules").lean();
}

function findPackage(identifier: string) {
  const query: Record<string, unknown>[] = [{ id: identifier }, { slug: identifier }];
  if (mongoose.isValidObjectId(identifier)) {
    query.push({ _id: identifier });
  }

  return TourPackage.findOne({ $or: query }).lean();
}

export async function resolveBookingExperience(input: any): Promise<BookingExperience | null> {
  if (input?.isBundle || input?.productType === "bundle") {
    return normalizeBundleExperience(input);
  }

  const identifier = input?.activityId || input?.id || input?.bookingId;
  if (!identifier) {
    return null;
  }

  const activity = await findActivity(String(identifier));
  if (activity) {
    return normalizeActivityExperience(activity);
  }

  const pkg = await findPackage(String(identifier));
  if (pkg) {
    return normalizePackageExperience(pkg);
  }

  return null;
}

export function calculateBookingSubtotal(
  experience: BookingExperience,
  options: BookingPricingInput,
) {
  const adults = Number(options.adults || 0);
  const children = Number(options.children || 0);

  if (experience.kind === "activity") {
    const transportationTier =
      options.transportationTier ||
      experience.transportation?.find((tier) => tier.type === options.transportType) ||
      null;

    return calculateActivityTotal(experience as unknown as ActivityType, {
      date: options.date,
      adults,
      children,
      transportationTier,
    }).total;
  }

  const baseRate = Number(experience.price || 0);
  const childRate = baseRate * 0.5;
  return (baseRate * adults) + (childRate * children);
}

export async function calculateCouponDiscount(
  couponCode: string,
  subtotalPrice: number,
  experienceId: string,
) {
  if (!couponCode || !Number.isFinite(subtotalPrice) || subtotalPrice < 0) {
    return { discountAmount: 0, coupon: null };
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) {
    return { discountAmount: 0, coupon: null };
  }

  const now = new Date();
  const isValid =
    (!coupon.validFrom || now >= new Date(coupon.validFrom)) &&
    (!coupon.validTo || now <= new Date(coupon.validTo)) &&
    (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses) &&
    (coupon.minOrderValue === 0 || subtotalPrice >= coupon.minOrderValue) &&
    (coupon.applicableTo !== "specific" || coupon.applicableActivityIds.includes(experienceId));

  if (!isValid) {
    return { discountAmount: 0, coupon: null };
  }

  const discountAmount =
    coupon.discountType === "percentage"
      ? Math.round((subtotalPrice * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, subtotalPrice);

  return { discountAmount, coupon };
}

export async function resolveBookingExperienceFromBooking(booking: any) {
  const recoveredSubtotal = Number(booking?.subtotalPrice || 0) || (
    Number(booking?.totalPrice || 0) + Number(booking?.discountAmount || 0)
  );

  return resolveBookingExperience({
    activityId: booking?.activityId,
    activityTitle: booking?.activityTitle,
    productType: booking?.productType,
    isBundle: booking?.isBundle,
    subtotalPrice: recoveredSubtotal,
    totalPrice: recoveredSubtotal || booking?.totalPrice,
    adults: booking?.adults,
    children: booking?.children,
    bundleImage: booking?.bundleImage,
    bundleSubtitle: booking?.bundleSubtitle,
    bundleSummary: booking?.bundleSummary,
    bundledItemTitles: booking?.bundledItemTitles,
    bundleDuration: booking?.bundleDuration,
    timeSlot: booking?.timeSlot,
  });
}
