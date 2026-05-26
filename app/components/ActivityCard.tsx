"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Check, ChevronDown, ChevronUp, Zap, X, Sparkles, Users, Calendar, Truck, Bus, Car, Globe, Diamond, Crown, MapPin, ChevronLeft, Maximize2, Camera, Minus, Plus, ShoppingBag, Heart, ShoppingCart } from "lucide-react";
import { Activity, TransportTier } from "../types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage } from "../context/LanguageContext";
import { WeatherWidget } from "./ui/WeatherWidget";
import Price from "./Price";
import { calculateActivityTotal } from "../lib/pricing";
import { useCart } from "../context/CartContext";


interface Props {
  activity: Activity;
  isExpanded?: boolean;
  isSelected: boolean;
  onExpand?: () => void;
}

export default function ActivityCard({ activity, isSelected }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { language, t } = useLanguage();
  const { cart, addToCart, updateQuantity, setIsCartOpen } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItem = mounted ? cart.find(item => {
    const actId = item.activity.id || (item.activity as any)._id;
    const thisId = activity.id || (activity as any)._id;
    return actId === thisId;
  }) : undefined;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      setIsCartOpen(true);
    } else {
      addToCart({
        activity,
        date: null,
        adults: 1,
        children: 0,
        transportationTier: null
      }, e);
    }
  };

  const translations = activity.translations?.[language] || {};
  const displayTitle = translations.title || activity.title;
  const displaySubtitle = translations.subtitle || activity.subtitle;
  const displayShortDescription = translations.shortDescription || activity.shortDescription;
  const displayHighlights = translations.highlights || activity.highlights || [];


  const isLuxury = activity.category === "luxury" || activity.badgeType === "luxury";
  const isPremium = activity.badgeType === "gold" || activity.badgeType === "popular";

  const tierLabel = isLuxury ? "PREMIUM LUXURY" : isPremium ? "SIGNATURE" : "POPULAR";
  const tierIcon = isLuxury ? <Diamond size={12} /> : isPremium ? <Crown size={12} /> : <Sparkles size={12} />;

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[32px] bg-white transition-all duration-500 border border-[#ebd5be]",
        isLuxury
          ? "shadow-[0_15px_45px_rgba(194,134,57,0.15)] bg-slate-50 border-[#c28639]/30"
          : isPremium
            ? "shadow-[0_10px_30px_rgba(212,167,68,0.1)] border-[#D4A744]/30"
            : "shadow-sm hover:shadow-lg hover:border-[#D4A744]/40",
        isSelected && "ring-2 ring-primary/50"
      )}
      id={`card-${activity.id}`}
    >
      <div className="flex h-full w-full flex-col">
        <div className="relative aspect-[3/2] overflow-hidden rounded-t-[30px] bg-background-light shadow-inner">
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-secondary/10" />}
          <Image
            src={(activity.image && typeof activity.image === 'string' && activity.image.trim() !== "") ? activity.image : "https://placeholder.com/600x400"}
            alt={activity.title || "Experience Image"}
            fill
            className={cn(
              "object-cover transition duration-700 brightness-[1.1] group-hover:scale-110",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImgLoaded(true)}

          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          {/* Tier Badge Overlay */}
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md",
              isLuxury ? "bg-[#c28639] text-white" : isPremium ? "bg-white text-[#aa7c45]" : "bg-white/90 text-[#645c55]"
            )}>
              {tierIcon}
              {tierLabel}
            </div>
            {activity.badge && (
              <span className="w-fit rounded-full bg-primary/90 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-sm">
                {activity.badge}
              </span>
            )}
          </div>

          {/* Top Right Actions Overlay */}
          <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 border border-white/10"
            >
              <Heart size={18} className="text-white" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!cartItem) {
                  addToCart({
                    activity,
                    date: null,
                    adults: 1,
                    children: 0,
                    transportationTier: null
                  }, e);
                } else {
                  router.push('/cart');
                }
              }}
              className={cn(
                "group/cartbtn flex h-[38px] w-[38px] items-center justify-center rounded-full backdrop-blur-md transition-all border border-white/10",
                cartItem ? "bg-[#c28639]/90 text-white hover:bg-[#c28639]" : "bg-black/20 text-white hover:bg-[#c28639]"
              )}
              title={cartItem ? "View Cart" : "Add to Cart"}
            >
              {cartItem ? (
                <Check size={18} className="text-white drop-shadow-md" />
              ) : (
                <ShoppingCart size={18} className="text-white drop-shadow-md" />
              )}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={cn("text-[#e5c07b]", star > Math.round(activity.rating) && "opacity-25")}
                      fill={star <= Math.round(activity.rating) ? "#e5c07b" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-white">{activity.rating}</span>
                <span className="truncate text-xs font-bold text-white/80">
                  ({activity.reviewCount.toLocaleString()})
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md uppercase tracking-wider">
              <Clock size={12} className="text-[#e5c07b]" />
              <span className="whitespace-nowrap">{activity.duration}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#d4a045]/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4a045]">
                {displaySubtitle || activity.category}
              </span>
            </div>
            {activity.difficulty && (
              <span className="text-[9px] font-black text-[#8c7e73] uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} className="text-amber-500 fill-amber-500" />
                {activity.difficulty}
              </span>
            )}
          </div>

          <h3 className="fd mb-3 min-h-[3.5rem] text-xl font-medium leading-tight text-[#1a1612] line-clamp-2">
            {displayTitle}
          </h3>

          <p className="mb-6 min-h-[3rem] text-[13px] leading-relaxed text-[#645c55] line-clamp-2 font-medium">
            {displayShortDescription}
          </p>

          {/* New Info Bar */}
          <div className="mb-6 grid grid-cols-2 gap-3 border-y border-[#f0e4d4]/50 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdfaf5] border border-[#ead5be] text-[#c28639]">
                <Users size={12} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#a89b8e] uppercase tracking-tighter leading-none mb-0.5">Group Size</span>
                <span className="text-[11px] font-bold text-[#41362f]">Max {activity.maxGroupSize || 15} Pax</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdfaf5] border border-[#ead5be] text-[#c28639]">
                <MapPin size={12} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#a89b8e] uppercase tracking-tighter leading-none mb-0.5">Meeting Point</span>
                <span className="text-[11px] font-bold text-[#41362f] truncate max-w-[80px]">
                  {activity.location?.address?.split(',')[0] || "Dubai"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-[#f0e4d4]/60 pt-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col">
                <span className="mb-2 text-[10px] font-black uppercase leading-none tracking-[0.15em] text-[#9a9187]">
                  FROM
                </span>
                
                {activity.originalPrice && activity.originalPrice > activity.price && (
                  <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Price
                      amount={activity.originalPrice}
                      strike={true}
                      strikeColor="#9a9187"
                      className="text-[13px] font-medium"
                    />
                    <span className="text-[8px] font-extrabold text-emerald-600 uppercase">Save {Math.round((1 - activity.price / activity.originalPrice) * 100)}%</span>
                  </div>
                )}

                <div className="flex items-baseline leading-none">
                  <span className="fd text-3xl font-black" style={{ color: "#D4A744" }}>
                    <Price amount={activity.price} className="text-3xl" />
                  </span>
                </div>
                
                <span className="mt-3 text-[11px] font-bold leading-none text-[#9a9187]">
                  / person
                </span>
              </div>
            </div>
 
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  const id = activity.id || (activity as any)._id;
                  router.push(`/activities/${id}`);
                }}
                className="group/btn relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden text-white shadow-lg active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #e5c07b 0%, #c28639 100%)",
                  boxShadow: "0 8px 25px rgba(194,134,57,0.3)"
                }}
              >
                <span className="flex items-center gap-2">
                  DETAIL
                  <ChevronDown size={14} className="transition-transform group-hover/btn:translate-y-0.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

