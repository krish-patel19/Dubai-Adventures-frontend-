"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookingState } from "../../../types";
import Navbar from "../../../components/Navbar";
import BookingSteps from "../../../components/BookingSteps";
import BookingSidebar from "../../../components/BookingSidebar";
import Footer from "../../../components/Footer";
import AuthModal from "../../../components/AuthModal";
import { CheckCircle2, ChevronLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateActivityTotal } from "../../../lib/pricing";
import { resolveExperienceImage } from "../../../lib/package-images";

function buildActivityFromExperience(experience: any, booking: any) {
  if (!experience) return null;

  return {
    ...experience.source,
    kind: experience.kind,
    id: experience.id,
    title: experience.title,
    subtitle: experience.subtitle,
    image: resolveExperienceImage(experience.source ?? experience),
    price: experience.price,
    duration: experience.duration,
    timeSlots: Array.isArray(experience.timeSlots) ? experience.timeSlots : [],
    maxGroupSize: experience.maxGroupSize || Math.max(1, Number(booking.adults || 0) + Number(booking.children || 0)),
    bookingType: experience.bookingType || "Shared",
    linkedAssets: Array.isArray(experience.linkedAssets) ? experience.linkedAssets : [],
    transportation: Array.isArray(experience.transportation) ? experience.transportation : [],
    pricingRules: Array.isArray(experience.pricingRules) ? experience.pricingRules : [],
    dateOverrides: Array.isArray(experience.dateOverrides) ? experience.dateOverrides : [],
    category: experience.category || "luxury",
    totalDays: experience.totalDays,
    totalNights: experience.totalNights,
  };
}

function buildFallbackActivity(found: any) {
  const baseSubtotal = Number(found.subtotalPrice ?? found.totalPrice ?? 0);
  const guestUnits = Math.max(1, Number(found.adults || 0) + Number(found.children || 0) * 0.5);
  const perGuestPrice = found.isBundle || found.productType === "bundle" || found.productType === "package"
    ? baseSubtotal / guestUnits
    : Number(found.activityPrice ?? found.bundleBasePrice ?? found.price ?? (baseSubtotal / guestUnits));

  return {
    id: found.activityId,
    title: found.activityTitle,
    subtitle: found.bundleSubtitle || "",
    image: found.bundleImage || "",
    price: perGuestPrice,
    duration: found.bundleDuration || "Flexible",
    category: "luxury",
    shortDescription: found.bundleSummary || "",
    fullDescription: found.bundleSummary || "",
    rating: 5,
    reviewCount: 0,
    highlights: [],
    included: [],
    timeSlots: found.productType === "activity" && found.timeSlot ? [found.timeSlot] : [],
    maxGroupSize: Math.max(1, Number(found.adults || 0) + Number(found.children || 0)),
    notIncluded: [],
    whatToBring: [],
    safetyRestrictions: [],
    bookingType: "Shared",
    linkedAssets: [],
    transportation: [],
  };
}

function calculateBookingSubtotal(activity: any, booking: any) {
  if (!activity) return 0;

  const bookingKind = booking.productType || activity.kind || "activity";

  if (bookingKind === "activity") {
    return calculateActivityTotal(activity as any, {
      date: booking.date,
      adults: booking.adults,
      children: booking.children,
      transportationTier: booking.transportationTier,
    }).total;
  }

  const baseRate = Number(activity.price || 0);
  const childRate = activity.childPrice ?? (baseRate * 0.5);
  return (baseRate * booking.adults) + (childRate * booking.children);
}

