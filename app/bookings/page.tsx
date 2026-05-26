"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, MapPin, Users, ChevronRight, 
  Trash2, Edit3, Briefcase, Compass, ShieldCheck, Download 
} from "lucide-react";
import Price from "../components/Price";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsAuthModalOpen(true);
    } else if (status === "authenticated") {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this adventure?")) return;
    
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
      }
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading && status !== "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm tracking-widest uppercase font-semibold text-primary">Retrieving Your Journeys</p>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-light selection:bg-primary/20">
      <Navbar
        hasBooking={false}
        onCartClick={() => {}}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#bb8c4b08,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="w-12 h-[1px] bg-primary/40 block" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Guest Portal</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-light tracking-tight text-text-dark leading-[1.1]">
                Your <em className="gold-text not-italic font-medium">Adventures</em>
              </h1>
              <p className="text-[15px] text-text-muted-dark font-medium leading-relaxed max-w-lg">
                Manage your elite desert experiences and customized tours. Review dates, adjust guests, or plan your next journey.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted-dark opacity-40 mb-1">Total Verified</p>
                <p className="text-3xl font-light text-text-dark">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
              <div className="w-[1px] h-12 bg-border-light" />
              <Link href="/#activities" className="btn btn-primary h-14 px-8 rounded-2xl flex items-center gap-3 transition-all active:scale-95">
                <Compass size={18} />
                Explore More
              </Link>
            </div>
          </div>

          {bookings.length === 0 && !loading ? (
            <div className="bg-white rounded-[40px] border-2 border-[#D4A744] p-20 text-center space-y-8 shadow-sm">
              <div className="w-24 h-24 rounded-full bg-amber-50 mx-auto flex items-center justify-center border border-amber-100/50">
                <Briefcase size={40} className="text-primary/40" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-text-dark">No bookings yet</h3>
                <p className="text-text-muted-dark max-w-sm mx-auto font-medium">
                  Your journey hasn't started. Discover our curated collection of luxury Dubai adventures.
                </p>
              </div>
              <Link href="/#activities" className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[11px] hover:gap-4 transition-all group">
                Begin Exploration <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {bookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className={cn(
                    "group relative bg-white rounded-[48px] border-2 border-[#D4A744] p-8 md:p-10 transition-all duration-500 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] hover:-translate-y-2",
                    booking.status === 'cancelled' && "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <span className={cn(
                           "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                           booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                         )}>
                           {booking.status}
                         </span>
                         <span className="text-[10px] font-bold text-text-muted-dark tracking-wide">Ref: #{booking._id.slice(-6).toUpperCase()}</span>
                       </div>
                       <h3 className="text-2xl font-medium text-text-dark group-hover:text-primary transition-colors">{booking.activityTitle}</h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted-dark opacity-50 mb-1">Total Investment</p>
                      <p className="text-2xl font-light text-primary font-mono">
                        <Price amount={booking.totalPrice} />
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-10 border-b border-border-light/50">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-text-muted-dark opacity-40">
                          <Calendar size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
                        </div>
                        <p className="text-xs font-bold text-text-dark">{format(new Date(booking.date), 'MMM dd, yyyy')}</p>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-text-muted-dark opacity-40">
                          <Clock size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Time</span>
                        </div>
                        <p className="text-xs font-bold text-text-dark">{booking.timeSlot}</p>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-text-muted-dark opacity-40">
                          <Users size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Guests</span>
                        </div>
                        <p className="text-xs font-bold text-text-dark">{booking.adults}A, {booking.children}C</p>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-text-muted-dark opacity-40">
                          <ShieldCheck size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Protection</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-500">Secure</p>
                     </div>
                  </div>

                  <div className="pt-8 flex flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <Link 
                          href={`/bookings/${booking._id}/edit`}
                          className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-50 text-primary text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-white active:scale-95",
                            booking.status === 'cancelled' && "pointer-events-none opacity-50"
                          )}
                        >
                          <Edit3 size={14} />
                          Customize
                        </Link>
                        {booking.status === 'confirmed' && (
                          <a 
                            href={`/api/bookings/${booking._id}/voucher`}
                            download
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-emerald-600 hover:text-white active:scale-95"
                          >
                            <Download size={14} />
                            Voucher
                          </a>
                        )}
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-border-light text-text-muted-dark text-[11px] font-bold uppercase tracking-widest transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            {cancellingId === booking._id ? "Processing..." : "Cancel"}
                          </button>
                        )}
                     </div>
                     <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-background-light border border-border-light">
                        <MapPin size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted-dark opacity-60">Dubai, UAE</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
