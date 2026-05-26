"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image as ImageIcon, 
    X, 
    Maximize2,
    Sparkles,
    Camera
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { GalleryImage } from "../types";
import { cn } from "@/lib/utils";
import Image from "next/image";

const CATEGORIES = ["All", "General", "Safari", "Culture", "Camel Riding", "Extreme", "Luxury"];

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    useEffect(() => {
        fetch("/api/gallery")
            .then(res => res.json())
            .then(data => {
                setImages(Array.isArray(data) ? data : (data.images || []));
                setLoading(false);
            })
            .catch(err => {
                console.error("Gallery Fetch Error:", err);
                setLoading(false);
            });
    }, []);

    const filteredImages = useMemo(() => {
        if (activeCategory === "All") return images;
        return images.filter(img => img.category === activeCategory);
    }, [images, activeCategory]);

    return (
        <main className="min-h-screen bg-[#fcfbf7]">
            <Navbar 
                hasBooking={false}
                onCartClick={() => {}}
                onAuthClick={(mode: "login" | "signup") => {
                    setAuthMode(mode);
                    setIsAuthModalOpen(true);
                }}
            />
            
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#e5c07b]/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c28639]/5 rounded-full blur-3xl -mr-64 -mt-32" />
                </div>

                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5c07b]/30 shadow-sm mb-4">
                            <Camera size={14} className="text-[#c28639]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28639]">Dubai Adventures Gallery</span>
                        </div>
                        <h1 className="fd-normal text-5xl md:text-7xl font-normal text-[#1a1612] leading-tight">
                            Captured <em className="gold-text fd italic">Moments</em>
                        </h1>
                        <p className="text-[#645c55] text-lg max-w-2xl mx-auto leading-relaxed">
                            Explore our curated collection of extraordinary experiences, from golden desert sunrises to high-octane city adventures.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="sticky top-20 z-40 py-6 bg-[#fcfbf7]/80 backdrop-blur-md border-y border-black/5">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                            {CATEGORIES.map((cat, i) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        "whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border",
                                        activeCategory === cat 
                                            ? "bg-[#c28639] border-[#c28639] text-white shadow-lg"
                                            : "bg-white border-black/5 text-[#645c55] hover:border-[#e5c07b]/40 hover:text-[#1a1612]"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-[#a89b8e] font-bold text-xs uppercase tracking-widest whitespace-nowrap">
                            <span className="flex items-center gap-2">
                                <Sparkles size={14} className="text-[#e5c07b]" />
                                {filteredImages.length} Masterpieces
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((_idx) => (
                            <div key={_idx} className="aspect-[4/5] rounded-[32px] bg-black/5 animate-pulse" />
                        ))}
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-center py-40 bg-white rounded-[40px] border border-dashed border-black/10">
                        <ImageIcon size={48} className="mx-auto text-black/10 mb-4" />
                        <h3 className="text-xl font-bold text-[#1a1612]">No images found</h3>
                        <p className="text-[#645c55] mt-2">Try selecting a different category.</p>
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredImages.map((img) => (
                                <motion.div
                                    key={img._id}
                                    layoutId={img._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                    className="group relative aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#ebd5be] bg-white"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.title || "Gallery Image"}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        unoptimized
                                    />
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1612]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    {/* Info */}
                                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e5c07b] mb-1">{img.category}</p>
                                        <h3 className="text-xl font-bold text-white leading-tight mb-4">{img.title || "Experience Dubai"}</h3>
                                        <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/10">
                                            View Aspect <Maximize2 size={12} className="ml-1" />
                                        </div>
                                    </div>

                                    {/* Featured Badge */}
                                    {img.featured && (
                                        <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-[#c28639] text-white text-[9px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1.5">
                                            <Sparkles size={10} fill="currentColor" /> Featured
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 pointer-events-auto"
                    >
                        <div 
                            className="absolute inset-0 bg-[#1a1612]/95 backdrop-blur-xl"
                            onClick={() => setSelectedImage(null)}
                        />
                        
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ rotate: 90 }}
                            className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={24} />
                        </motion.button>

                        <motion.div
                            layoutId={selectedImage._id}
                            className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-video rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
                        >
                            <Image
                                src={selectedImage.url}
                                alt={selectedImage.title || "Gallery"}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            
                            {/* Bottom Caption */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <div className="space-y-2">
                                    <p className="text-[#e5c07b] text-xs font-black uppercase tracking-[0.3em]">{selectedImage.category}</p>
                                    <h2 className="text-3xl sm:text-5xl font-normal text-white truncate fd leading-tight">
                                        {selectedImage.title || "Adventure Unearthed"}
                                    </h2>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </main>
    );
}
