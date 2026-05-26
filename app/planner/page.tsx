"use client";

import { useEffect, useState } from "react";
import {
    ArrowRight,
    Calendar,
    Compass,
    Download,
    Layout,
    Loader2,
    Map as MapIcon,
    MapPin,
    Play,
    Send,
    Share2,
    Sparkles,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { cn } from "@/lib/utils";
import {
    DEFAULT_AI_PLANNER_CONFIG,
    type NormalizedPlannerFeatureCard,
    normalizeAiPlannerConfig,
} from "@/lib/site-config";

interface ItineraryDay {
    day: number;
    title: string;
    description: string;
    activities: {
        time: string;
        activity: string;
        description: string;
        activityId?: string;
        image?: string;
        price?: number;
        category?: string;
    }[];
}

const FEATURE_ICON_MAP = {
    sparkles: Sparkles,
    compass: Compass,
    layout: Layout,
    play: Play,
    map: MapIcon,
    calendar: Calendar,
} as const;

function PlannerFeatureIcon({ icon, className }: { icon: string; className?: string }) {
    const Icon = FEATURE_ICON_MAP[icon as keyof typeof FEATURE_ICON_MAP] || Sparkles;
    return <Icon className={className} />;
}

function PlannerFeatureCard({ feature }: { feature: NormalizedPlannerFeatureCard }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 shadow-inner ring-1 ring-primary/20">
                <PlannerFeatureIcon icon={feature.icon} className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-text-dark uppercase tracking-tight mb-4">{feature.title}</h4>
            <p className="text-sm font-medium text-text-muted-dark leading-relaxed">{feature.desc}</p>
        </div>
    );
}

