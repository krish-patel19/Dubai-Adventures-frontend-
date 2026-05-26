"use client";

import { useState, useEffect, ReactNode } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import dynamic from "next/dynamic";

type HomeStat = {
  value: string;
  label: string;
};

type HomeFeature = {
  icon: string;
  title: string;
  desc: string;
};

type HomeSiteConfig = {
  about?: {
    stats?: HomeStat[];
  };
  featuresHeading?: string;
  featuresSubheading?: string;
  features?: HomeFeature[];
  general?: {
    siteName?: string;
    contactEmail?: string;
    contactPhone?: string;
    siteLogoUrl?: string;
    siteTagline?: string;
  };
  social?: {
    whatsapp?: string;
  };
  siteName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

const DEFAULT_STATS: HomeStat[] = [
  { value: "10,000+", label: "Happy Travelers" },
  { value: "50+", label: "Premium Packages" },
  { value: "4.9★", label: "Average Rating" },
  { value: "10 Yrs", label: "Trusted Since 2014" },
];

const DEFAULT_FEATURES: HomeFeature[] = [
  {
    icon: "⭐",
    title: "5-Star Experiences",
    desc: "Handcrafted itineraries with premium vehicles, expert guides, and legendary hospitality.",
  },
  {
    icon: "🛡️",
    title: "100% Safe & Certified",
    desc: "Licensed operators, certified guides, and comprehensive insurance for total peace of mind.",
  },
  {
    icon: "⚡",
    title: "Instant Confirmation",
    desc: "Book within seconds and receive your voucher immediately. No waiting, no delays.",
  },
  {
    icon: "🔄",
    title: "Free Cancellation",
    desc: "Plans change — we get it. Cancel or reschedule up to 24 hours in advance, no fees.",
  },
];

const ReviewsSection = dynamic(() => import("./ReviewsSection"), {
  ssr: true,
});

const Footer = dynamic(() => import("./Footer"), {
  ssr: true,
});

const AuthModal = dynamic(() => import("./AuthModal"), {
  ssr: false,
});

interface HomeClientProps {
  initialSiteConfig: HomeSiteConfig | null;
  children: ReactNode;
}

export default function HomeClient({ initialSiteConfig, children }: HomeClientProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const auth = new URLSearchParams(window.location.search).get("auth");
    if (auth !== "login" && auth !== "signup") return;
    setAuthMode(auth);
    setIsAuthModalOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const stats = initialSiteConfig?.about?.stats?.length
    ? initialSiteConfig.about.stats
    : DEFAULT_STATS;
  const features = initialSiteConfig?.features?.length
    ? initialSiteConfig.features
    : DEFAULT_FEATURES;

  return (
    <main className="min-h-screen">
      <Navbar
        hasBooking={false}
        onCartClick={() => {
          document.getElementById("activities")?.scrollIntoView({ behavior: "smooth" });
        }}
        onAuthClick={(mode: "login" | "signup") => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
        initialSiteConfig={initialSiteConfig}
      />

      <Hero initialSiteConfig={initialSiteConfig} />

      <section className="bg-background-light border-b border-[#C9922A]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.slice(0, 4).map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="fd text-3xl sm:text-4xl font-light mb-1.5 gold-text">{stat.value}</p>
                <p className="text-xs tracking-widest uppercase font-semibold text-text-muted-dark">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/5 py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="fd text-4xl sm:text-5xl font-light text-text-dark">
              {initialSiteConfig?.featuresHeading ? (
                <span>
                  {initialSiteConfig.featuresHeading.replace("Dubai Adventures", "").trim()}{" "}
                  <em className="gold-text not-italic">Dubai Adventures</em>
                </span>
              ) : (
                <>
                  The <em className="gold-text not-italic">Dubai Adventures</em> Difference
                </>
              )}
            </h2>
            {initialSiteConfig?.featuresSubheading && (
              <p className="mt-4 text-text-muted-dark max-w-2xl mx-auto">{initialSiteConfig.featuresSubheading}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <div key={i} className="card p-7 transition-all duration-300 hover:-translate-y-2 group bg-white border border-[#D4A744]">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-[#fcfaf5] border border-[#D4A744]">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-base mb-2.5 text-text-dark">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted-dark">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {children}

      <ReviewsSection />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <Footer initialSiteConfig={initialSiteConfig} />
    </main>
  );
}
