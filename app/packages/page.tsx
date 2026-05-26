"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import PackageCard from "../components/PackageCard";
import type { TourPackageSummary } from "../types";

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(res => {
        if (res.data) setPackages(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch packages:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1546412414-e1885259563a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Dubai Multi-Day Tours"
            fill
            className="object-cover opacity-50 hero-image"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/80 to-transparent" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
              Exclusive Itineraries
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-text-light mb-6 tracking-tight font-display">
              Multi-Day <em className="gold-text not-italic">Packages</em>
            </h1>
            <p className="text-base md:text-lg text-text-light/80 font-medium max-w-2xl mx-auto">
              Immerse yourself in the ultimate Dubai experience with our curated, multi-day luxury itineraries. From desert escapes to city extravaganzas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <Compass className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-text-dark mb-2">No Packages Available</h3>
              <p className="text-text-muted-dark">Check back later for exclusive new itineraries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <PackageCard pkg={pkg} priority={i < 2} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
