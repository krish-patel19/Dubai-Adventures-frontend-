"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, BookingState, BookingConfirmation } from "../../types";
import Navbar from "../../components/Navbar";
import BookingSteps from "../../components/BookingSteps";
import BookingSidebar from "../../components/BookingSidebar";
import BookingSuccess from "../../components/BookingSuccess";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { Sparkles } from "lucide-react";

const INIT_STATE = {
  activity: null, date: null, timeSlot: "",
  adults: 1, children: 0,
  fullName: "", email: "", phone: "", nationality: "",
  productType: "bundle" as "activity" | "package" | "bundle",
  paymentMethod: "card" as "card" | "wallet",
  walletType: null as "apple" | "google" | null,
};

export default function BundleBookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [booking, setBooking] = useState<BookingState>(INIT_STATE);
  const [bundleData, setBundleData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const saved = localStorage.getItem("pending_bundle");
    if (!saved) {
      router.push("/");
      return;
    }

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.items) || data.items.length < 1) {
        localStorage.removeItem("pending_bundle");
        router.push("/");
        return;
      }

      // Construct a valid Activity-like object from the bundle data
      const guestCap = Math.max(
        1,
        Math.min(...data.items.map((i: any) => Number(i.maxGroupSize || 1)))
      );
      const virtualActivity: Activity = {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        price: data.price, // This is the discounted per-person price
        originalPrice: data.originalPrice,
        duration: "Flexible (Tours TBD)",
        category: "luxury",
        shortDescription: "Your custom selected premium experiences bundled for the best value.",
        fullDescription: "Includes: " + data.items.map((i: any) => i.title).join(", "),
        rating: 5,
        reviewCount: 0,
        highlights: data.items.flatMap((i: any) => i.highlights || []),
        included: data.items.flatMap((i: any) => i.included || []),
        timeSlots: ["Morning (08:30)", "Afternoon (14:30)", "Evening (19:00)"], // Generic slots for bundles
        maxGroupSize: guestCap,
        experienceCategories: ["super-savers"],
        notIncluded: [],
        whatToBring: [],
        safetyRestrictions: [],
        bookingType: "Shared"
      };

      setActivity(virtualActivity);
      setBundleData(data);
      setBooking({ ...INIT_STATE, activity: virtualActivity, productType: "bundle" });
      setLoading(false);
    } catch (e) {
      console.error("Failed to parse bundle", e);
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setAuthMode("login");
      setIsAuthModalOpen(true);
    }
  }, [status]);

  const handleUpdate = useCallback((u: Partial<BookingState>) => {
    setBooking((p) => ({ ...p, ...u }));
  }, []);

  const totalPrice = (booking.activity?.price ?? 0) * (booking.adults + booking.children * 0.5);

  const handleConfirm = useCallback(async () => {
    if (!booking.activity || !booking.date || !session) return;

    setIsSubmitting(true);
    try {
      const subtotalPrice = totalPrice;
      const finalTotalPrice = subtotalPrice - (booking.discountAmount ?? 0);
      const bundleItems = Array.isArray(bundleData?.items) ? bundleData.items : [];
      const timeSlot = booking.timeSlot || "Flexible";

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: booking.activity.id,
          activityTitle: booking.activity.title,
          date: booking.date.toISOString(),
          timeSlot,
          adults: booking.adults,
          children: booking.children,
          productType: "bundle",
          subtotalPrice,
          totalPrice: finalTotalPrice,
          fullName: booking.fullName,
          email: booking.email,
          phone: booking.phone,
          nationality: booking.nationality,
          pickupAddress: booking.pickupAddress || "",
          dropoffAddress: booking.dropoffAddress || "",
          couponCode: booking.couponCode || null,
          discountAmount: booking.discountAmount || 0,
          paymentMethod: booking.paymentMethod || "card",
          walletType: booking.walletType || null,
          isBundle: true,
          bundleSubtotal: subtotalPrice,
          bundleSubtitle: bundleData?.subtitle || "",
          bundleImage: bundleData?.image || "",
          bundleDuration: booking.activity.duration || "Flexible",
          bundleSummary: bundleItems.map((i: any) => i.title).join(", "),
          bundledItems: bundleItems.map((i: any) => i.id),
          bundledItemTitles: bundleItems.map((i: any) => i.title),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || "Something went wrong.");
        return;
      }

      localStorage.removeItem("pending_bundle");

      setConfirmation({
        bookingId: data.bookingId,
        activity: booking.activity,
        date: booking.date,
        timeSlot,
        adults: booking.adults,
        children: booking.children,
        totalPrice: finalTotalPrice,
        fullName: booking.fullName,
        email: booking.email,
        nationality: booking.nationality,
        paymentStatus: "paid",
      });
    } catch (error) {
      console.error(error);
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }, [booking, totalPrice, session, bundleData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
          <div className="flex flex-col items-center gap-4">
            <Sparkles size={32} className="text-[#d4962a] animate-pulse" />
            <p className="text-sm tracking-widest uppercase font-semibold text-primary">Assembling Your Premium Bundle</p>
          </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <main className="min-h-screen">
        <Navbar hasBooking={false} onAuthClick={() => {}} onCartClick={() => {}} />
        <div className="pt-20">
            <BookingSuccess confirmation={confirmation} onNewBooking={() => router.push("/")} />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background-light">
      <Navbar
        hasBooking={!!booking.activity}
        onCartClick={() => {}}
        onAuthClick={(mode: "login" | "signup") => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <div className="pt-24 lg:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="mb-8 p-4 rounded-2xl bg-[#0B0B0A] border border-[#d4962a]/30 flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#d4962a]/20 flex items-center justify-center text-[#d4962a]">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h1 className="text-white font-bold">Bundle Booking Unlock</h1>
                    <p className="text-xs text-gray-400">You are booking a custom collection of experiences with tiered savings applied.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
                <div className="flex-1 min-w-0 w-full">
                    <BookingSteps
                        booking={booking}
                        totalPrice={totalPrice}
                        onUpdate={handleUpdate}
                        onConfirm={handleConfirm}
                        onCancel={() => router.push("/")}
                        isSubmitting={isSubmitting}
                    />
                </div>
                
                <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-24">
                    <BookingSidebar
                        booking={booking}
                        totalPrice={totalPrice}
                        discountAmount={booking.discountAmount ?? 0}
                        couponCode={booking.couponCode}
                        onRemove={() => router.push("/")}
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
        initialMode={authMode}
      />
      <Footer />
    </main>
  );
}
