"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { User, LogOut, ChevronRight, Edit2, Check, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Price from "../components/Price";

// UI Components
const Skeleton = ({ className }: { className: string }) => (
   <div className={`animate-pulse bg-gray-200/50 rounded-md ${className}`} />
);

export default function ProfilePage() {
   const { data: session, status, update } = useSession();
   const router = useRouter();

   const [bookings, setBookings] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [isEditing, setIsEditing] = useState(false);
   const [newName, setNewName] = useState("");
   const [updating, setUpdating] = useState(false);

   useEffect(() => {
      if (status === "unauthenticated") {
         router.push("/");
      } else if (status === "authenticated") {
         setNewName(session?.user?.name || "");
         fetchData();
      }
   }, [status, router, session]);

   const fetchData = async () => {
      try {
         const res = await fetch("/api/bookings");
         const data = await res.json();
         if (res.ok) setBookings(data.slice(0, 3));
      } catch (error) {
         console.error("Fetch error:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleUpdateName = async () => {
      if (!newName.trim() || newName === session?.user?.name) return;
      setUpdating(true);
      try {
         const res = await fetch("/api/user/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
         });
         if (res.ok) {
            await update({ name: newName });
            setIsEditing(false);
         }
      } catch (error) {
         console.error("Update error:", error);
      } finally {
         setUpdating(false);
      }
   };

   // Instant load state using Skeletons instead of a blocking spinner
   if (status === "loading") {
      return (
         <main className="min-h-screen bg-[#FAFAFA] pt-32 px-6">
            <div className="max-w-5xl mx-auto">
               <div className="flex gap-6 mb-16">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <div className="space-y-4 pt-4">
                     <Skeleton className="w-48 h-8" />
                     <Skeleton className="w-32 h-4" />
                  </div>
               </div>
               <Skeleton className="w-full h-40 mb-6" />
               <Skeleton className="w-full h-40" />
            </div>
         </main>
      );
   }

   return (
      <main className="min-h-screen bg-[#FAFAFA] text-[#111111] selection:bg-[#bb8c4b] selection:text-white pb-24">
         <Navbar hasBooking={false} onCartClick={() => { }} onAuthClick={() => { }} />

         <div className="max-w-5xl mx-auto px-6 pt-32 md:pt-40">

            {/* --- HEADER: Clean, Editorial Profile --- */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-200 pb-12">
               <div className="flex items-center gap-6 md:gap-8">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#111111] flex items-center justify-center text-[#bb8c4b] text-3xl md:text-4xl font-light uppercase shadow-sm">
                     {session?.user?.name?.[0] || "G"}
                  </div>

                  <div className="space-y-1">
                     <p className="text-xs font-semibold tracking-[0.2em] text-[#bb8c4b] uppercase">
                        Member Profile
                     </p>

                     {!isEditing ? (
                        <div className="flex items-center gap-4">
                           <h1 className="text-3xl md:text-4xl font-light tracking-tight">
                              {session?.user?.name}
                           </h1>
                           <button
                              onClick={() => setIsEditing(true)}
                              className="text-gray-400 hover:text-[#111111] transition-colors"
                           >
                              <Edit2 size={16} />
                           </button>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 mt-2">
                           <input
                              autoFocus
                              className="bg-transparent border-b border-[#bb8c4b] text-2xl md:text-3xl font-light tracking-tight outline-none pb-1 w-full max-w-[250px]"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              disabled={updating}
                           />
                           <button onClick={handleUpdateName} className="text-green-600 hover:opacity-70 p-2">
                              <Check size={20} />
                           </button>
                           <button onClick={() => setIsEditing(false)} className="text-red-500 hover:opacity-70 p-2">
                              <X size={20} />
                           </button>
                        </div>
                     )}

                     <p className="text-gray-500 text-sm md:text-base">
                        {session?.user?.email}
                     </p>
                  </div>
               </div>

               <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400 hover:text-red-500 transition-colors pb-2"
               >
                  <LogOut size={16} />
                  Sign Out
               </button>
            </section>

            {/* --- CONTENT: Recent Journeys --- */}
            <section className="pt-16">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-lg md:text-xl font-light uppercase tracking-widest text-[#111111]">
                     Recent Journeys
                  </h2>
                  <Link
                     href="/bookings"
                     className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bb8c4b] hover:text-[#111111] transition-colors flex items-center gap-1"
                  >
                     View All <ChevronRight size={14} />
                  </Link>
               </div>

               {loading ? (
                  <div className="space-y-6">
                     <Skeleton className="w-full h-32" />
                     <Skeleton className="w-full h-32" />
                  </div>
               ) : bookings.length === 0 ? (
                  <div className="py-20 text-center border border-gray-200 rounded-lg bg-white/50">
                     <p className="text-gray-500 uppercase tracking-widest text-sm mb-4">No reservations found</p>
                     <Link
                        href="/#activities"
                        className="inline-block bg-[#111111] text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#bb8c4b] transition-colors"
                     >
                        Explore Experiences
                     </Link>
                  </div>
               ) : (
                  <div className="grid gap-6">
                     {bookings.map((booking) => (
                        <div
                           key={booking._id}
                           className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-gray-100 hover:border-gray-300 transition-all rounded-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
                        >
                           <div className="flex items-center gap-6 w-full sm:w-auto">
                              {/* Minimalist Image */}
                              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 shrink-0 overflow-hidden">
                                 <Image
                                    src={booking.activityImage || "/placeholder-activity.jpg"}
                                    alt={booking.activityTitle || "Activity"}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                 />
                              </div>

                              <div className="space-y-1">
                                 <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    {format(new Date(booking.date), 'MMMM dd, yyyy')} • {booking.timeSlot}
                                 </span>
                                 <h3 className="text-lg md:text-xl font-light text-[#111111] group-hover:text-[#bb8c4b] transition-colors">
                                    {booking.activityTitle}
                                 </h3>
                                 <p className="text-xs uppercase tracking-wider text-green-600/80 font-medium">
                                    {booking.status}
                                 </p>
                              </div>
                           </div>

                           <div className="mt-6 sm:mt-0 sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                              <div className="text-xl font-light text-[#111111]">
                                 <Price amount={booking.totalPrice} />
                              </div>
                              <Link
                                 href={`/bookings/${booking._id}`}
                                 className="text-xs text-gray-400 uppercase tracking-widest hover:text-[#bb8c4b] transition-colors mt-2 flex items-center gap-1"
                              >
                                 Details <ChevronRight size={14} />
                              </Link>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>
         </div>

         <Footer />
      </main>
   );
}