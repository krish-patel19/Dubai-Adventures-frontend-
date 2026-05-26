"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, Calendar, Users, Hash, Clock, Download, Share2, ArrowRight, Loader2 } from "lucide-react";
import { BookingConfirmation } from "../types";
import { format } from "date-fns";
import Price from "./Price";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { resolveExperienceImage } from "../lib/package-images";

interface Props {
  confirmation: BookingConfirmation;
  onNewBooking: () => void;
}

const CONFETTI_COLORS = ["#ECC86A","#D4962A","#F5E0A0","#B87620","#fff","#ECC86A"];

export default function BookingSuccess({ confirmation, onNewBooking }: Props) {
  const [ready, setReady] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; color: string; delay: number; dur: number }[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    setConfetti(
      Array.from({ length: 28 }, (_, i) => ({
        x: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 1.5,
        dur: 2.5 + Math.random() * 1.5,
      }))
    );
    return () => clearTimeout(t);
  }, []);

  const handleSavePDF = async () => {
    if (!voucherRef.current) return;
    setIsGeneratingPDF(true);
    
    try {
      // Ensure all fonts are loaded before capturing
      await document.fonts.ready;
      
      const { default: jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      // Wait for 200ms to ensure any late-loading styles/images are painted
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(voucherRef.current, {
        scale: 4, // Higher resolution for "perfect" print quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        onclone: (doc) => {
          // You can modify the cloned document if needed
          const voucher = doc.getElementById('voucher-perfect');
          if (voucher) voucher.style.display = 'block';
        }
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0); // High quality JPEG
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt", // Use points for better precision
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      // Add a tiny bit of padding or fit to page
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      pdf.save(`Dubai-Adventures-Executive-Voucher-${confirmation.bookingId}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Dubai Adventure",
      text: `I just booked ${confirmation.activity.title} with Dubai Adventures! My Booking ID: ${confirmation.bookingId}`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("Booking details copied to clipboard!");
      } catch (err) {
        console.error("Clipboard failed:", err);
      }
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-5 py-20 overflow-hidden bg-gradient-to-b from-background-light to-amber-100/20">
      {/* Hidden Premium Voucher Template for PDF - Perfected Extra Premium version */}
      <div className="fixed left-[100vw] top-0 pointer-events-none overflow-hidden h-0 w-0">
        <div 
          ref={voucherRef} 
          id="voucher-perfect"
          className="w-[1000px] bg-white p-0 overflow-hidden relative"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {/* Main Gold Foil Outer Frame */}
          <div className="absolute inset-0 border-[24px] border-[#fcfbf7] z-10 pointer-events-none" />
          <div className="absolute inset-[24px] border-[1px] border-[#d4a045] z-10 pointer-events-none" />
          <div className="absolute inset-[32px] border-[4px] border-[#d4a045]/20 z-10 pointer-events-none" />

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-8 left-8 p-4 z-20">
            <div className="w-12 h-12 border-t border-l border-[#d4a045]" />
          </div>
          <div className="absolute top-8 right-8 p-4 z-20">
            <div className="w-12 h-12 border-t border-r border-[#d4a045]" />
          </div>
          <div className="absolute bottom-8 left-8 p-4 z-20">
            <div className="w-12 h-12 border-b border-l border-[#d4a045]" />
          </div>
          <div className="absolute bottom-8 right-8 p-4 z-20">
            <div className="w-12 h-12 border-b border-r border-[#d4a045]" />
          </div>

          <div className="p-24 pt-32">
            {/* Logo/Watermark Header Section */}
            <div className="flex justify-between items-start mb-20 relative">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#d4a045] rounded-full flex items-center justify-center text-white">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="text-xs tracking-[0.6em] uppercase font-black text-[#d4a045]">Dubai Adventures Executive</h4>
                </div>
                <h1 className="fd text-6xl font-light text-[#1a1612] leading-none italic">
                  Official <span className="gold-text">Voucher</span>
                </h1>
                <div className="h-0.5 w-full bg-gradient-to-r from-[#d4a045] to-transparent" />
              </div>

              <div className="flex flex-col items-end">
                <div className="bg-[#fcfbf7] border border-[#d4a045]/30 p-4 rounded-xl mb-3">
                  <p className="text-[10px] uppercase tracking-widest font-black text-[#9a9187] mb-1">Booking Confirmed</p>
                  <p className="fd text-4xl font-bold text-[#1a1612] tracking-tighter">#{confirmation.bookingId.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <Calendar size={12} className="text-[#d4a045]" />
                  <p className="text-[10px] uppercase tracking-widest font-bold font-sans">Issued: {format(new Date(), "PPP")}</p>
                </div>
              </div>
            </div>

            {/* Experience Image with Premium Overlay */}
            <div className="relative h-[550px] w-full mb-16 rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] bg-slate-100 border-[1px] border-[#d4a045]/20">
              <img 
                src={resolveExperienceImage(confirmation.activity as any)} 
                alt="" 
                className="w-full h-full object-cover" 
                style={{ objectPosition: 'center 40%' }}
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1612] via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
              
              <div className="absolute bottom-0 left-0 right-0 p-16">
                <div className="flex items-center gap-4 mb-6">
                  <span className="h-[1px] w-16 bg-[#e5c07b]" />
                  <span className="text-xs font-bold uppercase tracking-[0.5em] text-[#e5c07b]">Luxury Collection</span>
                </div>
                <h2 className="fd text-6xl font-light text-white italic leading-tight mb-4 drop-shadow-sm">
                  {confirmation.activity.title}
                </h2>
                <div className="flex items-center gap-4 text-[#e5c07b]">
                  <Hash size={16} />
                  <p className="text-xl font-medium tracking-wide uppercase">{confirmation.activity.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Premium Details Board */}
            <div className="grid grid-cols-2 gap-16 mb-20">
              <div className="space-y-12">
                {[
                  { label: "Guest Information", val: confirmation.fullName, sub: "Primary Adventurer" },
                  { label: "Arrival Date", val: format(confirmation.date, "EEEE, MMMM do, yyyy"), sub: "Confirmed Schedule" },
                ].map((item) => (
                  <div key={item.label} className="pl-8 border-l-[1px] border-[#d4a045]/40 relative">
                    <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-[#d4a045]" />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#9a9187] mb-2">{item.label}</p>
                    <p className="text-3xl font-medium text-[#1a1612] tracking-tight">{item.val}</p>
                    <p className="text-xs text-[#d4a045] mt-1 italic opacity-70">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-12">
                {[
                  { label: "Preferred Time", val: confirmation.timeSlot, sub: "Local Dubai Time" },
                  { label: "Traveling Party", val: `${confirmation.adults} Adults ${confirmation.children > 0 ? `+ ${confirmation.children} Children` : ""}`, sub: "Total Group Size" },
                ].map((item) => (
                  <div key={item.label} className="pl-8 border-l-[1px] border-[#d4a045]/40 relative">
                    <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-[#d4a045]" />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#9a9187] mb-2">{item.label}</p>
                    <p className="text-3xl font-medium text-[#1a1612] tracking-tight">{item.val}</p>
                    <p className="text-xs text-[#d4a045] mt-1 italic opacity-70">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Payment Seal Section */}
            <div className="flex gap-16 items-center bg-[#fcfbf7] p-12 rounded-[40px] border border-[#d4a045]/10 mb-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a045]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-sm">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">Payment Status: Confirmed</p>
                    <p className="text-[10px] text-[#9a9187] font-sans mt-0.5 uppercase tracking-widest">Transaction Secured via Luxury Gateway</p>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-emerald-500/20 to-transparent mb-4" />
                <p className="text-xs text-[#645c55] leading-relaxed italic max-w-sm">
                  This document serves as proof of full payment and is non-transferable.
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.5em] font-black text-[#9a9187] mb-2">Total Value Secured</p>
                <div className="flex items-baseline justify-end gap-2">
                  <Price 
                    amount={confirmation.totalPrice} 
                    className="fd text-6xl font-normal text-[#1a1612] leading-none tracking-tighter" 
                  />
                </div>
              </div>
            </div>

            {/* Footer with Concierge Details & QR Placeholder */}
            <div className="flex justify-between items-end pt-12 border-t border-black/5">
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1a1612] mb-3">Concierge Assistance</h5>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                    <p className="text-xs text-[#645c55] font-sans italic font-medium">Concierge: hello@dubaiadventures.com</p>
                    <p className="text-xs text-[#645c55] font-sans italic font-medium">Hotline: +971 4 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 opacity-50">
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#1a1612]">Official Document</span>
                  <div className="h-px w-24 bg-black/10" />
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#1a1612]">Page 01 of 01</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-6 text-right">
                {/* Executive Seal Watermark - More Premium */}
                <div className="w-32 h-32 rounded-full border-[1.5px] border-[#d4a045] flex flex-col items-center justify-center p-3 relative bg-[#fcfbf7] shadow-sm">
                  <div className="absolute inset-1.5 border-[0.5px] border-[#d4a045]/40 rounded-full" />
                  <div className="absolute inset-2 border-[1px] border-dashed border-[#d4a045]/20 rounded-full animate-spin-slow" />
                  <p className="text-[8px] uppercase font-black tracking-tighter text-[#1a1612] mb-1">CERTIFIED</p>
                  <div className="w-10 h-10 my-1">
                    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full text-[#d4a045]">
                      <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 16L15 19L20 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[8px] uppercase font-black tracking-tighter text-[#1a1612]">LUXURY BOARD</p>
                </div>
                <p className="text-[10px] text-[#9a9187] max-w-[320px] leading-relaxed italic font-serif">
                  *Present this digital or printed executive voucher upon arrival at the venue concierge desk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ready && confetti.map((c, i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-2 rounded-sm pointer-events-none animate-confetti-drop"
          style={{
            left: `${c.x}%`,
            backgroundColor: c.color,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient(ellipse at 50% 40%, rgba(212,150,42,0.07) 0%, transparent 60%)" />

      <div className="relative z-10 max-w-lg w-full text-center">
        <div className={cn("relative w-32 h-32 mx-auto mb-8", ready ? "a-scale" : "opacity-0")}>
          <div className="absolute inset-0 rounded-full bg-primary/10 border-2 border-primary/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle size={52} className={cn("text-primary-light drop-shadow-lg", ready ? "check-in" : "opacity-0")} />
          </div>
        </div>

        <p className={cn("text-sm tracking-widest uppercase font-semibold mb-3 text-primary", ready ? "a-up d1" : "opacity-0")}>
          ✦ Booking Confirmed
        </p>

        <h2 className={cn("fd text-4xl sm:text-5xl font-light leading-tight mb-5 text-text-dark", ready ? "a-up d2" : "opacity-0")}>
          Your Dubai adventure<br />
          <em className="gold-text not-italic">is confirmed!</em>
        </h2>

        <p className={cn("text-base leading-relaxed mb-10 max-w-sm mx-auto text-text-muted-dark", ready ? "a-up d3" : "opacity-0")}>
          Thank you, <strong className="text-text-dark">{confirmation.fullName}</strong>! A confirmation has been sent to <strong className="text-primary-dark">{confirmation.email}</strong>.
        </p>

        <div className={cn("rounded-2xl overflow-hidden mb-8 text-left bg-background-card-light border-2 border-[#D4A744] shadow-xl", ready ? "a-up2 d3" : "opacity-0")}>
          <div className="relative h-44 overflow-hidden rounded-t-[14px] border-b-0">
            <Image 
              src={resolveExperienceImage(confirmation.activity as any)} 
              alt={confirmation.activity.title} 
              fill 
              className="object-cover"
              unoptimized
              sizes="(max-width: 640px) 100vw, 512px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="fd text-lg font-medium text-white leading-snug">{confirmation.activity.title}</p>
              <p className="text-xs mt-0.5 text-primary-light">{confirmation.activity.subtitle}</p>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: <Hash size={14}/>, label: "Booking ID", val: confirmation.bookingId },
                { icon: <Calendar size={14}/>, label: "Date", val: format(confirmation.date, "MMM d, yyyy") },
                { icon: <Clock size={14}/>, label: "Time", val: confirmation.timeSlot },
                { icon: <Users size={14}/>, label: "Guests", val: `${confirmation.adults}A${confirmation.children ? ` · ${confirmation.children}C` : ""}` },
              ].map((d) => (
                <div key={d.label} className="p-3 rounded-xl bg-secondary/5 border border-border-light">
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5 text-text-muted-dark">
                    <span className="text-primary">{d.icon}</span>
                    {d.label}
                  </p>
                  <p className="text-sm font-semibold text-text-dark">{d.val}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-sm uppercase tracking-wider text-text-muted-dark">Total Paid</span>
              <span className="fd text-3xl font-medium gold-text leading-none">
                <Price amount={confirmation.totalPrice} />
              </span>
            </div>
          </div>
        </div>

        <div className={cn("flex items-center justify-center gap-3 flex-wrap", ready ? "a-up d4" : "opacity-0")}>
          <button className="btn btn-primary" onClick={onNewBooking}>
            Book Another <ArrowRight size={16} className="ml-1" />
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={handleSavePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" /> 
                Processing...
              </>
            ) : (
              <>
                <Download size={14} className="mr-2" /> 
                Save PDF
              </>
            )}
          </button>
          <button className="btn btn-ghost" onClick={handleShare}>
            <Share2 size={14} className="mr-2" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