interface ActivityDetailsProps {
  activity: Activity;
  isSelected?: boolean;
  onSelect?: (activity: Activity, options: { date: Date | null, adults: number, children: number, transport: TransportTier | null }) => void;
}

export function ActivityDetails({
  activity,
  isSelected,
  onSelect,
}: ActivityDetailsProps) {
  const router = useRouter();
  const { language, t, isRTL } = useLanguage();
  const { cart, addToCart, updateQuantity } = useCart();

  const translations = activity.translations?.[language] || {};
  const displayTitle = translations.title || activity.title;
  const displaySubtitle = translations.subtitle || activity.subtitle;
  const displayFullDescription = translations.fullDescription || activity.fullDescription;
  const displayHighlights = translations.highlights || activity.highlights || [];
  const displayIncluded = translations.included || activity.included || [];
  const displayNotIncluded = translations.notIncluded || activity.notIncluded || [];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportTier | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const exactCartItem = mounted ? cart.find(item => {
    return (item.activity.id || (item.activity as any)._id) === (activity.id || (activity as any)._id);
  }) : undefined;

  const breakdown = calculateActivityTotal(activity, {
    date: selectedDate,
    adults,
    children,
    transportationTier: selectedTransport
  });

  const handleSelectClick = () => {
    if (onSelect) {
      onSelect(activity, {
        date: selectedDate,
        adults: adults,
        children: children,
        transport: selectedTransport
      });
    } else {
      const id = activity.id || (activity as any)._id;
      // Navigate to booking page - passing current selections
      let url = `/book/${id}?adults=${adults}&children=${children}`;
      if (selectedDate) url += `&date=${format(selectedDate, "yyyy-MM-dd")}`;
      if (selectedTransport) url += `&transport=${selectedTransport.type}`;
      router.push(url);
    }
  };

  const galleryImages = [activity.image, ...(activity.images || [])]
    .filter(img => img && typeof img === 'string' && img.trim() !== "");

  const placeholder = "https://placeholder.com/600x400"; // Fallback URL
  let displayImages = galleryImages.length > 0 ? galleryImages.slice(0, 4) : [placeholder];
  // Remove duplicates just in case activity.image is also in activity.images
  displayImages = Array.from(new Set(displayImages));

  const isLuxury = activity.category === "luxury" || activity.badgeType === "luxury";
  const isPremium = activity.badgeType === "gold" || activity.badgeType === "popular";

  const tierLabel = isLuxury ? "PREMIUM LUXURY" : isPremium ? "SIGNATURE EXPERIENCE" : "POPULAR ADVENTURE";
  const tierIcon = isLuxury ? <Diamond size={14} /> : isPremium ? <Crown size={14} /> : <Sparkles size={14} />;

  return (
    <div className={cn(
      "min-h-screen",
      isLuxury ? "bg-slate-50" : "bg-[#fcfbf7]"
    )}>
      <section className="relative w-full h-[70vh] sm:h-[85vh] overflow-hidden">
        {/* Cinematic Full-Bleed Background Image */}
        <div className="absolute inset-0">
          <Image
            src={displayImages[0]}
            alt={displayTitle || "Activity experience image"}
            fill
            priority
            className="object-cover brightness-[1.15] contrast-[1.05] transition-transform duration-1000 hover:scale-[1.03] cursor-zoom-in"

            onClick={() => setFullScreenImg(displayImages[0])}
          />
          {/* Gradients to ensure readability & blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent opacity-60" />
        </div>

        {/* Floating Back Button */}
        <div className="absolute top-28 left-5 sm:left-8 z-30">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 2. Floating Info Card (Glassmorphic Reference Design) */}
        <div className="absolute bottom-10 sm:bottom-16 left-5 sm:left-8 right-5 sm:right-auto z-30">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full sm:max-w-2xl p-6 sm:p-8 rounded-[32px] bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Top Shine */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {/* Rating Row (Screenshot Style) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 text-[#c28639]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-white/60 text-[10px] font-bold tracking-[0.1em] uppercase">
                    {activity.rating} ({activity.reviewCount || "3,200"} Reviews)
                  </span>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
                      isLuxury ? "bg-[#c28639] text-white" : isPremium ? "bg-white/10 text-[#e5c07b] border border-[#e5c07b]/30" : "bg-white/5 text-white/40 border border-white/10"
                    )}>
                      {tierLabel}
                    </span>
                    {activity.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-white text-[8px] font-black uppercase tracking-widest border border-primary/30">
                        {activity.badge}
                      </span>
                    )}
                  </div>
                </div>
                <h1 className="fd text-white text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight tracking-tight drop-shadow-md">
                  {displayTitle}
                </h1>
              </div>

              {/* Quick Metadata Row (Horizontal - Screenshot Style) */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-1">
                {[
                  { icon: Clock, label: activity.duration, sub: "Duration" },
                  { icon: Truck, label: activity.location?.address?.split(',')[0] || "Dubai", sub: "Location" },
                  { icon: Users, label: `${activity.maxGroupSize} Guests`, sub: "Capacity" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-5 h-5 flex items-center justify-center text-emerald-500">
                      <item.icon size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none mb-1">{item.label}</span>
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Main Content Wrapper (Details + Booking) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-start">

          {/* Main Details Column */}
          <div className="space-y-16">
            {/* Essential Info Banner */}
            <div className="flex flex-wrap gap-4 items-center p-6 rounded-3xl bg-secondary/5 border border-border-light shadow-sm">
              <div className="flex items-center gap-2 group cursor-help px-4 border-r border-border-light last:border-0 grow">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check size={16} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#645c55] uppercase tracking-widest">Pricing Policy</span>
                  <span className="text-xs font-bold text-emerald-600">Free Cancellation</span>
                </div>
              </div>
              <div className="flex items-center gap-2 group cursor-help px-4 border-r border-border-light last:border-0 grow">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Zap size={16} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#645c55] uppercase tracking-widest">Confirmation</span>
                  <span className="text-xs font-bold text-[#1a1612]">Instant Booking</span>
                </div>
              </div>
              <div className="flex items-center gap-2 group cursor-help px-4 border-r border-border-light last:border-0 grow">
                <div className="w-8 h-8 rounded-full bg-[#fcfbf7] text-[#c28639] flex items-center justify-center border border-[#e5c07b]/30"><Globe size={16} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#645c55] uppercase tracking-widest">Global Support</span>
                  <span className="text-xs font-bold text-[#1a1612]">Multi-Language</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5c07b]/30 shadow-sm mb-2">
                <Star size={14} className="text-[#c28639]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28639]">Experience Narrative</span>
              </div>
              <h3 className="fd text-4xl text-[#1a1612] font-normal tracking-tight">{displaySubtitle}</h3>
              <p className="text-[#645c55] text-lg leading-relaxed max-w-3xl font-light">
                {displayFullDescription}
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="space-y-6 p-8 rounded-[32px] border border-[#e5c07b]/30 bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c28639]/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#c28639] flex items-center gap-3">
                  <Sparkles size={16} /> Journey Highlights
                </h4>
                <ul className="space-y-5">
                  {displayHighlights.map((h, i) => (
                    <li key={i} className="flex gap-4 text-[#41362f] text-[15px] leading-snug">
                      <span className="w-6 h-6 rounded-full bg-[#c28639]/10 text-[#c28639] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">{i + 1}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 p-8 rounded-[32px] border border-emerald-500/20 bg-emerald-50/30">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-3">
                  <Check size={18} /> Inclusions
                </h4>
                <ul className="space-y-4">
                  {displayIncluded.map((item, i) => (
                    <li key={i} className="flex gap-3 text-[#41362f] text-[15px]">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Premier Transportation Section */}
            {activity.transportation && activity.transportation.filter(t => t.isAvailable).length > 0 && (
              <div className="pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5c07b]/30 shadow-sm mb-1">
                      <Clock size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span className="whitespace-nowrap">{activity.duration}</span>
                      </span>
                    </div>
                    <h3 className="fd text-4xl text-[#1a1612] font-normal tracking-tight">Premier <em className="gold-text not-italic">Transportation</em></h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activity.transportation.filter(t => t.isAvailable).map((tier, i) => (
                    <div key={i} className={cn(
                      "p-8 rounded-[38px] border transition-all duration-500 group relative overflow-hidden",
                      selectedTransport?.type === tier.type
                        ? "border-[#c28639] bg-white shadow-2xl scale-[1.02] z-10"
                        : "border-[#e5c07b]/20 bg-[#fdfaf5]/50 hover:bg-white hover:border-[#c28639]/40"
                    )}>
                      {selectedTransport?.type === tier.type && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#c28639] text-white flex items-center justify-center animate-in zoom-in duration-300">
                          <Check size={14} />
                        </div>
                      )}

                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110",
                        tier.type === "Shared" ? "bg-blue-50 text-blue-600" :
                          tier.type === "Private" ? "bg-amber-50 text-amber-600" :
                            "bg-purple-50 text-purple-600"
                      )}>
                        {tier.type === "Shared" ? <Bus size={32} /> :
                          tier.type === "Private" ? <Car size={32} /> :
                            <Crown size={32} />}
                      </div>

                      <h4 className="text-xl font-black text-[#1a1612] uppercase tracking-tight mb-2">{tier.label || tier.type}</h4>
                      <p className="text-xs font-bold text-[#c28639] uppercase tracking-[0.2em] mb-6">
                        {tier.type === "Shared" ? "Shared Luxury" : "Private Chauffeur"}
                      </p>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-[#41362f] text-sm">
                          <Users size={14} className="text-[#a89b8e]" />
                          <span className="font-bold">Up to {tier.capacity} Pax</span>
                        </div>
                        {tier.features.slice(0, 3).map((feat, fi) => (
                          <div key={fi} className="flex items-center gap-3 text-[#41362f] text-sm">
                            <Sparkles size={14} className="text-[#c28639]/60" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-[#a89b8e] uppercase tracking-widest mb-1">Premium Fee</p>
                          <p className="text-lg font-black text-[#c28639]">+<Price amount={tier.basePrice} /></p>
                        </div>
                        <button
                          onClick={() => setSelectedTransport(tier)}
                          className={cn(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            selectedTransport?.type === tier.type
                              ? "bg-[#c28639] text-white shadow-lg"
                              : "bg-black text-white hover:bg-[#c28639]"
                          )}
                        >
                          {selectedTransport?.type === tier.type ? "Selected" : "Choose"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Chronicles (Gallery) */}
            <div className="pt-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5c07b]/30 shadow-sm mb-1">
                    <Camera size={14} className="text-[#c28639]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28639]">Legacy Assets</span>
                  </div>
                  <h3 className="fd text-4xl text-[#1a1612] font-normal tracking-tight">Visual <em className="gold-text not-italic">Chronicles</em></h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-auto md:h-[600px]">
                {/* Left Side: Large Portrait Image (3/5 width) */}
                {displayImages.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 0.99, y: -2 }}
                    onClick={() => setFullScreenImg(displayImages[0])}
                    className="md:col-span-3 relative rounded-[40px] overflow-hidden shadow-2xl border-2 border-[#e5c07b]/20 group cursor-zoom-in min-h-[400px] md:h-full"
                  >
                    <Image
                      src={displayImages[0]}
                      alt="Gallery primary"
                      fill
                      className="object-cover brightness-[1.05] transition-transform duration-1000 group-hover:scale-110"
          
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                      <Maximize2 size={20} />
                    </div>
                  </motion.div>
                )}

                {/* Right Side: Stacked Landscape Images (2/5 width) */}
                <div className="md:col-span-2 flex flex-col gap-4 h-full">
                  {displayImages.slice(1, 3).map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 0.99, y: -2 }}
                      onClick={() => setFullScreenImg(img)}
                      className="flex-1 relative rounded-[40px] overflow-hidden shadow-xl border-2 border-[#e5c07b]/20 group cursor-zoom-in min-h-[200px] md:h-full"
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${i + 1}`}
                        fill
                        className="object-cover brightness-[1.1] transition-transform duration-1000 group-hover:scale-110"
            
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                        <Maximize2 size={16} />
                      </div>
                    </motion.div>
                  ))}
                  {/* Fallback if less than 3 images */}
                  {displayImages.length < 3 && Array.from({ length: 3 - displayImages.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 bg-[#fcfaf5] rounded-[40px] border-2 border-dashed border-[#e5c07b]/20 flex items-center justify-center opacity-40">
                      <Camera size={24} className="text-[#e5c07b]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <aside className="sticky top-28 space-y-8">
            <div className="p-8 sm:p-10 rounded-[40px] border border-[#e5c07b]/30 bg-white shadow-2xl space-y-8 relative overflow-hidden">
              {/* Luxury Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c28639]/5 rounded-full blur-2xl -mr-16 -mt-16" />

              {/* Step Header */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c28639]/10 border border-[#c28639]/20 mb-3">
                  <Sparkles size={12} className="text-[#c28639]" />
                  <span className="text-[9px] font-black text-[#c28639] uppercase tracking-[0.2em]">JOURNEY BUILDER</span>
                </div>
                <h3 className="text-xl font-black text-[#1a1612] tracking-tight">Personalize Your Escape</h3>
              </div>

              {/* Transportation Selection */}
              {activity.transportation && activity.transportation.filter(t => t.isAvailable).length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#645c55] uppercase tracking-[0.3em]">Select Transportation</p>
                    {selectedTransport && (
                      <button
                        onClick={() => setSelectedTransport(null)}
                        className="text-[9px] font-bold text-[#c28639] uppercase tracking-wider hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {activity.transportation.filter(t => t.isAvailable).map((tier, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTransport(tier)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                          selectedTransport?.type === tier.type
                            ? "bg-[#c28639]/5 border-[#c28639] shadow-inner"
                            : "bg-white border-[#ead5be] hover:border-[#c28639]/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            tier.type === "Shared" ? "bg-blue-50 text-blue-600" :
                              tier.type === "Private" ? "bg-amber-50 text-amber-600" :
                                "bg-purple-50 text-purple-600"
                          )}>
                            {tier.type === "Shared" ? <Bus size={16} /> :
                              tier.type === "Private" ? <Car size={16} /> :
                                <Crown size={16} />}
                          </div>
                          <div className="text-left">
                            <p className="text-[11px] font-black text-[#41362f] uppercase leading-none mb-1">{tier.label || tier.type}</p>
                            <p className="text-[9px] font-bold text-[#a89b8e] uppercase leading-none">
                              {tier.type === "Shared" ? "Per Person" : "Private Vehicle"} • {tier.capacity} Pax
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-black text-[#c28639]">
                            +<Price amount={tier.basePrice} />
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Transport Details */}
                  {selectedTransport && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-2xl bg-[#fdfaf5] border border-dashed border-[#ead5be] space-y-3"
                    >
                      {selectedTransport.pickupLocation && (
                        <div className="flex gap-3">
                          <MapPin size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[8px] font-black text-[#a89b8e] uppercase tracking-widest leading-none mb-1">Pick-up</p>
                            <p className="text-[10px] font-bold text-[#41362f] leading-tight">{selectedTransport.pickupLocation}</p>
                          </div>
                        </div>
                      )}
                      {selectedTransport.dropoffLocation && (
                        <div className="flex gap-3">
                          <MapPin size={12} className="text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[8px] font-black text-[#a89b8e] uppercase tracking-widest leading-none mb-1">Drop-off</p>
                            <p className="text-[10px] font-bold text-[#41362f] leading-tight">{selectedTransport.dropoffLocation}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Price Tag Header */}
              <div className="space-y-4 pt-4 border-t border-black/5">
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black text-[#645c55] uppercase tracking-[0.3em] mb-1">Estimated Total Investment</p>
                  
                  {activity.originalPrice && activity.originalPrice > activity.price && (
                    <div className="flex items-center gap-2">
                       <Price amount={activity.originalPrice * (adults + children)} 
                              strike={true} 
                              strikeColor="#9a9187" 
                              className="text-xl font-medium tracking-tight opacity-50 italic-font" />
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                        Save {Math.round((1 - activity.price / activity.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 leading-none">
                    <span className="text-6xl font-black gold-text italic-font tracking-tighter">
                      <Price amount={breakdown.total} className="text-6xl" />
                    </span>
                  </div>
                  
                  <p className="text-[10px] font-bold text-[#c28639] uppercase tracking-[0.2em] mt-3 flex items-center gap-1.5">
                    <Globe size={11} /> All Inclusive Experience • SECURE
                  </p>
                </div>
              </div>




              {/* Finalized CTA UI with Inline Cart States */}
              <div className="space-y-3">
                {exactCartItem ? (
                  <div className="w-full py-4 px-3 rounded-[24px] border-2 border-[#c28639] flex items-center justify-center shadow-inner bg-white">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c28639] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#c28639]/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-[#c28639]" />
                      </div>
                      Appended
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => addToCart({
                      activity,
                      date: selectedDate,
                      adults,
                      children,
                      transportationTier: selectedTransport
                    }, e)}
                    className="w-full py-4 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center justify-center gap-3 border-2 border-[#c28639] text-[#c28639] hover:bg-[#c28639]/5 active:scale-95 group/add"
                  >
                    <ShoppingBag size={16} className="group-hover/add:scale-110 transition-transform" /> Add to Cart
                  </button>
                )}

                <button
                  onClick={handleSelectClick}
                  className={cn(
                    "w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group/cta",
                    isSelected
                      ? "bg-emerald-500 text-white"
                      : "text-white hover:scale-[1.02] active:scale-95 translate-y-0 hover:-translate-y-1"
                  )}
                  style={!isSelected ? {
                    background: 'linear-gradient(135deg, #e5c07b 0%, #c28639 100%)',
                  } : {}}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000" />
                  {isSelected ? (
                    <><Check size={18} /> Experience Locked</>
                  ) : (
                    <>Secure This Journey <ChevronDown size={16} className="-rotate-90" /></>
                  )}
                </button>
              </div>
            </div>

            {/* Weather Insights in Sidebar */}
            <WeatherWidget compact={true} />
          </aside>
        </div>
      </section>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {fullScreenImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullScreenImg(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center"
            >
              <Image
                src={fullScreenImg}
                alt="Full view"
                fill
                className="object-contain"
                unoptimized
              />
              <button
                onClick={(e) => { e.stopPropagation(); setFullScreenImg(null); }}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <X size={20} /> Close View
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Guest Reviews Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <ReviewsSection activity={activity} />
        </div>
      </section>
    </div>
  );
}

function ReviewsSection({ activity }: { activity: Activity }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });

  useEffect(() => {
    fetch(`/api/reviews?activityTitle=${encodeURIComponent(activity.title)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reviews", err);
        setReviews([]);
        setLoading(false);
      });
  }, [activity.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReview,
          activityTitle: activity.title,
          activityId: activity.id
        })
      });
      if (res.ok) {
        alert("Review submitted! It will appear once approved by an admin.");
        setShowForm(false);
        setNewReview({ name: "", rating: 5, comment: "" });
      }
    } catch (err) {
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#645c55] mb-2 font-mono">Guest Reviews</p>
          <div className="flex items-center gap-4">
            <h3 className="fd text-2xl font-normal text-[#1a1612]">{activity.title}</h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5c07b]/10 border border-[#e5c07b]/20">
                <Star size={12} className="fill-[#e5c07b] text-[#e5c07b]" />
                <span className="text-xs font-bold text-[#e5c07b]">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-black/10 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-all text-[#1a1612]"
          >
            <Star size={14} className="text-[#e5c07b]" /> Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-8 rounded-[24px] border border-[#e5c07b]/30 bg-white shadow-lg space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#645c55]">Your Name</label>
              <input
                required
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#1a1612] focus:outline-none focus:border-[#e5c07b]/50 transition-colors shadow-sm"
                value={newReview.name}
                onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                placeholder="Ex: John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#645c55]">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: s })}
                    className="p-1 px-2.5 rounded-lg border border-black/5 bg-white hover:bg-black/5 transition-colors shadow-sm"
                  >
                    <Star size={14} className={s <= newReview.rating ? "fill-[#e5c07b] text-[#e5c07b]" : "text-black/10"} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#645c55]">Your Experience</label>
            <textarea
              required
              rows={4}
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#1a1612] focus:outline-none focus:border-[#e5c07b]/50 transition-colors resize-none shadow-sm"
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Tell us about your adventure..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl text-black text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e5c07b 0%, #d4a045 100%)' }}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5c07b] border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-black/10 bg-black/[0.01]">
          <Star size={32} className="text-black/5 mb-4" />
          <p className="text-lg font-medium text-[#1a1612]/50">No reviews yet</p>
          <p className="text-sm text-[#645c55]">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(reviews) && reviews.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#e5c07b] to-[#c28639] flex items-center justify-center text-xs font-bold text-black shadow-md">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1612]">{r.name}</p>
                    <p className="text-[10px] text-[#645c55]">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={10} className={si < r.rating ? "fill-[#e5c07b] text-[#e5c07b]" : "text-black/10"} />
                  ))}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#4a443f] italic">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
