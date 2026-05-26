"use client";

import { useEffect, useState, use } from "react";
import { Activity, TransportTier } from "../../types";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import dynamic from "next/dynamic";

// ─── Lazy-load heavy components ───
const Footer = dynamic(() => import("../../components/Footer"), {
  loading: () => <div className="h-64 bg-background-light" />,
  ssr: false,
});

const AuthModal = dynamic(() => import("../../components/AuthModal"), {
  ssr: false,
});

const ActivityDetails = dynamic(
  () => import("../../components/ActivityCard").then(mod => ({ default: mod.ActivityDetails })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-primary uppercase tracking-widest">Loading Experience...</p>
      </div>
    ),
    ssr: false,
  }
);

export default function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetch(`/api/activities/${id}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Received non-JSON response");
          }
          return res.json();
        })
        .then((data) => {
          setActivity(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching activity", err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSelect = (selectedActivity: Activity, options: { date: Date | null, adults: number, children: number, transport: TransportTier | null }) => {
    const activityId = selectedActivity.id || (selectedActivity as any)._id;
    let url = `/book/${activityId}?adults=${options.adults}&children=${options.children}`;
    if (options.date) url += `&date=${format(options.date, "yyyy-MM-dd")}`;
    if (options.transport) url += `&transport=${options.transport.type}`;
    router.push(url);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background-light">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-primary uppercase tracking-widest">Loading Experience...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-background-light">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-5">
          <h1 className="text-2xl font-bold text-text-dark mb-4">Activity Not Found</h1>
          <p className="text-text-muted-dark mb-8">We couldn&apos;t find the activity you&apos;re looking for.</p>
          <button 
            onClick={() => router.push("/")}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-widest transition-all hover:scale-105"
          >
            Back to Home
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background-light relative">
      <div className="absolute top-0 inset-x-0 z-50">
        <Navbar 
          hasBooking={false}
          onCartClick={() => {
            // No global cart on this page yet, but we'll follow the standard pattern
          }}
          onAuthClick={(mode: "login" | "signup") => {
            setAuthMode(mode);
            setIsAuthModalOpen(true);
          }}
        />
      </div>

      <ActivityDetails 
        activity={activity} 
        isSelected={false} 
        onSelect={handleSelect} 
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <Footer />
    </main>
  );
}
