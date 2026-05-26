"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { normalizeSiteConfig } from "@/lib/site-config";

const FALLBACK_HERO = {
  eyebrow: "Dubai Adventures",
  title: "About Our Story",
  description:
    "Learn how we design premium desert experiences, how we operate on-ground, and what guests can expect before booking with us.",
};

export default function AboutPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [hero, setHero] = useState(FALLBACK_HERO);

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const normalized = normalizeSiteConfig(data);
        setHero({
          eyebrow: normalized.aboutPage?.eyebrow || FALLBACK_HERO.eyebrow,
          title: normalized.aboutPage?.title || FALLBACK_HERO.title,
          description: normalized.aboutPage?.description || FALLBACK_HERO.description,
        });
      })
      .catch((error) => {
        console.error("About page config fetch error:", error);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#fdfaf5] text-[#41362f] selection:bg-[#bb8c4b]/20 selection:text-[#41362f]">
      <Navbar
        hasBooking={false}
        onCartClick={() => {
          window.location.href = "/#activities";
        }}
        onAuthClick={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <section className="border-b border-[#ead5be]/40 bg-gradient-to-b from-[#ffffff] to-[#fdfaf5] pt-32 pb-14">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#bb8c4b]">
            {hero.eyebrow}
          </p>
          <h1 className="fd text-5xl font-light text-[#41362f] italic sm:text-6xl drop-shadow-sm">
            {hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[1.1rem] font-medium leading-relaxed text-[#8c7e73] opacity-90">
            {hero.description}
          </p>
        </div>
      </section>

      <AboutSection />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <Footer />
    </main>
  );
}
