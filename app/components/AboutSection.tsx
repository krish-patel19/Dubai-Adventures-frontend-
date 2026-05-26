"use client";

import { useEffect, useState } from "react";
import { Compass, ShieldCheck, Sparkles, Users } from "lucide-react";
import { normalizeSiteConfig } from "@/lib/site-config";
import { SiteConfig } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { cn } from "@/lib/utils";

const FALLBACK_STATS = [
  { label: "guests", value: "10,000+" },
  { label: "packages", value: "50+" },
  { label: "rating", value: "4.9/5" },
];

const FALLBACK_ABOUT: SiteConfig["about"] = {
  heading: "Why Travelers Choose Dubai Adventures",
  subheading: "Luxury desert experiences, handled properly from first click to final drop-off.",
  description:
    "We build premium Dubai outdoor experiences with licensed operators, smooth logistics, fast confirmations, and support that stays clear before and after your booking.",
  stats: FALLBACK_STATS,
  pillars: [
    {
      icon: "compass",
      title: "Tailored Itineraries",
      text: "Every package is designed for clarity, timing, and a better on-ground experience.",
    },
    {
      icon: "shield",
      title: "Reliable Operations",
      text: "Certified teams, safe vehicles, and real support instead of vague booking promises.",
    },
    {
      icon: "sparkles",
      title: "Premium Service",
      text: "Small details are treated seriously so the full experience feels polished end-to-end.",
    },
    {
      icon: "users",
      title: "Guest-First Support",
      text: "Quick confirmations, flexible communication, and assistance before and after your trip.",
    },
  ],
};

const PILLAR_ICON_MAP: Record<string, typeof Compass> = {
  compass: Compass,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: Users,
};

export default function AboutSection() {
  const [about, setAbout] = useState<SiteConfig["about"]>(FALLBACK_ABOUT);
  const [pillars, setPillars] = useState(FALLBACK_ABOUT.pillars || []);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const normalized = normalizeSiteConfig(data);
        const stats = normalized.about.stats.filter((stat) => stat.label || stat.value);
        const normalizedPillars = (normalized.about.pillars || []).filter(
          (pillar) => pillar.title || pillar.text,
        );

        setAbout({
          heading: normalized.about.heading || FALLBACK_ABOUT.heading,
          subheading: normalized.about.subheading || FALLBACK_ABOUT.subheading,
          description: normalized.about.description || FALLBACK_ABOUT.description,
          stats: stats.length > 0 ? stats : FALLBACK_STATS,
        });
        setPillars(normalizedPillars.length ? normalizedPillars : (FALLBACK_ABOUT.pillars || []));
      })
      .catch((error) => {
        console.error("About config fetch error:", error);
      });
  }, []);

  return (
    <section id="about" className="py-32 bg-[#fdfaf5]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="mb-6 text-[10px] uppercase font-black tracking-[0.4em] text-[#bb8c4b]">
              {t("title", "about")}
            </p>
            <h2 className="fd max-w-3xl text-4xl sm:text-5xl leading-[1.2] text-[#41362f] italic">
              {t("heading", "about")}
            </h2>
            <p className="mt-6 max-w-2xl text-[1.1rem] font-medium leading-relaxed text-[#8c7e73] opacity-90">
              {t("subheading", "about")}
            </p>
            <p className="mt-6 max-w-2xl text-[0.95rem] leading-7 text-[#8c7e73] opacity-80">
              {t("description", "about")}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {about.stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className="bg-[#ffffff] px-6 py-8 rounded-[24px] border border-[#ead5be]/60 shadow-[0_4px_20px_rgba(235,218,202,0.3)]">
                  <div className="fd text-[2.5rem] leading-none font-light text-[#bb8c4b] italic mb-3">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#41362f] opacity-80">
                    {t(stat.label.toLowerCase(), "about")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar, idx) => {
              const iconKey = (pillar.icon || "").toLowerCase();
              const Icon = PILLAR_ICON_MAP[iconKey];
              const StatIcon = Icon;
              return (
                <div key={idx} className="bg-[#ffffff] p-8 flex flex-col items-center text-center rounded-[32px] border border-[#ead5be]/60 shadow-[0_8px_30px_rgba(235,218,202,0.3)] hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(235,218,202,0.5)] transition-all duration-700">
                  <div className="w-16 h-16 rounded-2xl bg-[#fdfaf5] flex items-center justify-center mb-6 border border-[#ead5be]/40">
                    {StatIcon ? <StatIcon className="text-[#bb8c4b]" size={28} strokeWidth={1.5} /> : <span className="text-xl text-[#bb8c4b]">{pillar.icon || "✦"}</span>}
                  </div>
                  <div className="text-xl font-normal fd italic text-[#41362f] mb-3">{pillar.title}</div>
                  <div className="text-[0.9rem] leading-relaxed text-[#8c7e73] font-medium opacity-90">{pillar.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
