"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, BookingState, BookingConfirmation } from "../../types";
import Navbar from "../../components/Navbar";
import BookingSteps from "../../components/BookingSteps";
import BookingSidebar from "../../components/BookingSidebar";
import BookingSuccess from "../../components/BookingSuccess";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { Separator } from "../../components/ui/separator";
import { calculateActivityTotal } from "../../lib/pricing";
import { resolvePackageImages } from "../../lib/package-images";

const INIT_STATE = {
  activity: null, date: null, timeSlot: "",
  adults: 1, children: 0,
  fullName: "", email: "", phone: "", nationality: "",
  paymentMethod: "card" as "card" | "wallet",
  walletType: null as "apple" | "google" | null,
  productType: "activity" as "activity" | "package" | "bundle",
};

export default function BookPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [booking, setBooking] = useState<BookingState>(INIT_STATE);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialDateParam = searchParams?.get("date");
  const initialTimeParam = searchParams?.get("time");

  const initialAdults = parseInt(searchParams?.get("adults") || "1");
  const initialChildren = parseInt(searchParams?.get("children") || "0");
  const initialTransportParam = searchParams?.get("transport");

  useEffect(() => {
    setLoading(true);
    setConfirmation(null);
    setIsSubmitting(false);

    fetch(`/api/activities/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          fetch(`/api/packages/${params.id}`)
            .then(res => res.json())
            .then(pkgData => {
              if (pkgData.error) {
                router.push("/");
                return;
              }
              // Normalize TourPackage to align with Activity interfaces
              const { heroImage, galleryImages } = resolvePackageImages(pkgData);
              const normalizedActivity = {
                ...pkgData,
                title: pkgData.name,
                price: pkgData.basePrice,
                image: heroImage,
                images: galleryImages,
              };
              
              setActivity(normalizedActivity);
              const initialDate = initialDateParam ? new Date(initialDateParam) : null;
              const defaultTimeSlot = initialTimeParam || "Flexible";
              const totalDays = pkgData.totalDays || 1;
              let pkgStartDate: Date | null = null;
              let pkgEndDate: Date | null = null;
              if (initialDate) {
                pkgStartDate = initialDate;
                pkgEndDate = new Date(initialDate);
                pkgEndDate.setDate(pkgEndDate.getDate() + (totalDays - 1));
              }
              setBooking({
                ...INIT_STATE,
                activity: normalizedActivity,
                date: initialDate,
                timeSlot: defaultTimeSlot,
                adults: initialAdults,
                children: initialChildren,
                productType: "package",
                transportationTier: null,
                packageStartDate: pkgStartDate,
                packageEndDate: pkgEndDate,
              });
              setLoading(false);
            })
            .catch(() => {
              console.error("Error fetching package");
              router.push("/");
            });
          return;
        }

        setActivity(data);

        const initialDate = initialDateParam ? new Date(initialDateParam) : null;
        const initialTime = initialTimeParam || "";
        const initialTransport = data.transportation?.find((t: any) => t.type === initialTransportParam && t.isAvailable) || null;


        setBooking({
          ...INIT_STATE,
          activity: data,
          date: initialDate,
          timeSlot: initialTime || (data.timeSlots?.length ? "" : "Flexible"),

          adults: initialAdults,
          children: initialChildren,
          productType: "activity",
          transportationTier: initialTransport
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching activity", err);
        router.push("/");
      });
  }, [params.id, router, initialDateParam, initialTimeParam, initialTransportParam, initialAdults, initialChildren]);

  const handleUpdate = useCallback((u: Partial<BookingState>) => {
    setBooking((p) => ({ ...p, ...u }));
  }, []);

  // --- Real-time Price Calculation ---
  const calculateTotalPrice = useCallback(() => {
    if (!booking.activity) return 0;
    const { activity, date, adults, children, transportationTier } = booking;

    const breakdown = calculateActivityTotal(activity, {
      date,
      adults,
      children,
      transportationTier
    });

    return breakdown.total;
  }, [booking]);

  const totalPrice = calculateTotalPrice();

  const handleConfirm = useCallback(async () => {
    if (!booking.activity || !booking.date) return;
    if (!session) {
      setAuthMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const productType = booking.productType || ((booking.activity as any)?.totalDays ? "package" : "activity");
      const subtotalPrice = totalPrice;
      const finalTotalPrice = subtotalPrice - (booking.discountAmount ?? 0);
      const timeSlot = booking.timeSlot || (productType === "package" ? "Flexible" : "");

      // Compute package start/end dates for multi-day packages
      const totalDays = (booking.activity as any)?.totalDays || 1;
      const isPackageBooking = productType === "package" && totalDays > 1;
      let packageStartDate: string | null = null;
      let packageEndDate: string | null = null;
      if (isPackageBooking && booking.date) {
        packageStartDate = booking.date.toISOString();
        const endDate = new Date(booking.date);
        endDate.setDate(endDate.getDate() + (totalDays - 1));
        packageEndDate = endDate.toISOString();
      }

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
          productType,
          transportType: booking.transportationTier?.type || null,
          transportationTier: booking.transportationTier || null,
          transportFee: booking.activity ? calculateActivityTotal(booking.activity, {
            date: booking.date,
            adults: booking.adults,
            children: booking.children,
            transportationTier: booking.transportationTier
          }).transportationFee : 0,
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
          packageStartDate,
          packageEndDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || "Something went wrong creating your booking.");
        return;
      }

      setConfirmation({
        bookingId: data.bookingId,
        activity: booking.activity,
        date: booking.date,
        timeSlot,
        adults: booking.adults,
        children: booking.children,
        totalPrice: finalTotalPrice,
        transportType: booking.transportationTier?.type,
        transportFee: booking.activity ? calculateActivityTotal(booking.activity, {
          date: booking.date,
          adults: booking.adults,
          children: booking.children,
          transportationTier: booking.transportationTier
        }).transportationFee : 0,
        fullName: booking.fullName,
        email: booking.email,
        nationality: booking.nationality,
        paymentStatus: "paid",
        packageStartDate: packageStartDate ? new Date(packageStartDate) : null,
        packageEndDate: packageEndDate ? new Date(packageEndDate) : null,
      });
    } catch (error) {
      console.error(error);
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }, [booking, totalPrice, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm tracking-widest uppercase font-semibold text-primary">Preparing Your Adventure</p>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <main className="min-h-screen">
        <Navbar hasBooking={false} onAuthClick={() => { }} onCartClick={() => { }} />
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
        onCartClick={() => { }}
        onAuthClick={(mode: "login" | "signup") => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <div className="pt-24 lg:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
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

            <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-32">
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
