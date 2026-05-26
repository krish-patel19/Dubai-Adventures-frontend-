"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { HeroSlide } from "../types";
import { cn } from "@/lib/utils";
import { normalizeSiteConfig } from "@/lib/site-config";
import { ChevronLeft, ChevronRight, Search, Star, ShieldCheck, Clock, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const DEFAULT_VIDEO = "https://cdn.pixabay.com/video/2021/08/18/85465-590289657_large.mp4";
const AUTO_ADVANCE_MS = 8000;
const DEFAULT_SLIDE: HeroSlide = {
  fallbackImage: "",
  videoUrl: DEFAULT_VIDEO,
  title: "Dubai Outdoor",
  subtitle: "Adventures",
  buttonText: "EXPLORE PACKAGES",
  buttonLink: "#activities",
};

export default function Hero({ initialSiteConfig }: { initialSiteConfig?: any }) {
  const [ready, setReady] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);
  const [siteConfig, setSiteConfig] = useState<any>(initialSiteConfig);
  const { t } = useLanguage();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);

    if (initialSiteConfig) {
      const normalized = normalizeSiteConfig(initialSiteConfig);
      setSiteConfig(normalized);
      if (normalized.heroSlides.length > 0) {
        setSlides(normalized.heroSlides);
        setActiveIndex(0);
      }
      return () => clearTimeout(t);
    }

    fetch("/api/config", { cache: "no-store" })
      .then(res => res.json())
      .then((data) => {
        const normalized = normalizeSiteConfig(data);
        setSiteConfig(normalized);
        if (normalized.heroSlides.length > 0) {
          setSlides(normalized.heroSlides);
          setActiveIndex(0);
        }
      })
      .catch(console.error);

    return () => clearTimeout(t);
  }, []);

  const heroSlides = slides.length > 0 ? slides : [DEFAULT_SLIDE];
  const totalSlides = heroSlides.length;
  const activeSlide = heroSlides[activeIndex] ?? heroSlides[0] ?? DEFAULT_SLIDE;

  useEffect(() => {
    if (activeIndex >= totalSlides) {
      setActiveIndex(0);
    }
  }, [activeIndex, totalSlides]);

  useEffect(() => {
    setVideoFailed(false);
  }, [activeIndex]);

  const totalSlidesRef = useRef(totalSlides);
  totalSlidesRef.current = totalSlides;

  const changeSlide = useCallback((direction: number) => {
    setActiveIndex(current => {
      const total = totalSlidesRef.current;
      if (total <= 1) return 0;
      return (current + direction + total) % total;
    });
  }, []);

  useEffect(() => {
    if (totalSlides <= 1) return;

    const intervalId = window.setInterval(() => {
      changeSlide(1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [changeSlide, totalSlides, autoplayResetKey]);

  const handleManualSlide = (direction: number) => {
    changeSlide(direction);
    setAutoplayResetKey(current => current + 1);
  };

  const videoSrc = activeSlide.videoUrl || (!activeSlide.fallbackImage ? DEFAULT_VIDEO : "");
  const posterImage = activeSlide.fallbackImage;
  const displayTitle = activeSlide.title || t("heroTitle", "home");
  const displaySubtitle = activeSlide.subtitle || (slides.length > 0 ? "" : t("heroSubtitle", "home"));
  const btnText = activeSlide.buttonText || t("explorePackages", "home");
  const btnLink = activeSlide.buttonLink || "#activities";

  const features = siteConfig?.features?.length > 0 ? siteConfig.features : [
    { icon: "⭐", title: "Premium Experiences", desc: "" },
    { icon: "🛡️", title: "Free Cancellation", desc: "" },
    { icon: "⚡", title: "Instant Booking", desc: "" },
    { icon: "👨‍🏫", title: "Expert Guides", desc: "" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {posterImage && (
          <div
            key={`image-${activeIndex}-${posterImage}`}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${posterImage})` }}
          />
        )}
        {videoSrc && !videoFailed && (
          <video
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            poster={posterImage || undefined}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>

      {totalSlides > 1 && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-4 sm:flex sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => handleManualSlide(-1)}
              aria-label="Show previous hero slide"
              className="pointer-events-auto h-12 w-12 rounded-full border border-white/15 bg-black/25 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleManualSlide(1)}
              aria-label="Show next hero slide"
              className="pointer-events-auto h-12 w-12 rounded-full border border-white/15 bg-black/25 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 flex flex-col items-center justify-center mt-[-5vh]">

        {/* Top Badge */}
        <div className={cn(
          "mb-8 inline-flex items-center rounded-full bg-black/40 border border-white/20 backdrop-blur-md px-6 py-2.5 transition-all duration-700",
          ready ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#e5c07b] font-bold flex items-center gap-2.5">
            <span className="text-xl leading-none">✦</span> {siteConfig?.general?.siteTagline || "PREMIUM DESERT EXPERIENCES · DUBAI, UAE"}
          </span>
        </div>

        {/* Typography Group (Overlapping serif texts) */}
        <div className="flex flex-col items-center justify-center text-center relative w-full mb-12">
          <h1 className={cn(
            "fd text-7xl sm:text-8xl md:text-[130px] font-normal leading-[1.0] tracking-tight text-white drop-shadow-2xl z-20 transition-all duration-1000",
            ready ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}>
            {displayTitle}
          </h1>
          <h2 className={cn(
            "fd text-6xl sm:text-7xl md:text-[110px] font-normal leading-[1.0] tracking-normal gold-text drop-shadow-2xl z-30 -mt-2 sm:-mt-3 md:-mt-5 transition-all duration-1000 delay-100",
            ready ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          )}>
            {displaySubtitle}
          </h2>
        </div>

        {/* Crisp description */}
        <div className={cn(
          "max-w-xl text-center mb-10 transition-all duration-700 delay-300",
          ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="text-white drop-shadow-md text-sm sm:text-base md:text-[17px] font-medium mb-1.5 tracking-wide">
            {t("heroDesc1", "home")}
          </p>
          <p className="text-white drop-shadow-md text-sm sm:text-base md:text-[17px] font-medium tracking-wide">
            {t("heroDesc2", "home")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className={cn(
          "flex items-center justify-center gap-5 flex-wrap transition-all duration-700 delay-500",
          ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <a
            href={btnLink}
            className="flex items-center gap-2 px-8 py-3.5 text-xs sm:text-sm font-bold text-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #e5c07b 0%, #d4a045 100%)', boxShadow: '0 4px 20px rgba(229, 192, 123, 0.4)' }}
          >
            <Search size={16} strokeWidth={2.5} />
            {btnText}
          </a>
          <a
            href="/about"
            className="flex items-center gap-2 px-8 py-3.5 text-xs sm:text-sm font-bold text-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #e5c07b 0%, #d4a045 100%)', boxShadow: '0 4px 20px rgba(229, 192, 123, 0.4)' }}
          >
            {t("ourStory", "home")}
          </a>
        </div>
      </div>

      {/* Bottom Features Strip */}
      <div className={cn(
        "absolute bottom-0 inset-x-0 z-20 pb-8 px-5 w-full flex flex-col items-center justify-end transition-all duration-1000 delay-700",
        ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Scroll indicator integrated above features */}
        <div className="flex flex-col items-center gap-1.5 mb-6">
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/50 font-medium"></span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-white/40"></div>
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
            <div className="w-1 h-1 rounded-full bg-white/10"></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 max-w-5xl mx-auto border-t border-white/10 pt-6">
          {features.slice(0, 4).map((feat: any, idx: number) => {
            // Map text to simple lucide icons if possible, otherwise use the emoji they saved
            let RawIcon = Star;
            const lowerTitle = (feat.title || "").toLowerCase();
            if (lowerTitle.includes("cancel")) RawIcon = ShieldCheck;
            else if (lowerTitle.includes("book") || lowerTitle.includes("time")) RawIcon = Clock;
            else if (lowerTitle.includes("guide")) RawIcon = Users;

            // Check if the icon stored in DB is a 1-2 char emoji, if so we show it directly, else fallback to lucide
            const isEmoji = feat.icon && feat.icon.trim().length <= 3;

            return (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="text-[#e5c07b] flex items-center justify-center">
                  {isEmoji ? <span className="text-base">{feat.icon}</span> : <RawIcon size={16} />}
                </div>
                <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">{feat.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