export default function EditBookingPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`);
      const payload = await res.json();
      if (!res.ok) {
        router.push("/bookings");
        return;
      }

      const found = payload.booking ?? payload;
      const experience = payload.experience ?? null;
      const activity = experience
        ? buildActivityFromExperience(experience, found)
        : buildFallbackActivity(found);

      const selectedTier =
        found.transportType && Array.isArray(activity.transportation)
          ? activity.transportation.find((tier: any) => tier.type === found.transportType) || {
              type: found.transportType,
              label: found.transportLabel || found.transportType,
              capacity: 0,
              basePrice: Number(found.transportFee || 0),
              pickupLocation: found.pickupAddress || "",
              dropoffLocation: found.dropoffAddress || "",
              features: [],
              isAvailable: true,
            }
          : null;

      setBooking({
        activity,
        date: new Date(found.date),
        timeSlot: found.timeSlot || (activity.timeSlots?.length ? "" : "Flexible"),
        adults: found.adults,
        children: found.children,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone || "",
        nationality: found.nationality || "",
        couponCode: found.couponCode,
        discountAmount: found.discountAmount,
        transportationTier: selectedTier,
        paymentMethod: found.paymentMethod || "card",
        walletType: found.walletType || null,
        pickupAddress: found.pickupAddress || "",
        dropoffAddress: found.dropoffAddress || "",
        productType: found.productType || (found.isBundle ? "bundle" : experience?.kind || "activity"),
      });
    } catch (error) {
      console.error("Fetch error:", error);
      router.push("/bookings");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsAuthModalOpen(true);
    } else if (status === "authenticated") {
      void fetchBooking();
    }
  }, [status, fetchBooking]);

  const handleUpdate = useCallback((u: Partial<BookingState>) => {
    setBooking((p) => (p ? { ...p, ...u } : null));
  }, []);

  const totalPrice = booking?.activity
    ? calculateBookingSubtotal(booking.activity as any, {
        date: booking.date,
        adults: booking.adults,
        children: booking.children,
        transportationTier: booking.transportationTier,
        transportType: booking.transportationTier?.type || null,
      })
    : 0;

  const handleSave = async () => {
    if (!booking || !session) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: booking.date?.toISOString(),
          timeSlot: booking.timeSlot,
          adults: booking.adults,
          children: booking.children,
          subtotalPrice: totalPrice,
          totalPrice: totalPrice - (booking.discountAmount ?? 0),
          fullName: booking.fullName,
          email: booking.email,
          phone: booking.phone,
          nationality: booking.nationality,
          couponCode: booking.couponCode || null,
          discountAmount: booking.discountAmount || 0,
          paymentMethod: booking.paymentMethod || "card",
          walletType: booking.walletType || null,
          transportType: booking.transportationTier?.type || null,
          transportationTier: booking.transportationTier || null,
          pickupAddress: booking.pickupAddress || "",
          dropoffAddress: booking.dropoffAddress || "",
          productType: booking.productType || "activity",
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => {
          router.push("/bookings");
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update booking");
      }
    } catch (error) {
      console.error(error);
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm tracking-widest uppercase font-semibold text-primary">Synchronizing Changes</p>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isSaved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm animate-bounce">
                <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-medium text-text-dark tracking-tight">Adventure Customized</h2>
                <p className="text-text-muted-dark font-medium">Your schedule has been updated successfully.</p>
            </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <main className="min-h-screen bg-background-light">
      <Navbar
        hasBooking={true}
        onCartClick={() => {}}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <div className="pt-24 lg:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="mb-10 flex items-center justify-between">
                <button 
                  onClick={() => router.back()}
                  className="group flex items-center gap-3 text-text-muted-dark hover:text-primary transition-colors pr-6"
                >
                    <div className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center group-hover:border-primary/30 transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return to Bookings</span>
                </button>
                <div className="hidden sm:flex items-center gap-3">
                   <Save size={14} className="text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Live Edit Mode</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
                <div className="flex-1 min-w-0 w-full">
                    <BookingSteps
                        booking={booking}
                        totalPrice={totalPrice}
                        onUpdate={handleUpdate}
                        onConfirm={handleSave}
                        onCancel={() => router.push("/bookings")}
                        isSubmitting={isSubmitting}
                    />
                </div>
                
                <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-24">
                    <BookingSidebar
                        booking={booking}
                        totalPrice={totalPrice}
                        discountAmount={booking.discountAmount ?? 0}
                        couponCode={booking.couponCode}
                        onRemove={() => router.push("/bookings")}
                        onEdit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    />
                </div>
            </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (!session) router.push("/");
        }}
        initialMode="login"
      />
      <Footer />
    </main>
  );
}
