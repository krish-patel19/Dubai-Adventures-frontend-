"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    Compass, Clock, MapPin, ChevronRight, Star, Building, Car, Navigation,
    Utensils, CheckCircle, AlertTriangle, ArrowLeft, X, ShoppingBag,
    Heart, ChevronDown, ChevronUp, Sparkles, Check, Diamond, Crown, Camera, Maximize2, Users
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import Price from "../../components/Price";
import { cn } from "@/lib/utils";
import { resolvePackageImages } from "../../lib/package-images";

const Footer = dynamic(() => import("../../components/Footer"), {
    loading: () => <div className="h-64 bg-background-light" />,
    ssr: false,
});

const getElementIcon = (type: string) => {
    switch (type) {
        case 'ACCOMMODATION': return <Building className="w-5 h-5 text-blue-500" />;
        case 'TRANSPORTATION': return <Car className="w-5 h-5 text-green-500" />;
        case 'ACTIVITY': return <Navigation className="w-5 h-5 text-amber-500" />;
        case 'MEAL': return <Utensils className="w-5 h-5 text-red-500" />;
        default: return <MapPin className="w-5 h-5 text-gray-400" />;
    }
};

export default function PackageDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [pkg, setPkg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();
    const { formatPrice } = useCurrency();
    const [activeDay, setActiveDay] = useState(0);
    const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/packages/${params.id}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        throw new TypeError("Received non-JSON response");
                    }
                    return res.json();
                })
                .then(res => {
                    if (res && !res.error) setPkg(res);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch package:", err);
                    setLoading(false);
                });
        }
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-background-light flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-4 text-sm font-semibold text-primary uppercase tracking-widest">Loading Journey...</p>
                </div>
            </main>
        );
    }

    if (!pkg) {
        return (
            <main className="min-h-screen bg-background-light">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-5">
                    <h1 className="text-2xl font-bold text-text-dark mb-4">Package Not Found</h1>
                    <p className="text-text-muted-dark mb-8">We couldn't find the package you're looking for.</p>
                    <button
                        onClick={() => router.push("/packages")}
                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-widest transition-all hover:scale-105"
                    >
                        Back to Packages
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    const isLuxury = pkg.category === "luxury" || pkg.badgeType === "luxury";
    const isPremium = pkg.badgeType === "gold" || pkg.badgeType === "popular";
    const tierLabel = isLuxury ? "PREMIUM LUXURY" : isPremium ? "SIGNATURE COLLECTION" : "POPULAR JOURNEY";
    const tierIcon = isLuxury ? <Diamond size={14} /> : isPremium ? <Crown size={14} /> : <Sparkles size={14} />;
    const { heroImage, galleryImages, hasGalleryImages } = resolvePackageImages(pkg);

    return (
        <main className={cn(
            "min-h-screen relative",
            isLuxury ? "bg-slate-50" : "bg-[#fcfbf7]"
        )}>
            <div className="absolute top-0 inset-x-0 z-50">
                <Navbar
                    hasBooking={false}
                    onCartClick={() => { }}
                    onAuthClick={() => { }}
                />
            </div>

            {/* 1. Cinematic Hero Section */}
            <section className="relative w-full h-[70vh] sm:h-[85vh] overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt={pkg.name}
                        fill
                        priority
                        className="object-cover brightness-[1.1] contrast-[1.05] transition-transform duration-1000 hover:scale-[1.03] cursor-zoom-in"
                        onClick={() => setFullScreenImg(heroImage)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent opacity-60" />
                </div>

                {/* Floating Back Button */}
                <div className="absolute top-28 left-5 sm:left-8 z-30">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>

                {/* 2. Floating Info Card */}
                <div className="absolute bottom-10 sm:bottom-16 left-5 sm:left-8 right-5 sm:right-auto z-30">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full sm:max-w-2xl p-6 sm:p-8 rounded-[32px] bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-0.5 text-[#e5c07b]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={11} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="text-white/60 text-[10px] font-bold tracking-[0.15em] uppercase">
                                        {pkg.totalDays} DAYS / {pkg.totalNights} NIGHTS
                                    </span>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
                                            isLuxury ? "bg-[#c28639] text-white" : "bg-white/10 text-[#e5c07b] border border-[#e5c07b]/30"
                                        )}>
                                            {tierLabel}
                                        </span>
                                        {pkg.badge && (
                                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-white text-[8px] font-black uppercase tracking-widest border border-primary/30">
                                                {pkg.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h1 className="fd text-white text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight tracking-tight drop-shadow-md">
                                    {pkg.name}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-1">
                                {[
                                    { icon: Clock, label: `${pkg.totalDays} Days`, sub: "Duration" },
                                    { icon: MapPin, label: pkg.difficulty || "All Levels", sub: "Experience" },
                                    { icon: Users, label: pkg.agePolicy || "All Ages", sub: "Policy" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="w-5 h-5 flex items-center justify-center text-[#e5c07b]">
                                            <item.icon size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">{item.label}</span>
                                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">{item.sub}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. Main Content Section */}
            <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">

                    {/* Main Details Column */}
                    <div className="space-y-16">
                        {/* Essential Banner */}
                        <div className="flex flex-wrap gap-4 items-center p-6 rounded-3xl bg-secondary/5 border border-border-light shadow-sm">
                            <div className="flex items-center gap-2 px-4 border-r border-border-light grow last:border-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check size={16} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#645c55] uppercase tracking-widest">Policy</span>
                                    <span className="text-xs font-bold text-[#1a1612]">Free Cancellation</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 border-r border-border-light grow last:border-0">
                                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Sparkles size={16} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#645c55] uppercase tracking-widest">Type</span>
                                    <span className="text-xs font-bold text-[#1a1612]">Multi-Day Experience</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 grow last:border-0">
                                <div className="w-8 h-8 rounded-full bg-[#fdfaf5] text-[#c28639] flex items-center justify-center border border-[#e5c07b]/30"><Compass size={16} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#645c55] uppercase tracking-widest">Curated</span>
                                    <span className="text-xs font-bold text-[#1a1612]">By Local Experts</span>
                                </div>
                            </div>
                        </div>

                        {/* Overview */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5c07b]/30 shadow-sm mb-2">
                                <Star size={14} className="text-[#c28639]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28639]">The Narrative</span>
                            </div>
                            <h3 className="fd text-4xl text-[#1a1612] font-normal tracking-tight">{pkg.subtitle || "The Ultimate Desert Journey"}</h3>
                            <p className="text-[#645c55] text-lg leading-relaxed max-w-3xl font-light">
                                {pkg.overview}
                            </p>
                            {pkg.fullDescription && (
                                <div className="prose max-w-none text-[#645c55] text-base leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: pkg.fullDescription }} />
                            )}
                        </div>

                        {/* Premium Itinerary */}
                        <div className="space-y-8 pt-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-500/20 shadow-sm mb-1">
                                <MapPin size={14} className="text-emerald-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Curated Timeline</span>
                            </div>
                            <h3 className="fd text-4xl text-[#1a1612] font-normal tracking-tight">Premium <em className="not-italic text-emerald-600">Itinerary</em></h3>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Day Selector */}
                                <div className="w-full md:w-[200px] flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar sticky top-[120px]">
                                    {pkg.itinerary?.map((day: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveDay(idx)}
                                            className={cn(
                                                "flex-shrink-0 text-left p-4 rounded-2xl border transition-all duration-300",
                                                activeDay === idx
                                                    ? "bg-[#c28639] text-white border-[#c28639] shadow-lg scale-105 z-10"
                                                    : "bg-white border-[#e5c07b]/20 text-[#1a1612] hover:border-[#c28639]/40"
                                            )}
                                        >
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", activeDay === idx ? "text-white/70" : "text-[#c28639]")}>Day {day.dayNumber}</p>
                                            <p className="font-bold text-xs truncate max-w-[120px]">{day.title}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Active Day Content */}
                                <div className="flex-1 w-full">
                                    <AnimatePresence mode="wait">
                                        {pkg.itinerary && pkg.itinerary[activeDay] && (
                                            <motion.div
                                                key={activeDay}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#e5c07b]/20 shadow-xl space-y-8"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h4 className="text-2xl font-black text-[#1a1612] tracking-tight">{pkg.itinerary[activeDay].title}</h4>
                                                        {pkg.itinerary[activeDay].overnightCity && (
                                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                                <Building size={12} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Overnight: {pkg.itinerary[activeDay].overnightCity}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-[#645c55] text-base leading-relaxed">{pkg.itinerary[activeDay].description}</p>

                                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[25px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#c28639]/20 before:via-[#c28639]/10 before:to-transparent">
                                                    {pkg.itinerary[activeDay].elements?.map((el: any, elIdx: number) => (
                                                        <div key={elIdx} className="relative flex gap-6 z-10">
                                                            <div className="w-[50px] h-[50px] rounded-full bg-white border-2 border-[#e5c07b]/20 shadow-lg flex items-center justify-center shrink-0">
                                                                {getElementIcon(el.elementType)}
                                                            </div>
                                                            <div className="flex-1 p-5 rounded-2xl bg-[#fdfaf5]/50 border border-[#e5c07b]/10">
                                                                <p className={cn(
                                                                    "text-[9px] font-black uppercase tracking-[0.2em] mb-2",
                                                                    el.elementType === 'ACCOMMODATION' ? "text-blue-500" :
                                                                        el.elementType === 'TRANSPORTATION' ? "text-green-500" :
                                                                            el.elementType === 'ACTIVITY' ? "text-amber-500" : "text-red-500"
                                                                )}>{el.elementType}</p>

                                                                {el.elementType === 'ACCOMMODATION' && (
                                                                    <div className="space-y-1">
                                                                        <p className="font-bold text-[#1a1612]">{el.details.hotelName}</p>
                                                                        <p className="text-xs text-[#645c55]">{el.details.roomType} Room</p>
                                                                    </div>
                                                                )}
                                                                {el.elementType === 'ACTIVITY' && (
                                                                    <div className="space-y-1">
                                                                        <p className="font-bold text-[#1a1612]">{el.details.activityName}</p>
                                                                        <p className="text-xs text-[#645c55]">{el.details.duration} • {el.details.timeSlot}</p>
                                                                        {el.details.description && <p className="mt-2 text-xs text-[#645c55] italic">"{el.details.description}"</p>}
                                                                    </div>
                                                                )}
                                                                {el.elementType === 'TRANSPORTATION' && (
                                                                    <div className="space-y-1">
                                                                        <p className="font-bold text-[#1a1612]">{el.details.route}</p>
                                                                        <p className="text-xs text-[#645c55]">{el.details.time}</p>
                                                                    </div>
                                                                )}
                                                                {el.elementType === 'MEAL' && (
                                                                    <div className="space-y-1 text-[#1a1612]">
                                                                        <p className="font-bold italic">{el.details.mealType || 'Meal Selection'}</p>
                                                                        {el.details.location && <p className="text-xs text-[#645c55]">{el.details.location}</p>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Highlights & Inclusions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                            {pkg.highlights?.length > 0 && (
                                <div className="space-y-6 p-8 rounded-[32px] border border-[#e5c07b]/30 bg-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c28639]/5 rounded-full blur-2xl -mr-16 -mt-16" />
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#c28639] flex items-center gap-3">
                                        <Sparkles size={16} /> Journey Highlights
                                    </h4>
                                    <ul className="space-y-5">
                                        {pkg.highlights.map((h: string, i: number) => (
                                            <li key={i} className="flex gap-4 text-[#41362f] text-[15px] leading-snug">
                                                <span className="w-6 h-6 rounded-full bg-[#c28639]/10 text-[#c28639] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">{i + 1}</span>
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {pkg.included?.length > 0 && (
                                <div className="space-y-6 p-8 rounded-[32px] border border-emerald-500/20 bg-emerald-50/30">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-3">
                                        <Check size={18} /> Inclusions
                                    </h4>
                                    <ul className="space-y-4">
                                        {pkg.included.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-[#41362f] text-[15px]">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check size={10} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <aside className="sticky top-28 space-y-8">
                        <div className="p-8 sm:p-10 rounded-[40px] border border-[#e5c07b]/30 bg-white shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c28639]/5 rounded-full blur-2xl -mr-16 -mt-16" />

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c28639]/10 border border-[#c28639]/20 mb-3">
                                    <Sparkles size={12} className="text-[#c28639]" />
                                    <span className="text-[9px] font-black text-[#c28639] uppercase tracking-[0.2em]">RESERVATION</span>
                                </div>
                                <h3 className="text-xl font-black text-[#1a1612] tracking-tight">Secure Your Escape</h3>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-black/5">
                                <div>
                                    <p className="text-[10px] font-black text-[#645c55] uppercase tracking-[0.3em] mb-2">Starting Investment</p>
                                    
                                    {pkg.originalPrice > pkg.basePrice && (
                                        <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                            <Price 
                                                amount={pkg.originalPrice} 
                                                strike={true} 
                                                className="text-xl font-medium italic" 
                                            />
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                                                Elite Offer: {Math.round((1 - pkg.basePrice / pkg.originalPrice) * 100)}% Off
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-baseline gap-2 leading-none">
                                        <span className="text-5xl font-black text-[#c28639] tracking-tighter leading-none italic">
                                            <Price amount={pkg.basePrice} className="text-5xl" />
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#c28639] uppercase tracking-[0.2em] mt-4">Per person • All Inclusive</p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push(`/book/${pkg.id}`)}
                                        className="w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] bg-gradient-to-br from-[#e5c07b] to-[#c28639] text-white shadow-xl hover:scale-[1.02] transition-all"
                                    >
                                        Reserve Journey
                                    </button>
                                    <button
                                        onClick={() => router.push('/contacts')}
                                        className="w-full py-4 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] border-2 border-[#e5c07b]/30 text-[#1a1612] hover:bg-black/5 transition-all bg-white"
                                    >
                                        Contact Concierge
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col gap-4 border-t border-black/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Clock size={16} /></div>
                                    <div>
                                        <p className="text-[8px] font-black text-[#645c55] uppercase tracking-widest leading-none mb-1">Duration</p>
                                        <p className="text-xs font-bold text-emerald-600">{pkg.totalDays} Days / {pkg.totalNights} Nights</p>
                                    </div>
                                </div>
                                {pkg.cancellationPolicy && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><AlertTriangle size={16} /></div>
                                        <div>
                                            <p className="text-[8px] font-black text-[#645c55] uppercase tracking-widest leading-none mb-1">Cancellation</p>
                                            <p className="text-xs font-bold text-emerald-600">{pkg.cancellationPolicy}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* 4. Visual Chronicles (Gallery) */}
            {hasGalleryImages && (
                <section className="bg-black/5 py-24">
                    <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5c07b]/30 shadow-sm mb-1">
                                <Camera size={14} className="text-[#c28639]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28639]">Legacy Assets</span>
                            </div>
                            <h3 className="fd text-4xl text-[#1a1612] font-normal tracking-tight">Visual <em className="not-italic text-[#c28639]">Chronicles</em></h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-auto md:h-[500px]">
                            <motion.div
                                whileHover={{ scale: 0.99 }}
                                onClick={() => setFullScreenImg(galleryImages[0])}
                                className="md:col-span-3 relative rounded-[40px] overflow-hidden shadow-2xl border-2 border-[#e5c07b]/20 cursor-zoom-in min-h-[300px]"
                            >
                                <Image src={galleryImages[0]} alt="Gallery 1" fill className="object-cover" />
                            </motion.div>
                            <div className="md:col-span-2 flex flex-col gap-4">
                                {galleryImages.slice(1, 3).map((img: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 0.99 }}
                                        onClick={() => setFullScreenImg(img)}
                                        className="flex-1 relative rounded-[40px] overflow-hidden shadow-xl border-2 border-[#e5c07b]/20 cursor-zoom-in min-h-[150px]"
                                    >
                                        <Image src={img} alt={`Gallery ${i + 2}`} fill className="object-cover" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Guest Reviews Section */}
            <section className="bg-white py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <ReviewsSection packageId={pkg.id} packageTitle={pkg.name} />
                </div>
            </section>

            <Footer />

            {/* Image Modal */}
            <AnimatePresence>
                {fullScreenImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullScreenImg(null)}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="relative w-full h-full max-w-6xl max-h-[85vh]"
                        >
                            <Image src={fullScreenImg} alt="Full view" fill className="object-contain" unoptimized />
                            <button className="absolute -top-12 right-0 text-white/70 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                <X size={20} /> Close View
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

function ReviewsSection({ packageId, packageTitle }: { packageId: string; packageTitle: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });

    useEffect(() => {
        fetch(`/api/reviews?activityTitle=${encodeURIComponent(packageTitle)}`)
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
    }, [packageTitle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newReview,
                    activityTitle: packageTitle,
                    activityId: packageId
                })
            });
            if (res.ok) {
                const createdReview = await res.json();
                setReviews(prev => [createdReview, ...prev]);
                alert("Review submitted! Thank you for sharing your experience.");
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
                        <h3 className="fd text-2xl font-normal text-[#1a1612]">{packageTitle}</h3>
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
                    {reviews.map((r, i) => (
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
