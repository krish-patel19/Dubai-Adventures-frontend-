"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import DatePriceCalendar from "./DatePriceCalendar";
import {
  Check, ChevronLeft, ChevronRight, Minus, Plus,
  Calendar, Clock, Users, User, Mail, Phone, X, Tag, Loader2,
  CreditCard, Shield, Truck, Bus, Car, Crown, MapPin
} from "lucide-react";
import { BookingState, TransportTier } from "../types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Price from "./Price";

interface Props {
  booking: BookingState;
  totalPrice: number;
  onUpdate: (u: Partial<BookingState>) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STEPS = [
  { n: 1, label: "Package", icon: "🗓️" },
  { n: 2, label: "Details", icon: "✍️" },
  { n: 3, label: "Payment", icon: "💳" },
  { n: 4, label: "Confirm", icon: "✅" },
];

export default function BookingSteps({ booking, totalPrice, onUpdate, onConfirm, onCancel, isSubmitting = false }: Props) {
  const isPackage = booking.productType === "package" && ((booking.activity as any)?.totalDays || 1) > 1;
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponMsg, setCouponMsg] = useState<React.ReactNode>("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [walletType, setWalletType] = useState<"apple" | "google" | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (booking.paymentMethod) {
      setPaymentMethod(booking.paymentMethod);
    }
    if (booking.walletType !== undefined) {
      setWalletType(booking.walletType || null);
    }
  }, [booking.paymentMethod, booking.walletType]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput.trim();
    if (!code) return;

    setCouponStatus("checking");
    setCouponMsg("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          activityId: booking.activity?.id,
          totalPrice,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to validate coupon: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from coupon validation");
      }
      
      const data = await res.json();
      if (data.valid) {
        setCouponStatus("valid");
        setCouponMsg(data.description);
        setAppliedDiscount(data.discountAmount);
        setAppliedCode(data.code);
        onUpdate({ couponCode: data.code, discountAmount: data.discountAmount });
      } else {
        if (codeToApply) {
          // If it was an automatic re-validation and failed (e.g. min value not met anymore)
          setCouponStatus("idle");
          if (data.minOrderValue) {
            setCouponMsg(
              <span className="flex items-center gap-1">
                Coupon "{code}" removed: Mini order <Price amount={data.minOrderValue} /> required.
              </span>
            );
          } else {
            setCouponMsg(`Coupon "${code}" removed: ${data.error}`);
          }
          setAppliedDiscount(0);
          setAppliedCode("");
          onUpdate({ couponCode: "", discountAmount: 0 });
        } else {
          if (data.minOrderValue) {
            setCouponMsg(
              <span className="flex items-center gap-1">
                Min order <Price amount={data.minOrderValue} /> required.
              </span>
            );
          } else {
            setCouponMsg(data.error || "Invalid coupon.");
          }
        }
      }
    } catch {
      setCouponStatus("invalid");
      setCouponMsg("Could not validate coupon. Please try again.");
    }
  };

  // --- Reactive Coupon Re-validation ---
  useEffect(() => {
    if (appliedCode) {
      handleApplyCoupon(appliedCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setCouponStatus("idle");
    setCouponMsg("");
    setAppliedDiscount(0);
    setAppliedCode("");
    onUpdate({ couponCode: "", discountAmount: 0 });
  };

  const finalPrice = totalPrice - appliedDiscount;

  const validate = () => {
    if (step === 1) {
      const e: Record<string, string> = {};
      if (!booking.date) e.date = "Please select a date";
      if (booking.activity?.timeSlots?.length && !booking.timeSlot) e.timeSlot = "Please select a time";
      if (booking.adults < 1) e.adults = "At least 1 adult is required";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 2) {
      const e: Record<string, string> = {};
      if (!booking.fullName.trim()) e.fullName = "Full name is required";
      if (!booking.email.trim() || !/\S+@\S+\.\S+/.test(booking.email)) e.email = "Valid email required";
      if (!booking.phone.trim()) e.phone = "Phone number is required";
      if (!booking.nationality.trim()) e.nationality = "Nationality is required";

      // Validation for transportation addresses
      if (booking.transportationTier) {
        if (!booking.pickupAddress?.trim()) e.pickupAddress = "Pick-up address is required";
        if (!booking.dropoffAddress?.trim()) e.dropoffAddress = "Drop-off address is required";
      }

      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 3) {
      const e: Record<string, string> = {};
      if (paymentMethod === "card") {
        if (cardDetails.number.replace(/\s/g, "").length < 16) e.cardNumber = "Enter a valid 16-digit card number";
        if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) e.expiry = "Use MM/YY format";
        if (cardDetails.cvv.length < 3) e.cvv = "Invalid CVV";
        if (!cardDetails.name.trim()) e.cardName = "Cardholder name is required";
      } else {
        if (!walletType) e.wallet = "Please select a digital wallet";
      }
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };

  const goNext = () => {
    if (!validate()) return;

    if (step === 3) {
      setIsProcessingPayment(true);
      onUpdate({ paymentMethod });
      setTimeout(() => {
        setIsProcessingPayment(false);
        setStep(4);
        setTimeout(() => {
          contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 2500);
      return;
    }

    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-sm tracking-widest uppercase font-semibold mb-2 text-primary">
          Book Your Experience
        </p>
        <h2 className="fd text-4xl sm:text-5xl font-light text-text-dark">
          Complete Your <em className="gold-text not-italic">Booking</em>
        </h2>
      </div>

      <div className="mb-8">
        <div className="h-1 rounded-full mb-4 bg-border-light overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-dark to-primary-light transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          {STEPS.map((s) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-400",
                    done && "bg-primary text-white",
                    active && "border-2 border-primary text-primary bg-primary/10",
                    !done && !active && "bg-border-light text-text-muted-dark"
                  )}
                >
                  {done ? <Check size={16} /> : s.n}
                </div>
                <span
                  className={cn(
                    "text-xs tracking-wide uppercase hidden sm:block",
                    active || done ? "text-primary" : "text-text-muted-dark"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div ref={contentRef} className="rounded-2xl overflow-hidden border-2 border-[#D4A744] bg-background-card-light shadow-xl">
        <div className="a-scale" key={step}>

          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-8">
              {/* Date & Time Selection */}
              <div>
                <p className="text-sm tracking-widest uppercase font-semibold mb-6 text-primary">
                  ✦ {isPackage ? "Select Departure Date" : "Select Date & Time"}
                </p>
                <div className="max-w-md space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted-dark flex items-center gap-2">
                      <Calendar size={14} className="text-primary" /> {isPackage ? "Departure Date" : "Select Date"}
                    </p>
                    <DatePriceCalendar
                      activityId={booking.activity?.id || (booking.activity as any)?._id || ""}
                      selected={booking.date}
                      onSelect={(d) => {
                        const totalDaysVal = (booking.activity as any)?.totalDays || 1;
                        const isPkg = booking.productType === "package" && totalDaysVal > 1;
                        let startDate: Date | null = null;
                        let endDate: Date | null = null;
                        if (isPkg && d) {
                          startDate = d;
                          endDate = new Date(d);
                          endDate.setDate(endDate.getDate() + (totalDaysVal - 1));
                        }
                        onUpdate({
                          date: d,
                          timeSlot: "",
                          packageStartDate: startDate,
                          packageEndDate: endDate,
                        });
                        setErrors(e => ({ ...e, date: "" }));
                      }}
                      dateOverrides={booking.activity?.dateOverrides}
                      basePrice={booking.activity?.price ?? (booking.activity as any)?.basePrice ?? 0}
                      timeSlot={booking.timeSlot}
                      totalDays={(booking.activity as any)?.totalDays || 1}
                      checkAvailability={
                        booking.productType
                          ? booking.productType === "activity"
                          : !(booking.activity as any)?.totalDays
                      }
                    />
                    {errors.date && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><X size={12} /> {errors.date}</p>}
                  </div>

                  {/* Journey At A Glance — shown for multi-day packages after selecting a date */}
                  {isPackage && booking.date && (() => {
                    const totalDaysVal = (booking.activity as any)?.totalDays || 1;
                    const itinerary = (booking.activity as any)?.itinerary || [];
                    return (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-primary/20" />
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2">
                            <Calendar size={12} /> Journey At A Glance
                          </p>
                          <div className="h-px flex-1 bg-primary/20" />
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {Array.from({ length: totalDaysVal }).map((_, dayIdx) => {
                            const dayDate = new Date(booking.date!);
                            dayDate.setDate(dayDate.getDate() + dayIdx);
                            const dayInfo = itinerary[dayIdx];
                            const isFirst = dayIdx === 0;
                            const isLast = dayIdx === totalDaysVal - 1;
                            return (
                              <div
                                key={dayIdx}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                  isFirst
                                    ? "bg-primary/5 border-primary/30 shadow-sm"
                                    : isLast
                                      ? "bg-emerald-50/50 border-emerald-200/50"
                                      : "bg-white border-border-light"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                                  isFirst
                                    ? "bg-primary text-white"
                                    : isLast
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-secondary/10 text-text-muted-dark"
                                )}>
                                  {dayIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-black text-text-dark uppercase tracking-wide">
                                    {isFirst ? "🛫 Departure" : isLast ? "🛬 Return" : `Day ${dayIdx + 1}`}
                                    {dayInfo?.title ? ` — ${dayInfo.title}` : ""}
                                  </p>
                                  <p className="text-[10px] font-bold text-text-muted-dark mt-0.5">
                                    {format(dayDate, "EEEE, MMMM d, yyyy")}
                                  </p>
                                  {dayInfo?.overnightCity && (
                                    <p className="text-[9px] font-bold text-primary mt-1 flex items-center gap-1">
                                      📍 Overnight: {dayInfo.overnightCity}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#fcfbf7] border border-[#e5c07b]/20">
                          <Calendar size={12} className="text-primary shrink-0" />
                          <p className="text-[10px] font-bold text-text-muted-dark">
                            <span className="text-text-dark font-black">{format(booking.date!, "MMM d")}</span>
                            {" → "}
                            <span className="text-text-dark font-black">{format(booking.packageEndDate || booking.date!, "MMM d, yyyy")}</span>
                            {" · "}
                            <span className="text-primary font-black">{totalDaysVal} Days / {(booking.activity as any)?.totalNights || totalDaysVal - 1} Nights</span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {booking.date && booking.activity?.timeSlots?.length ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted-dark flex items-center gap-2">
                        <Clock size={14} className="text-primary" /> Select Time
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {booking.activity.timeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => { onUpdate({ timeSlot: slot }); setErrors(e => ({ ...e, timeSlot: "" })); }}
                            className={cn(
                              "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                              booking.timeSlot === slot
                                ? "bg-primary border-primary text-white shadow-md active:scale-95"
                                : "bg-white border-black/5 text-text-dark hover:border-primary/30 hover:bg-background-light"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      {errors.timeSlot && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><X size={12} /> {errors.timeSlot}</p>}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="h-px bg-border-light max-w-md" />

              <div>
                <p className="text-sm tracking-widest uppercase font-semibold mb-6 text-primary">
                  ✦ Guests
                </p>
                {errors.adults && <p className="text-xs text-red-500 mb-4 flex items-center gap-1"><X size={12} /> {errors.adults}</p>}
                <div className="max-w-md space-y-4">
                  <GuestRow
                    label="Adults"
                    sub="Age 13 and above"
                    value={booking.adults}
                    min={1}
                    max={booking.activity?.maxGroupSize ?? 20}
                    onChange={(v) => onUpdate({ adults: v })}
                  />
                  <GuestRow
                    label="Children"
                    sub="Age 2–12 · 50% off"
                    value={booking.children}
                    min={0}
                    max={(booking.activity?.maxGroupSize ?? 20) - booking.adults}
                    onChange={(v) => onUpdate({ children: v })}
                  />
                </div>
              </div>

              {/* Transportation Selection */}
              {booking.activity?.transportation && booking.activity.transportation.filter(t => t.isAvailable).length > 0 && (
                <div>
                  <p className="text-sm tracking-widest uppercase font-semibold mb-6 text-primary">
                    ✦ Select Transportation
                  </p>
                  <div className="max-w-md grid grid-cols-1 gap-3">
                    {booking.activity.transportation.filter(t => t.isAvailable).map((tier, i) => (
                      <button
                        key={i}
                        onClick={() => onUpdate({ transportationTier: tier })}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                          booking.transportationTier?.type === tier.type
                            ? "bg-primary/5 border-primary shadow-inner"
                            : "bg-white border-border-light hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            tier.type === "Shared" ? "bg-blue-50 text-blue-600" :
                              tier.type === "Private" ? "bg-amber-50 text-amber-600" :
                                "bg-purple-50 text-purple-600"
                          )}>
                            {tier.type === "Shared" ? <Bus size={18} /> :
                              tier.type === "Private" ? <Car size={18} /> :
                                <Crown size={18} />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-text-dark tracking-wide">{tier.label || tier.type}</p>
                            <p className="text-[10px] font-medium text-text-muted-dark uppercase tracking-widest mt-0.5">
                              {tier.type === "Shared" ? "Per Person" : "Private Vehicle"} • {tier.capacity} Pax
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            +<Price amount={tier.basePrice} />
                          </p>
                        </div>
                      </button>
                    ))}
                    {booking.transportationTier && (
                      <div className="p-4 rounded-xl bg-secondary/5 border border-dashed border-border-light space-y-2 mt-2">
                        {booking.transportationTier.pickupLocation && (
                          <div className="flex items-start gap-2 text-[11px] text-text-muted-dark">
                            <Truck size={12} className="mt-0.5 shrink-0 text-primary" />
                            <span><strong className="text-text-dark">Pick-up:</strong> {booking.transportationTier.pickupLocation}</span>
                          </div>
                        )}
                        {booking.transportationTier.dropoffLocation && (
                          <div className="flex items-start gap-2 text-[11px] text-text-muted-dark">
                            <Truck size={12} className="mt-0.5 shrink-0 text-primary" />
                            <span><strong className="text-text-dark">Drop-off:</strong> {booking.transportationTier.dropoffLocation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="h-px bg-border-light max-w-md" />

              <div className="mt-8 p-5 rounded-2xl max-w-sm bg-primary/10 border border-[#d4a045]/20">
                <p className="text-xs uppercase tracking-wider mb-4 text-text-muted-dark">
                  Price Breakdown
                </p>
                <div className="space-y-2">
                  {(() => {
                    let baseRate = booking.activity?.price ?? (booking.activity as any)?.basePrice ?? 0;
                    if (booking.date && booking.activity?.dateOverrides) {
                      const dateStr = booking.date.toISOString().split('T')[0];
                      const override = booking.activity.dateOverrides.find(o => o.date === dateStr);
                      if (override) baseRate = override.price;
                    }

                    const day = booking.date?.getDay();
                    const isWeekend = day === 0 || day === 5 || day === 6;
                    const rule = booking.activity?.pricingRules?.find(r => r.conditionType === "Weekend" && r.isActive);
                    let weekendAmt = 0;
                    if (isWeekend && rule && booking.date) {
                      const sub = (baseRate * booking.adults) + (baseRate * 0.5 * booking.children);
                      weekendAmt = rule.adjustmentType === "Percentage" ? (sub * rule.value / 100) : rule.value;
                    }

                    let transportAmt = 0;
                    if (booking.transportationTier) {
                      if (booking.transportationTier.type === "Shared") {
                        transportAmt = (booking.transportationTier.basePrice || 0) * (booking.adults + booking.children);
                      } else {
                        transportAmt = (booking.transportationTier.basePrice || 0);
                      }
                    }

                    return (
                      <>
                        <Row
                          label={<div className="flex items-center gap-1">{booking.adults} Adult{booking.adults !== 1 ? "s" : ""} × <Price amount={baseRate} /></div>}
                          val={<Price amount={booking.adults * baseRate} />}
                        />
                        {booking.children > 0 && (
                          <Row
                            label={<div className="flex items-center gap-1">{booking.children} Child{booking.children !== 1 ? "ren" : ""} × <Price amount={Math.round(baseRate * 0.5)} /></div>}
                            val={<Price amount={booking.children * baseRate * 0.5} />}
                          />
                        )}
                        {weekendAmt > 0 && rule && (
                          <Row
                            label={`Weekend Surcharge (${rule.ruleName})`}
                            val={<div className="flex items-center gap-0.5">+{<Price amount={weekendAmt} />}</div>}
                          />
                        )}
                        {transportAmt > 0 && booking.transportationTier && (
                          <Row
                            label={`Transport (${booking.transportationTier.label || booking.transportationTier.type})`}
                            val={<div className="flex items-center gap-0.5">+{<Price amount={transportAmt} />}</div>}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="h-px bg-primary/20 mt-4 mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wider text-text-muted-dark">Total</span>
                  <span className="fd text-2xl font-medium gold-text leading-none">
                    <Price amount={totalPrice} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 sm:p-8">
              <p className="text-sm tracking-widest uppercase font-semibold mb-6 text-primary">
                ✦ Your Details
              </p>
              <div className="max-w-md space-y-5">
                <FormField
                  label="Full Name"
                  icon={<User size={16} />}
                  type="text"
                  placeholder="Your full name"
                  value={booking.fullName}
                  error={errors.fullName}
                  onChange={(v) => { onUpdate({ fullName: v }); setErrors((e) => ({ ...e, fullName: "" })); }}
                />
                <FormField
                  label="Email Address"
                  icon={<Mail size={16} />}
                  type="email"
                  placeholder="your@email.com"
                  value={booking.email}
                  error={errors.email}
                  onChange={(v) => { onUpdate({ email: v }); setErrors((e) => ({ ...e, email: "" })); }}
                />
                <FormField
                  label="Phone Number"
                  icon={<Phone size={16} />}
                  type="tel"
                  placeholder="+971 50 000 0000"
                  value={booking.phone}
                  error={errors.phone}
                  onChange={(v) => { onUpdate({ phone: v }); setErrors((e) => ({ ...e, phone: "" })); }}
                />
                <FormField
                  label="Nationality"
                  icon={<User size={16} />}
                  type="text"
                  placeholder="e.g. United Kingdom"
                  value={booking.nationality}
                  error={errors.nationality}
                  onChange={(v) => { onUpdate({ nationality: v }); setErrors((e) => ({ ...e, nationality: "" })); }}
                />

                {booking.transportationTier && (
                  <div className="pt-6 mt-6 border-t border-border-light space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Truck size={14} /> Transportation Logistics
                      </p>
                      <div className="h-px flex-1 bg-primary/10 ml-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#fdfaf5] border border-[#ead5be] shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <MapPin size={40} className="text-[#aa7c45]" />
                      </div>

                      <div className="space-y-2 relative z-10">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#aa7c45] flex items-center gap-2 ml-1">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <MapPin size={10} className="text-emerald-600" />
                          </div>
                          Pick-up-Activity Location
                        </label>
                        <input
                          className={cn(
                            "w-full rounded-xl border bg-white px-4 py-3 text-[13px] font-bold text-[#41362f] focus:outline-none focus:ring-2 focus:ring-[#bb8c4b]/20 transition-all placeholder:text-[#a89b8e]/50 placeholder:font-medium",
                            errors.pickupAddress ? "border-red-300 ring-2 ring-red-50" : "border-[#ead5be] hover:border-[#bb8c4b]/50"
                          )}
                          value={booking.pickupAddress || ""}
                          onChange={(v) => { onUpdate({ pickupAddress: v.target.value }); setErrors((e) => ({ ...e, pickupAddress: "" })); }}
                          placeholder="e.g. Hotel Lobby / Dubai Marina"
                        />
                        {errors.pickupAddress && <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.pickupAddress}</p>}
                      </div>

                      <div className="space-y-2 relative z-10">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#aa7c45] flex items-center gap-2 ml-1">
                          <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                            <MapPin size={10} className="text-red-500" />
                          </div>
                          Drop-off Location
                        </label>
                        <input
                          className={cn(
                            "w-full rounded-xl border bg-white px-4 py-3 text-[13px] font-bold text-[#41362f] focus:outline-none focus:ring-2 focus:ring-[#bb8c4b]/20 transition-all placeholder:text-[#a89b8e]/50 placeholder:font-medium",
                            errors.dropoffAddress ? "border-red-300 ring-2 ring-red-50" : "border-[#ead5be] hover:border-[#bb8c4b]/50"
                          )}
                          value={booking.dropoffAddress || ""}
                          onChange={(v) => { onUpdate({ dropoffAddress: v.target.value }); setErrors((e) => ({ ...e, dropoffAddress: "" })); }}
                          placeholder="e.g. Activity Site / Same as Pick-up"
                        />
                        {errors.dropoffAddress && <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.dropoffAddress}</p>}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-dashed border-primary/20 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                        <Truck size={16} className="text-[#aa7c45]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-[#41362f] uppercase tracking-widest">Logistic Protocol</p>
                        <p className="text-[11px] text-text-muted-dark leading-relaxed font-medium">
                          Our driver will coordinate via WhatsApp/Phone for exact timing.
                          Service tier: <span className="text-primary font-black uppercase">{booking.transportationTier.label || booking.transportationTier.type}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 sm:p-8">
              {/* Payment Method Selector */}
              <div className="flex p-1 bg-secondary/5 rounded-2xl border border-border-light mb-8 max-w-sm">
                <button
                  onClick={() => { setPaymentMethod("card"); onUpdate({ paymentMethod: "card" }); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    paymentMethod === "card"
                      ? "bg-white text-primary shadow-sm border border-primary/20"
                      : "text-text-muted-dark hover:text-text-dark"
                  )}
                >
                  <CreditCard size={14} /> Credit Card
                </button>
                <button
                  onClick={() => { setPaymentMethod("wallet"); onUpdate({ paymentMethod: "wallet" }); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    paymentMethod === "wallet"
                      ? "bg-white text-primary shadow-sm border border-primary/20"
                      : "text-text-muted-dark hover:text-text-dark"
                  )}
                >
                  <Truck size={14} className="rotate-12" /> Digital Wallet
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Visual Gold Card */}
                {paymentMethod === "card" && (
                  <div className="w-full lg:w-[320px] shrink-0 h-full animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="relative aspect-[1.586/1] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1612] to-[#3d3428] p-6 shadow-2xl border border-primary/30 group">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,150,42,0.15),transparent_70%)]" />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-9 bg-gradient-to-br from-amber-200 to-amber-500 rounded flex flex-col overflow-hidden opacity-90">
                            <div className="h-1/3 w-full border-b border-black/10" />
                            <div className="h-1/3 w-full border-b border-black/10" />
                          </div>
                          <p className="fd text-lg italic gold-text font-bold">Adventures <span className="text-white/40">Elite</span></p>
                        </div>

                        <div>
                          <p className="text-xl font-medium tracking-[0.2em] text-white/90 font-mono mb-4">
                            {cardDetails.number || "•••• •••• •••• ••••"}
                          </p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Card Holder</p>
                              <p className="text-xs font-semibold uppercase tracking-wider text-white truncate max-w-[150px]">
                                {cardDetails.name || "YOUR NAME"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Expires</p>
                              <p className="text-xs font-semibold text-white">{cardDetails.expiry || "MM/YY"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dummy Info Box */}
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-dashed border-primary/20">
                      <p className="text-[10px] uppercase tracking-widest font-black text-primary mb-2">✦ Sandbox Mode</p>
                      <div className="space-y-1">
                        <p className="text-[11px] text-text-muted-dark flex justify-between"><span>Card:</span> <span className="font-mono text-text-dark">4242 4242 4242 4242</span></p>
                        <p className="text-[11px] text-text-muted-dark flex justify-between"><span>Expiry:</span> <span className="font-mono text-text-dark">12/28</span></p>
                        <p className="text-[11px] text-text-muted-dark flex justify-between"><span>CVV:</span> <span className="font-mono text-text-dark">123</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Fields & Coupon */}
                <div className="flex-1 w-full space-y-6">
                  {paymentMethod === "card" ? (
                    <div className="space-y-4">
                      <p className="text-sm tracking-widest uppercase font-semibold text-primary">Secure Card Payment</p>
                      <FormField
                        label="Cardholder Name"
                        icon={<User size={14} />}
                        type="text"
                        placeholder="NAME AS ON CARD"
                        value={cardDetails.name}
                        error={errors.cardName}
                        onChange={(v) => { setCardDetails(p => ({ ...p, name: v.toUpperCase() })); setErrors(e => ({ ...e, cardName: "" })); }}
                      />
                      <FormField
                        label="Card Number"
                        icon={<CreditCard size={14} />}
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.number}
                        error={errors.cardNumber}
                        onChange={(v) => {
                          const val = v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
                          setCardDetails(p => ({ ...p, number: val }));
                          setErrors(e => ({ ...e, cardNumber: "" }));
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="Expiry Date"
                          icon={<Calendar size={14} />}
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          error={errors.expiry}
                          onChange={(v) => {
                            let val = v.replace(/\D/g, "").slice(0, 4);
                            if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2);
                            setCardDetails(p => ({ ...p, expiry: val }));
                            setErrors(e => ({ ...e, expiry: "" }));
                          }}
                        />
                        <FormField
                          label="CVV"
                          icon={<Shield size={14} />}
                          type="password"
                          placeholder="•••"
                          value={cardDetails.cvv}
                          error={errors.cvv}
                          onChange={(v) => {
                            const val = v.replace(/\D/g, "").slice(0, 3);
                            setCardDetails(p => ({ ...p, cvv: val }));
                            setErrors(e => ({ ...e, cvv: "" }));
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm tracking-widest uppercase font-semibold text-primary">Choose your wallet</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setWalletType("apple");
                            onUpdate({ walletType: "apple" });
                            setErrors(e => ({ ...e, wallet: "" }));
                          }}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all hover:shadow-md",
                            walletType === "apple"
                              ? "bg-black text-white border-black scale-[1.02]"
                              : "bg-white text-black border-border-light hover:border-black/20"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 384 512">
                              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-35.2-14.4-65.1-41.2-65.8-91.9zm-38.3-175.7c22.1-26.5 25.5-56.1 19.4-86.8-26.9 1.1-55.6 15.6-74.8 38.3-21.6 25.4-25.5 56.4-19.1 82.8 29.4 1.8 54.3-11.7 74.5-34.3z" />
                            </svg>
                            <span className="font-bold text-lg">Pay</span>
                          </div>
                          <p className="text-[10px] uppercase tracking-tighter opacity-60">Instant Apple Checkout</p>
                          {walletType === "apple" && <Check className="text-white bg-white/20 rounded-full p-0.5" size={16} />}
                        </button>

                        <button
                          onClick={() => {
                            setWalletType("google");
                            onUpdate({ walletType: "google" });
                            setErrors(e => ({ ...e, wallet: "" }));
                          }}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all hover:shadow-md",
                            walletType === "google"
                              ? "bg-[#4285F4] text-white border-[#4285F4] scale-[1.02]"
                              : "bg-white text-[#5f6368] border-border-light hover:border-[#4285F4]/20"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            <span className="font-bold text-lg">Pay</span>
                          </div>
                          <p className="text-[10px] uppercase tracking-tighter opacity-60">Fast Google Checkout</p>
                          {walletType === "google" && <Check className="text-white bg-white/20 rounded-full p-0.5" size={16} />}
                        </button>
                      </div>
                      {errors.wallet && <p className="text-xs text-red-500 mt-2 font-medium">{errors.wallet}</p>}
                    </div>
                  )}

                  {/* ── Coupon Code ── */}
                  <div className="pt-6 border-t border-border-light">
                    <p className="text-xs uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5 text-primary">
                      <Tag size={13} /> Have a discount coupon?
                    </p>
                    {couponStatus !== "valid" ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="CODE"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus("idle"); setCouponMsg(""); }}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-border-light bg-secondary/5 text-text-dark text-sm font-medium placeholder-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/40 tracking-widest uppercase"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          disabled={couponStatus === "checking" || !couponInput.trim()}
                          className="btn btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                        >
                          {couponStatus === "checking" ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/30">
                        <div>
                          <p className="text-sm font-bold text-primary tracking-wider">{appliedCode}</p>
                          <p className="text-xs text-text-muted-dark mt-0.5 flex items-center gap-1">
                            {couponMsg} · <span className="flex items-center gap-0.5">−<Price amount={appliedDiscount} /></span>
                          </p>
                        </div>
                        <button onClick={handleRemoveCoupon} className="btn btn-ghost h-7 w-7 p-0 text-text-muted-dark hover:text-red-500">
                          <X size={13} />
                        </button>
                      </div>
                    )}
                    {couponStatus === "invalid" && couponMsg && (
                      <p className="text-xs mt-2 text-red-500 flex items-center gap-1">
                        <X size={12} /> {couponMsg}
                      </p>
                    )}
                  </div>

                  {/* ── Transaction Total ── */}
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-[#d4a045]/15 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted-dark">Merchant:</span>
                      <span className="font-medium text-text-dark">Dubai Adventures Elite</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-text-muted-dark">Total Amount</span>
                      <div className="flex flex-col items-end">
                        {appliedDiscount > 0 && (
                          <span className="text-sm text-slate-400 line-through mb-0.5">
                            <Price amount={totalPrice} />
                          </span>
                        )}
                        <span className="fd text-3xl font-medium gold-text">
                          <Price amount={finalPrice} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && booking.activity && (
            <div className="p-6 sm:p-8">
              <p className="text-sm tracking-widest uppercase font-semibold mb-6 text-primary">
                ✦ Final Confirmation
              </p>
              <div className="max-w-md">
                {[
                  { label: isPackage ? "Journey" : "Package", val: booking.activity.title },
                  ...(isPackage && booking.date && booking.packageEndDate
                    ? [
                        { label: "Departure", val: format(booking.date, "EEEE, MMMM d, yyyy") },
                        { label: "Return", val: format(booking.packageEndDate, "EEEE, MMMM d, yyyy") },
                        { label: "Duration", val: `${(booking.activity as any)?.totalDays || 1} Days / ${(booking.activity as any)?.totalNights || 0} Nights` },
                      ]
                    : [
                        { label: "Date", val: booking.date ? format(booking.date, "EEEE, MMMM d, yyyy") : "—" },
                      ]
                  ),
                  { label: "Time", val: booking.timeSlot || (isPackage ? "Flexible" : "—") },
                  { label: "Guests", val: `${booking.adults} Adult${booking.adults !== 1 ? "s" : ""}${booking.children ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}` : ""}` },
                  { label: "Transportation", val: booking.transportationTier ? `${booking.transportationTier.label || booking.transportationTier.type}` : "None" },
                  { label: "Name", val: booking.fullName },
                  { label: "Email", val: booking.email },
                  { label: "Phone", val: booking.phone },
                  ...(booking.transportationTier ? [
                    { label: "Pick-up Address", val: booking.pickupAddress || "Not specified" },
                    { label: "Drop-off Address", val: booking.dropoffAddress || "Not specified" }
                  ] : []),
                  { label: "Payment", val: booking.paymentMethod === "wallet" ? (walletType ? (walletType === "apple" ? "Apple Pay" : "Google Pay") : "Digital Wallet") : "Credit Card" },
                ].map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-6 py-3 border-b border-border-light last:border-0">
                    <span className="text-xs uppercase tracking-wider flex-shrink-0 text-text-muted-dark">
                      {r.label}
                    </span>
                    <span className="text-sm text-right font-medium text-text-dark">{r.val}</span>
                  </div>
                ))}

                {/* ── Price Summary ── */}
                <div className="mt-8 pt-6 border-t border-border-light space-y-3">
                  {(() => {
                    let baseRate = booking.activity?.price ?? 0;
                    if (booking.date && booking.activity?.dateOverrides) {
                      const dateStr = booking.date.toISOString().split('T')[0];
                      const override = booking.activity.dateOverrides.find(o => o.date === dateStr);
                      if (override) baseRate = override.price;
                    }

                    const day = booking.date?.getDay();
                    const isWeekend = day === 0 || day === 5 || day === 6;
                    const rule = booking.activity?.pricingRules?.find(r => r.conditionType === "Weekend" && r.isActive);
                    let weekendAmt = 0;
                    if (isWeekend && rule && booking.date) {
                      const sub = (baseRate * booking.adults) + (baseRate * 0.5 * booking.children);
                      weekendAmt = rule.adjustmentType === "Percentage" ? (sub * rule.value / 100) : rule.value;
                    }

                    let transportAmt = 0;
                    if (booking.transportationTier) {
                      if (booking.transportationTier.type === "Shared") {
                        transportAmt = (booking.transportationTier.basePrice || 0) * (booking.adults + booking.children);
                      } else {
                        transportAmt = (booking.transportationTier.basePrice || 0);
                      }
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-muted-dark">Activities & Base</span>
                          <span className="font-medium text-text-dark">
                            <Price amount={baseRate * (booking.adults + booking.children * 0.5)} />
                          </span>
                        </div>
                        {weekendAmt > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted-dark">Weekend Surcharge</span>
                            <span className="font-medium text-text-dark">+<Price amount={weekendAmt} /></span>
                          </div>
                        )}
                        {transportAmt > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted-dark">Transportation</span>
                            <span className="font-medium text-text-dark">+<Price amount={transportAmt} /></span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {appliedDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary font-medium tracking-wide flex items-center gap-1.5">
                        <Tag size={12} /> Discount Applied
                      </span>
                      <span className="text-primary font-bold">−<Price amount={appliedDiscount} /></span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-primary/20 bg-primary/5 -mx-4 px-4 py-3 rounded-b-xl">
                    <span className="text-xs uppercase tracking-[0.2em] font-black text-text-muted-dark">Final Total</span>
                    <div className="flex flex-col items-end">
                      {appliedDiscount > 0 && (
                        <span className="text-sm text-slate-400 line-through mb-0.5">
                          <Price amount={totalPrice} />
                        </span>
                      )}
                      <span className="fd text-3xl font-medium gold-text leading-none">
                        <Price amount={finalPrice} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed mt-8 text-text-muted-dark italic opacity-70">
                A confirmation voucher and luxury PDF invitation will be sent to your email immediately.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-4 flex items-center justify-between bg-secondary/5 border-t border-border-light">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={goBack} className="btn btn-ghost">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
            )}
            <button onClick={onCancel} className="text-xs text-text-muted-dark hover:text-text-dark transition-colors px-2">
              Cancel
            </button>
          </div>
          {step < 4 ? (
            <button
              onClick={goNext}
              className="btn btn-primary min-w-[140px] relative overflow-hidden"
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Securing...
                </>
              ) : (
                <>
                  {step === 3 ? "Verify & Pay" : "Continue"} <ChevronRight size={16} className="ml-1" />
                </>
              )}
              {isProcessingPayment && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                  <div className="h-full bg-white animate-progress-flow" style={{ width: '100%' }} />
                </div>
              )}
            </button>
          ) : (
            <button onClick={onConfirm} className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : <><Check size={16} className="mr-1" /> Confirm Booking</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function GuestRow({ label, sub, value, min, max, onChange }: {
  label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-secondary/5 border border-border-light">
      <div>
        <p className="text-base font-medium text-text-dark">{label}</p>
        <p className="text-xs mt-0.5 text-text-muted-dark">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="btn btn-ghost h-9 w-9 px-0 disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center font-semibold text-lg text-text-dark">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="btn btn-ghost h-9 w-9 px-0 text-primary disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function FormField({ label, icon, type, placeholder, value, error, onChange }: {
  label: string; icon: React.ReactNode; type: string; placeholder: string;
  value: string; error?: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-semibold text-text-muted-dark mb-2">
        <span className="text-primary">{icon}</span>
        {label}
      </label>
      <input
        className={cn(
          "w-full px-4 py-3 rounded-lg bg-secondary/5 border border-border-light text-text-dark placeholder-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/50",
          error && "border-red-500/50 bg-red-500/5"
        )}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="text-xs mt-1.5 flex items-center gap-1 text-red-500">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, val }: { label: React.ReactNode; val: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-text-muted-dark flex items-center">{label}</div>
      <div className="text-text-dark flex items-center font-bold px-1">{val}</div>
    </div>
  );
}
