"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Shield, Lock, Eye, CheckCircle2, ArrowLeft } from "lucide-react";
import { normalizeSiteConfig } from "@/lib/site-config";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LegalContent from "../components/LegalContent";

export default function PrivacyPolicy() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        const normalized = normalizeSiteConfig(data);
        setContent(normalized.legal.privacyPolicy);
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Navbar hasBooking={false} onCartClick={() => {}} onAuthClick={() => {}} />

      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {/* Breadcrumb / Back Link */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-muted-dark hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>

          {/* Hero Section */}
          <div className="mb-16">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/20 backdrop-blur-sm"
            >
              <Shield className="w-8 h-8 text-primary" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="fd text-5xl sm:text-6xl font-light text-text-dark mb-6 tracking-tight"
            >
              Privacy <em className="gold-text not-italic">Policy</em>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-muted-dark max-w-2xl leading-relaxed"
            >
              Your trust is our most valuable asset. Learn how we protect your personal information and ensure a secure experience at Dubai Adventures.
            </motion.p>
          </div>

          {/* Content Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative"
          >
            {/* Glass Container */}
            <div className="bg-white/40 backdrop-blur-md border border-[#b45309]/50 rounded-[32px] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(170,124,69,0.1)]">
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-primary/10 rounded w-3/4" />
                  <div className="h-4 bg-primary/10 rounded w-full" />
                  <div className="h-4 bg-primary/10 rounded w-5/6" />
                  <div className="h-4 bg-primary/10 rounded w-full" />
                </div>
              ) : (
                <div className="prose-container">
                  <LegalContent content={content} />
                </div>
              )}

              {/* Trust Badges */}
              {!loading && (
                <div className="mt-16 pt-12 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-text-dark">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-text-dark">No Data Selling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-text-dark">GDPR Compliant</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Accent Shadow */}
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent -z-10 blur-2xl opacity-50" />
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