export default function PlannerPage() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
    const [currentDay, setCurrentDay] = useState(0);
    const [plannerPage, setPlannerPage] = useState(DEFAULT_AI_PLANNER_CONFIG.plannerPage);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!plannerPage.heroImages || plannerPage.heroImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % plannerPage.heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [plannerPage.heroImages]);

    useEffect(() => {
        let isMounted = true;

        async function fetchPlannerConfig() {
            try {
                const res = await fetch("/api/config", { cache: "no-store" });
                const data = await res.json();
                if (!isMounted) {
                    return;
                }

                setPlannerPage(normalizeAiPlannerConfig(data.aiPlanner).plannerPage);
            } catch (error) {
                console.error("Planner config fetch error:", error);
            }
        }

        void fetchPlannerConfig();

        return () => {
            isMounted = false;
        };
    }, []);

    const generatePlan = async (nextQuery = query) => {
        const trimmedQuery = nextQuery.trim();
        if (!trimmedQuery || isLoading) return;

        setQuery(trimmedQuery);
        setIsLoading(true);
        setItinerary(null);

        try {
            const res = await fetch("/api/ai/planner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmedQuery }),
            });
            
            if (!res.ok) {
                console.error(`Planner API failed with status ${res.status}`);
                return;
            }
            
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (data.itinerary) {
                    setItinerary(data.itinerary);
                    setCurrentDay(0);
                }
            } else {
                console.error("Received non-JSON response from planner API");
            }
        } catch (error) {
            console.error("Planner Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light flex flex-col pt-[72px]">
            <Navbar
                hasBooking={false}
                onCartClick={() => {}}
                onAuthClick={() => {}}
            />

            <section className="relative min-h-[520px] h-[45vh] flex items-center justify-center pt-24 overflow-hidden bg-black">
                <div className="absolute inset-0 bg-black/60 z-10" />
                
                {plannerPage.heroImages.map((image, index) => (
                    <div
                        key={`${image}-${index}`}
                        className={cn(
                            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                            index === currentImageIndex ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <Image
                            src={image}
                            alt={`Dubai View ${index + 1}`}
                            fill
                            priority={index === 0}
                            unoptimized={true}
                            className="object-cover"
                        />
                    </div>
                ))}

                <div className="relative z-20 text-center max-w-4xl px-6 pb-40">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-light text-xs font-black tracking-widest uppercase mb-6 animate-fade-in">
                        <Sparkles size={14} className="fill-current" />
                        {plannerPage.heroEyebrow}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none uppercase">
                        {plannerPage.heroTitlePrefix}
                        <br />
                        <span className="gold-text">{plannerPage.heroTitleHighlight}</span>
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
                        {plannerPage.heroDescription}
                    </p>
                </div>
            </section>

            <section className="flex-1 -mt-20 relative z-30 px-6 pb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/10 p-4 sm:p-2 mb-6 transform hover:scale-[1.01] transition-all duration-500">
                        <div className="flex flex-col sm:flex-row items-center gap-2 p-1">
                            <div className="flex-1 relative w-full group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                    <MapPin size={22} />
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            void generatePlan();
                                        }
                                    }}
                                    placeholder={plannerPage.queryPlaceholder}
                                    className="w-full bg-secondary/5 border-none rounded-[2rem] py-6 pl-16 pr-6 text-sm font-semibold text-text-dark placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => void generatePlan()}
                                disabled={isLoading || !query.trim()}
                                className="w-full sm:w-auto px-10 py-6 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:grayscale"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                {isLoading ? plannerPage.loadingLabel : plannerPage.submitLabel}
                            </button>
                        </div>
                    </div>

                    {plannerPage.examplePrompts.length > 0 && (
                        <div className="mb-12 flex flex-col gap-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary/70 px-2">
                                {plannerPage.promptChipsLabel}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {plannerPage.examplePrompts.map((prompt, index) => (
                                    <button
                                        key={`${prompt}-${index}`}
                                        onClick={() => void generatePlan(prompt)}
                                        className="px-5 py-3 rounded-full bg-white border border-primary/10 text-text-dark text-xs font-bold tracking-wide shadow-sm hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {itinerary ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                            <div className="lg:col-span-3 space-y-3">
                                {itinerary.map((day, idx) => (
                                    <button
                                        key={day.day}
                                        onClick={() => setCurrentDay(idx)}
                                        className={cn(
                                            "w-full p-6 rounded-3xl text-left transition-all duration-500 border group",
                                            currentDay === idx
                                                ? "bg-primary text-white shadow-xl shadow-primary/30 border-primary scale-105"
                                                : "bg-white text-text-dark hover:bg-secondary/5 border-primary/10",
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", currentDay === idx ? "text-white/60" : "text-primary")}>
                                                {plannerPage.dayLabel} {day.day}
                                            </span>
                                            <Calendar size={14} className={currentDay === idx ? "opacity-60" : "opacity-30"} />
                                        </div>
                                        <h4 className="font-black leading-tight tracking-tight uppercase group-hover:translate-x-1 transition-transform">{day.title}</h4>
                                    </button>
                                ))}

                                <div className="pt-6">
                                    <button className="w-full py-5 rounded-[2rem] border-2 border-dashed border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                                        <Download size={14} />
                                        {plannerPage.downloadLabel}
                                    </button>
                                </div>
                            </div>

                            {itinerary && itinerary[currentDay] && (
                                <div className="lg:col-span-9 space-y-8 pb-10">
                                    <div className="bg-white rounded-[3rem] shadow-xl border border-primary/10 p-8 sm:p-12">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <h2 className="text-3xl font-black text-text-dark uppercase tracking-tight mb-2">
                                                    {itinerary[currentDay].title}
                                                </h2>
                                                <p className="text-sm font-medium text-text-muted-dark leading-relaxed max-w-xl italic">
                                                    "{itinerary[currentDay].description}"
                                                </p>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2">
                                                <button className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-primary border border-primary/5 hover:bg-primary/10 transition-colors">
                                                    <Share2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {itinerary[currentDay].activities?.map((activity, idx) => (
                                                <div key={idx} className="relative pl-12 sm:pl-16 group">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary-light to-transparent rounded-full opacity-20" />
                                                    <div className="absolute left-[-6px] top-1 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-lg z-10 group-hover:scale-125 transition-transform" />

                                                    <div className="flex flex-col md:flex-row gap-8">
                                                        <div className="flex-1">
                                                            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-3">
                                                                {activity.time}
                                                            </span>
                                                            <h5 className="text-xl font-black text-text-dark uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
                                                                {activity.activity}
                                                            </h5>
                                                            <p className="text-sm font-medium text-text-muted-dark leading-relaxed mb-6">
                                                                {activity.description}
                                                            </p>
                                                        </div>

                                                        {activity.activityId && (
                                                            <div className="w-full md:w-[320px] rounded-3xl bg-secondary/5 border border-primary/20 overflow-hidden flex flex-col group/card hover:shadow-2xl transition-all duration-500">
                                                                <div className="relative h-40 overflow-hidden">
                                                                    <Image
                                                                        src={activity.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c"}
                                                                        alt={activity.activity}
                                                                        fill
                                                                        unoptimized={true}
                                                                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                                    />
                                                                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-widest uppercase">
                                                                        <MapIcon size={10} />
                                                                        {activity.category || "Adventure"}
                                                                    </div>
                                                                </div>
                                                                <div className="p-5 flex flex-col justify-between flex-1">
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="text-sm font-black text-text-dark tracking-tight">
                                                                            <span className="text-[10px] text-primary opacity-70 uppercase tracking-widest mr-1">AED</span>
                                                                            {activity.price || "—"}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 opacity-50">
                                                                            <Users size={12} />
                                                                            <span className="text-[10px] font-black uppercase tracking-widest">Guest</span>
                                                                        </div>
                                                                    </div>
                                                                    <Link
                                                                        href={`/activities/${activity.activityId}`}
                                                                        className="w-full py-3.5 rounded-2xl bg-white border border-primary/20 text-text-dark text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
                                                                    >
                                                                        {plannerPage.experienceButtonLabel}
                                                                        <ArrowRight size={14} />
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.28em] mb-5">
                                    <Sparkles size={12} />
                                    {plannerPage.emptyStateEyebrow}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-text-dark leading-none mb-5">
                                    {plannerPage.emptyStateTitle}
                                </h2>
                                <p className="text-base text-text-muted-dark leading-relaxed max-w-2xl">
                                    {plannerPage.emptyStateDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {plannerPage.featureCards.map((feature, index) => (
                                    <PlannerFeatureCard key={`${feature.title}-${index}`} feature={feature} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

