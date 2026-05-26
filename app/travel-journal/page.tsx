"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
    Crown, Compass, Anchor, ShoppingBag,
    Utensils, Award, ChevronRight, Sparkles,
    Waves, Map, Star
} from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";

interface TravelJournalData {
    hero: {
        title1: string;
        title2: string;
        subtitle: string;
        image: string;
        introduction: string[];
        ctaText: string;
        ctaLink: string;
    };
    vision: {
        statement: string;
    };
    experiencesSection: {
        badge: string;
        heading: string;
        description: string;
    };
    experiences: {
        prestige: { label: string; heading: string; image: string; items: string[] };
        desert: { label: string; heading: string; image: string; items: string[] };
        waterfront: { label: string; heading: string; image: string; items: string[] };
        shopping: { label: string; heading: string; image: string; items: string[] };
    };
    seasonalSection: {
        badge: string;
        heading: string;
        winterSubtitle: string;
        summerSubtitle: string;
        transitSubtitle: string;
    };
    seasonalGuide: {
        winter: string;
        summer: string;
        springAutumn: string;
    };
    fineDiningSection: {
        badge: string;
        heading: string;
    };
    fineDining: {
        image: string;
        items: string[];
    };
    premiumEdgeSection: {
        heading: string;
    };
    whyChooseUs: {
        items: string[];
    };
    finaleSection: {
        buttonText: string;
        buttonLink: string;
    };
    taglines: string[];
}

