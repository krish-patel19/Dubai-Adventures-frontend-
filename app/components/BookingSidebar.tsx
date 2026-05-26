"use client";

import Image from "next/image";
import { X, Clock, Users, Calendar, Shield, RotateCcw, CreditCard, Pencil, Truck, Bus, Car, Crown } from "lucide-react";
import { BookingState } from "../types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Price from "./Price";
import { useCurrency } from "../context/CurrencyContext";
import { resolveExperienceImage } from "../lib/package-images";

interface Props {
  booking: BookingState;
  totalPrice: number;
  discountAmount?: number;
  couponCode?: string;
  onRemove: () => void;
  onEdit: () => void;
}

export default function BookingSidebar({ booking, totalPrice, discountAmount = 0, couponCode, onRemove, onEdit }: Props) {
  if (!booking.activity) return null;
  const finalPrice = totalPrice - discountAmount;
  const { symbol } = useCurrency();

  // Determine Effective Base Rate
  let effectiveBaseRate = booking.activity.price;
  if (booking.date && booking.activity.dateOverrides) {
    const dateStr = booking.date.toISOString().split('T')[0];
    const override = booking.activity.dateOverrides.find(o => o.date === dateStr);
    if (override) effectiveBaseRate = override.price;
  }

  return (
    <div className="rounded-[2.5rem] overflow-hidden bg-white border-2 border-[#D4A744] shadow-2xl flex flex-col">
      {/* Activity Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[#D4A744]/20">
        <Image
          src={resolveExperienceImage(booking.activity as any)}
          alt={booking.activity.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h3 className="fd text-lg font-medium text-white italic leading-tight">
            {booking.activity.title}
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Detail Rows */}
        <div className="space-y-3.5">
          <DetailRow icon={<Calendar size={14} />}>
            <span className="text-text-muted-dark uppercase tracking-widest text-[10px] font-bold mr-2">Date:</span>
            <span className="font-bold text-[#41362f]">{booking.date ? format(booking.date, "MMM d, yyyy") : "Select date"}</span>
          </DetailRow>
          <DetailRow icon={<Clock size={14} />}>
            <span className="text-text-muted-dark uppercase tracking-widest text-[10px] font-bold mr-2">Time:</span>
            <span className="font-bold text-[#41362f]">{booking.timeSlot || "Not set"}</span>
          </DetailRow>
          <DetailRow icon={<Users size={14} />}>
            <span className="text-text-muted-dark uppercase tracking-widest text-[10px] font-bold mr-2">Guests:</span>
            <span className="font-bold text-[#41362f]">{booking.adults} Adults {booking.children > 0 && `, ${booking.children} Children`}</span>
          </DetailRow>
        </div>

        {/* Price Breakdown Area */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#fcfaf5] to-white border border-[#D4A744]/20">
          <div className="space-y-2.5 mb-4">
            <PriceRow
              label={
                <div className="flex items-center gap-1">
                  {booking.adults} × <Price amount={effectiveBaseRate} />
                </div>
              }
              val={<Price amount={booking.adults * effectiveBaseRate} />}
            />
            {booking.children > 0 && (
              <PriceRow
                label={
                  <div className="flex items-center gap-1">
                    {booking.children} child × <Price amount={Math.round(effectiveBaseRate * 0.5)} />
                  </div>
                }
                val={<Price amount={booking.children * effectiveBaseRate * 0.5} />}
              />
            )}
            
            {/* Weekend Surcharge */}
            {booking.date && booking.activity.pricingRules && (
              (() => {
                const day = booking.date.getDay();
                const isWeekend = day === 0 || day === 5 || day === 6;
                const rule = booking.activity.pricingRules.find(r => r.conditionType === "Weekend" && r.isActive);
                if (isWeekend && rule) {
                  const sub = (effectiveBaseRate * booking.adults) + (effectiveBaseRate * 0.5 * booking.children);
                  const amt = rule.adjustmentType === "Percentage" ? (sub * rule.value / 100) : rule.value;
                  return (
                    <PriceRow 
                      label={`Weekend Surcharge (${rule.ruleName})`} 
                      val={<div className="flex items-center gap-0.5">+{<Price amount={amt} />}</div>} 
                      highlight 
                    />
                  );
                }
                return null;
              })()
            )}

            {/* Transportation Fee */}
            {booking.transportationTier && (
              (() => {
                let amt = 0;
                if (booking.transportationTier.type === "Shared") {
                  amt = (booking.transportationTier.basePrice || 0) * (booking.adults + (booking.children || 0));
                } else {
                  amt = (booking.transportationTier.basePrice || 0);
                }
                return (
                  <PriceRow 
                    label={`Transport (${booking.transportationTier.label || booking.transportationTier.type})`} 
                    val={<div className="flex items-center gap-0.5">+{<Price amount={amt} />}</div>} 
                    highlight 
                  />
                );
              })()
            )}

            {discountAmount > 0 && (
              <PriceRow
                label={`Discount${couponCode ? ` (${couponCode})` : ""}`}
                val={<div className="flex items-center gap-0.5 text-primary">−{<Price amount={discountAmount} />}</div>}
                highlight
              />
            )}
          </div>

          <div className="h-px bg-[#D4A744]/20 my-4" />

          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted-dark">Total Amount</span>
            <span className="fd text-3xl font-medium gold-text leading-none italic">
               <Price amount={finalPrice} />
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-[#D4A744]/40 text-[#D4A744] text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#D4A744]/5 transition-all"
        >
          <Pencil size={12} /> Edit Booking Details
        </button>
      </div>

      {/* Trust Stamps */}
      <div className="p-6 bg-[#fcfaf5] border-t border-[#D4A744]/10 space-y-3">
        {[
          { icon: <Shield size={12} />, text: "Secure & encrypted booking" },
          { icon: <RotateCcw size={12} />, text: "Free cancellation (48h notice)" },
          { icon: <CreditCard size={12} />, text: "No hidden fees" },
        ].map((t) => (
          <div key={t.text} className="flex items-center gap-2.5 text-[11px] font-bold text-emerald-600">
            <span className="flex items-center justify-center p-1 rounded-md text-emerald-600 bg-emerald-50">
              {t.icon}
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 mt-0.5 text-[#D4A744]">{icon}</span>
      <div className="flex text-[11px] items-center">{children}</div>
    </div>
  );
}

function PriceRow({ label, val, highlight }: { label: React.ReactNode; val: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-[13px]">
      <div className={cn("flex items-center", highlight ? "text-[#D4A744] font-bold" : "text-[#7c726a] font-medium")}>{label}</div>
      <div className={cn("flex items-center", highlight ? "text-[#D4A744] font-bold" : "text-[#1a1612] font-bold")}>{val}</div>
    </div>
  );
}