export default function TravelJournalPage() {
    const [data, setData] = useState<TravelJournalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    useEffect(() => {
        fetch("/api/travel-journal")
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfaf5]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-8"
                >
                    <div className="relative">
                        <div className="w-24 h-24 border-t-2 border-[#bb8c4b] border-opacity-30 rounded-full animate-spin absolute inset-0" />
                        <div className="w-24 h-24 border-r-2 border-[#bb8c4b] rounded-full animate-spin [animation-duration:1.5s] flex items-center justify-center">
                            <Crown className="w-8 h-8 text-[#bb8c4b] opacity-20" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl tracking-[0.3em] text-[#bb8c4b] font-light italic mb-2 fd">Dubai Adventures</div>
                        <div className="text-[10px] uppercase tracking-[0.8em] text-[#8c7e73] font-black opacity-50">Calibrating Luxury</div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!data || (data as any).error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfaf5] text-[#41362f] gap-6">
                <div className="text-4xl italic fd">A momentary pause in our journey...</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-12 py-4 border border-[#bb8c4b] text-[#bb8c4b] rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#bb8c4b] hover:text-white transition-all duration-700 shadow-lg shadow-[#bb8c4b]/5"
                >
                    Rekindle the Experience
                </button>
            </div>
        );
    }

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as any } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <main className="min-h-screen bg-[#ffffff] text-[#41362f] selection:bg-[#bb8c4b]/20 selection:text-[#41362f] overflow-x-hidden">
            <Navbar
                hasBooking={false}
                onCartClick={() => { }}
                onAuthClick={(mode: "login" | "signup") => {
                    setAuthMode(mode);
                    setIsAuthModalOpen(true);
                }}
            />

            {/* --- HERO SECTION --- */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent z-10" />
                    <motion.div
                        initial={{ scale: 1.15 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="w-full h-full"
                    >
                        <img
                            src={data.hero?.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070"}
                            alt="Dubai Luxury"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-20 text-center px-6 max-w-5xl"
                >
                    <motion.span
                        variants={fadeInUp}
                        className="text-[#bb8c4b] tracking-[0.4em] uppercase text-[10px] font-black mb-8 block drop-shadow-sm"
                    >
                        {data.hero?.subtitle}
                    </motion.span>
                    <motion.h1
                        variants={fadeInUp}
                        className="text-6xl md:text-[8.5rem] mb-12 italic leading-[0.85] tracking-tighter drop-shadow-2xl fd"
                    >
                        <span className="text-white">{data.hero?.title1}</span>{" "}
                        <span className="text-[#f3cc8a]">{data.hero?.title2}</span>
                    </motion.h1>
                    <motion.div
                        variants={fadeInUp}
                        className="relative max-w-4xl mx-auto"
                    >
                        <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#bb8c4b] to-transparent opacity-40 hidden md:block" />
                        <div className="space-y-10 text-xl md:text-2xl font-medium leading-[1.6] tracking-tight text-white px-8">
                            {data.hero?.introduction?.map((text, i) => (
                                <p key={i} className="drop-shadow-sm fd">{text}</p>
                            ))}
                        </div>
                        <div className="absolute -right-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#bb8c4b] to-transparent opacity-40 hidden md:block" />
                    </motion.div>
                    <motion.div
                        variants={fadeInUp}
                        className="mt-16"
                    >
                        <Link
                            href={data.hero?.ctaLink || "#vision"}
                            className="group relative inline-flex items-center gap-4 border border-[#bb8c4b] px-14 py-5 rounded-full text-[10px] tracking-[0.4em] uppercase transition-all duration-700 font-black overflow-hidden bg-[#bb8c4b] text-white hover:text-[#41362f]"
                        >
                            <span className="relative z-10">{data.hero?.ctaText}</span>
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22, 1, 0.36, 1]" />
                            <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- VISION STATEMENT --- */}
            <section id="vision" className="py-48 px-6 bg-[#ffffff] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#fdf3e0]/30 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-6xl mx-auto text-center relative z-10"
                >
                    <motion.div variants={fadeInUp} className="mb-12">
                        <Crown className="w-16 h-16 text-[#bb8c4b] mx-auto mb-12 opacity-80" />
                        <h2 className="text-3xl md:text-[3.5rem] italic text-[#41362f] leading-[1.2] tracking-tight px-4 fd">
                            &ldquo;{data.vision?.statement}&rdquo;
                        </h2>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="w-24 h-[2px] bg-[#bb8c4b] mx-auto mt-16 opacity-40 shadow-[0_0_10px_rgba(187,140,75,0.5)]" />
                </motion.div>
            </section>

            {/* --- LUXURY TILES --- */}
            <section className="py-40 px-6 bg-[#fdfaf5]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-[#ead5be] pb-20">
                        <div className="max-w-xl">
                            <span className="text-[#bb8c4b] tracking-[0.4em] uppercase text-[11px] font-black mb-6 flex items-center gap-3">
                                <Sparkles className="w-4 h-4" /> {data.experiencesSection?.badge}
                            </span>
                            <h2 className="text-4xl md:text-5xl text-[#41362f] italic leading-none tracking-tighter fd">{data.experiencesSection?.heading}</h2>
                        </div>
                        <p className="text-[#8c7e73] font-medium text-lg leading-relaxed mt-8 md:mt-0 md:max-w-sm italic opacity-80">
                            {data.experiencesSection?.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {[
                            { icon: Compass, data: data.experiences?.prestige },
                            { icon: Sparkles, data: data.experiences?.desert },
                            { icon: Waves, data: data.experiences?.waterfront },
                            { icon: ShoppingBag, data: data.experiences?.shopping }
                        ].map((cat, idx) => (
                            cat.data && (
                                <motion.div
                                    key={idx}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="group relative aspect-[14/9] overflow-hidden rounded-[24px] border-2 border-[#D4A744] shadow-2xl shadow-black/5"
                                >
                                    <img
                                        src={cat.data.image}
                                        alt={cat.data.heading}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out brightness-95 group-hover:brightness-75"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-8 flex flex-col justify-between">
                                        <span className="text-white/60 tracking-[0.3em] font-black text-[9px] uppercase">
                                            {cat.data.label}
                                        </span>
                                        <div>
                                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-4 group-hover:bg-[#bb8c4b] group-hover:border-[#bb8c4b] transition-all duration-700">
                                                <cat.icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-2xl md:text-3xl text-white mb-4 italic tracking-tight fd">{cat.data.heading}</h3>
                                            <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-1000 ease-in-out opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0">
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm font-medium">
                                                    {cat.data.items?.map((item, i) => (
                                                        <li key={i} className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 bg-[#bb8c4b] rounded-full shadow-[0_0_8px_rgba(187,140,75,0.8)]" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SEASONAL MASTERY --- */}
            <section className="py-48 px-6 bg-[#ffffff] relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="text-center mb-32">
                        <span className="text-[#bb8c4b] tracking-[0.4em] uppercase text-[11px] font-black mb-6 block">{data.seasonalSection?.badge}</span>
                        <h3 className="text-4xl md:text-5xl text-[#41362f] italic tracking-tight leading-none fd">{data.seasonalSection?.heading}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                        {[
                            { subtitle: data.seasonalSection?.winterSubtitle, text: data.seasonalGuide?.winter, icon: Map, label: "01 / Winter" },
                            { subtitle: data.seasonalSection?.summerSubtitle, text: data.seasonalGuide?.summer, icon: Sparkles, label: "02 / Summer" },
                            { subtitle: data.seasonalSection?.transitSubtitle, text: data.seasonalGuide?.springAutumn, icon: Compass, label: "03 / Transit" }
                        ].map((season, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative bg-[#fdfaf5] p-12 rounded-[40px] border-2 border-[#D4A744] transition-all duration-700 group hover:-translate-y-4 shadow-sm hover:shadow-xl hover:shadow-black/5"
                            >
                                <span className="text-[#8c7e73] font-black tracking-widest text-[9px] uppercase block mb-8 opacity-60">
                                    {season.label}
                                </span>
                                <div className="w-14 h-14 rounded-2xl bg-white border border-[#ead5be] flex items-center justify-center text-[#bb8c4b] mb-10 group-hover:bg-[#bb8c4b] group-hover:text-white transition-all duration-700 shadow-sm">
                                    <season.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-2xl text-[#41362f] mb-8 italic fd-normal">{season.subtitle}</h4>
                                <p className="text-[#8c7e73] leading-relaxed font-medium text-base italic leading-loose opacity-90">
                                    &ldquo;{season.text}&rdquo;
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- GASTRONOMY --- */}
            <section className="py-48 px-6 bg-[#fdfaf5]">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="relative group overflow-hidden rounded-[30px] shadow-2xl">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 1.5 }}
                            src={data.fineDining?.image || "https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=2070"}
                            alt="Gastronomy"
                            className="w-full h-full object-cover aspect-[16/10] md:aspect-auto"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[30px]" />
                        <div className="absolute top-8 left-8 w-16 h-16 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-[#bb8c4b] shadow-xl">
                            <Utensils className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="px-4">
                        <span className="text-[#bb8c4b] tracking-[0.4em] uppercase text-[11px] font-black mb-8 block">{data.fineDiningSection?.badge}</span>
                        <h2 className="text-4xl md:text-6xl text-[#41362f] mb-12 italic tracking-tighter leading-none fd">{data.fineDiningSection?.heading}</h2>
                        <div className="space-y-4">
                            {data.fineDining?.items?.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-8 group cursor-pointer border-b border-[#ead5be]/40 pb-8 hover:border-[#bb8c4b] transition-all duration-500"
                                >
                                    <span className="text-2xl text-[#8c7e73] opacity-30 group-hover:text-[#bb8c4b] group-hover:opacity-100 transition-all font-light">0{i + 1}</span>
                                    <span className="text-xl md:text-2xl text-[#41362f] tracking-tight italic group-hover:translate-x-3 transition-transform duration-500 fd">{item}</span>
                                    <Star className="w-5 h-5 text-[#bb8c4b] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- THE PREMIUM EDGE --- */}
            <section className="py-48 px-6 bg-[#ffffff] relative">
                <div className="max-w-5xl mx-auto text-center">
                    <Award className="w-20 h-20 text-[#bb8c4b] mx-auto mb-16 opacity-80" />
                    <h2 className="text-4xl md:text-5xl text-[#41362f] mb-20 italic tracking-tighter leading-none fd">{data.premiumEdgeSection?.heading}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 text-left">
                        {data.whyChooseUs?.items?.map((reason, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-8 group"
                            >
                                <div className="mt-2 w-10 h-[1px] bg-[#bb8c4b] group-hover:w-16 transition-all duration-700 shrink-0 shadow-[0_0_8px_rgba(187,140,75,0.5)]" />
                                <span className="text-[#41362f] text-xl md:text-2xl italic leading-[1.4] tracking-tight opacity-90 transition-opacity group-hover:opacity-100 fd">
                                    &ldquo;{reason}&rdquo;
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FINAL GRAND TAGLINE --- */}
            <section className="py-64 px-6 bg-[#fdfaf5] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#bb8c4b]/5 opacity-10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="relative z-10 max-w-6xl mx-auto"
                >
                    <div className="text-3xl md:text-[4rem] text-[#41362f] italic tracking-tight leading-[1.1] mb-20 drop-shadow-sm fd">
                        {data.taglines && data.taglines.length > 0 ? data.taglines[0] : "Dubai: The Pinnacle of Luxury"}
                    </div>

                    <div className="w-[1px] h-40 bg-gradient-to-b from-[#bb8c4b] to-transparent mx-auto mb-20" />

                    <Link
                        href={data.finaleSection?.buttonLink || "/bookings"}
                        className="group relative inline-flex items-center gap-6 px-16 py-6 bg-[#41362f] text-white rounded-full text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-700 overflow-hidden shadow-2xl hover:shadow-[#bb8c4b]/30"
                    >
                        <span className="relative z-10">{data.finaleSection?.buttonText}</span>
                        <div className="absolute inset-0 bg-[#bb8c4b] -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[0.22, 1, 0.36, 1]" />
                        <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                    </Link>
                </motion.div>
            </section>

            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </main>
    );
}
