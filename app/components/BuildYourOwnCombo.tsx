"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, Sparkles, X, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import type { Activity } from "../types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Price from "./Price";

interface BuildYourOwnComboProps {
  activities: Activity[];
  siteName?: string;
  whatsapp?: string;
  contactEmail?: string;
  contactPhone?: string;
  className?: string;
}

const MIN_SELECTION = 2;
const MAX_SELECTION = 6;

export default function BuildYourOwnCombo({
  activities,
  siteName = "Dubai Adventures",
  whatsapp,
  contactEmail,
  contactPhone,
  className,
}: BuildYourOwnComboProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filteredActivities = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((activity) => {
      const haystack = [
        activity.title,
        activity.subtitle,
        activity.shortDescription,
        activity.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [activities, query]);

  const selectedActivities = useMemo(
    () => activities.filter((activity) => selectedIds.includes(activity.id)),
    [activities, selectedIds],
  );

  const stats = useMemo(() => {
    const originalTotal = selectedActivities.reduce((acc, curr) => acc + curr.price, 0);
    let discount = 0;
    if (selectedActivities.length === 2) discount = 0.10; // 10%
    else if (selectedActivities.length >= 3) discount = 0.20; // 20%

    const savings = originalTotal * discount;
    const bundlePrice = originalTotal - savings;

    return {
      originalTotal,
      bundlePrice,
      savings,
      discountPercent: discount * 100
    };
  }, [selectedActivities]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_SELECTION) {
        return current;
      }
      return [...current, id];
    });
  };

  const handleCheckout = () => {
    if (selectedIds.length < MIN_SELECTION) return;

    const bundleData = {
      id: `bundle-${Date.now()}`,
      title: `Custom Bundle (${selectedActivities.length} Experiences)`,
      subtitle: selectedActivities.map(a => a.title).join(" + "),
      price: stats.bundlePrice,
      originalPrice: stats.originalTotal,
      items: selectedActivities,
      isBundle: true,
      image: selectedActivities[0]?.image || "",
    };

    localStorage.setItem("pending_bundle", JSON.stringify(bundleData));
    router.push("/book/bundle");
  };

  return (
    <>
      {/* Trigger Card - Light/Creamy/Gold Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          "relative overflow-hidden rounded-[32px] border-2 border-[#D4A744] bg-[#fcfbf7] p-8 shadow-xl transition-all duration-500 hover:shadow-2xl md:p-10",
          className,
        )}
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f59e0b]/5 blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#f59e0b]/5 blur-[100px]" />

        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#e5c07b]/40 bg-white text-[#d4a045] shadow-sm">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e5c07b]/30 bg-[#e5c07b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d4a045]">
                <Tag size={12} /> Exclusive Bundle Offer
              </div>
              <h3 className="fd text-3xl font-light text-[#1a1612] sm:text-4xl">
                Bundle & <em className="not-italic gold-text">Save Big</em>
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#645c55] sm:text-base">
                Combine your favorite experiences into one luxury package. Select 2 items for <span className="text-[#d4a045] font-bold">10% OFF</span>, or 3+ for an incredible <span className="text-[#d4a045] font-bold">20% OFF</span> the total.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #e5c07b 0%, #d4a045 100%)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Building <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
          </button>
        </div>
      </motion.div>

      {/* Main Modal - Light Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1a1612]/40 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative z-10 flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] border border-white bg-[#fcfbf7] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-6 sm:px-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5c07b]/10 border border-[#e5c07b]/20 text-[#d4a045]">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="fd text-2xl font-normal text-[#1a1612] sm:text-3xl italic">Bundle & Save Builder</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4a045]">Customizing Your Luxury Trio</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white text-black/30 transition-all hover:bg-black/5 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 sm:px-10">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h5 className="text-lg font-bold text-[#1a1612] mb-1">Select Premium Experiences</h5>
                    <p className="text-sm text-[#645c55]">Add 2 or more activities to unlock tiered savings.</p>
                  </div>
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9187]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search adventures..."
                      className="w-full rounded-2xl border border-black/5 bg-white pl-11 pr-5 py-3 text-sm text-[#1a1612] outline-none transition-all focus:border-[#e5c07b]/50 focus:ring-1 focus:ring-[#e5c07b]/50 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-32">
                  {filteredActivities.map((activity) => {
                    const isSelected = selectedIds.includes(activity.id);
                    return (
                      <motion.button
                        key={activity.id}
                        layout
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSelection(activity.id)}
                        className={cn(
                          "group relative flex flex-col overflow-hidden rounded-[24px] border transition-all duration-300 text-left h-full",
                          isSelected
                            ? "border-2 border-[#D4A744] bg-white shadow-md scale-[0.98]"
                            : "border-2 border-[#D4A744]/20 bg-white hover:border-[#D4A744] hover:shadow-sm"
                        )}
                      >
                        <div className="relative h-40 w-full overflow-hidden">
                          <img src={activity.image} alt={activity.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#e5c07b] text-white">
                              <Check size={14} strokeWidth={4} />
                            </motion.div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4a045] mb-1">{activity.category}</p>
                          <h6 className="font-bold text-[#1a1612] line-clamp-1 group-hover:text-[#d4a045] transition-colors">{activity.title}</h6>
                          <div className="mt-auto pt-3 flex items-center justify-between">
                            <span className="text-sm font-bold text-[#4a443f]">
                              <Price amount={activity.price} />
                            </span>
                            {!isSelected && <span className="text-[10px] font-bold text-[#9a9187] uppercase tracking-tighter group-hover:text-[#d4a045] transition-colors">Select +</span>}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Selection Dock - Light Style */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="absolute bottom-0 left-0 right-0 z-20 border-t border-black/5 bg-white/95 backdrop-blur-2xl px-6 py-6 sm:px-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
                  >
                    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* Pill Summary with Thumbnails */}
                      <div className="flex flex-1 items-center gap-4 overflow-hidden">
                        <div className="flex -space-x-3 overflow-hidden">
                          {selectedActivities.map((a, i) => (
                            <motion.div
                              key={a.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm"
                            >
                              <img src={a.image} alt={a.title} className="h-full w-full object-cover" title={a.title} />
                            </motion.div>
                          ))}
                        </div>
                        <div className="hidden h-8 w-px bg-black/5 sm:block" />
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1">
                          {selectedActivities.map(a => (
                            <div key={a.id} className="flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3 py-1.5 whitespace-nowrap">
                              <span className="text-xs font-bold text-[#1a1612]">{a.title}</span>
                              <button onClick={() => toggleSelection(a.id)} className="text-black/20 hover:text-red-500">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Summary */}
                      <div className="flex items-center justify-between gap-10 border-t border-black/5 pt-5 lg:border-t-0 lg:pt-0">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-3">
                            {stats.discountPercent > 0 && (
                              <span className="text-xs font-bold text-[#9a9187] line-through">
                                <Price amount={stats.originalTotal} />
                              </span>
                            )}
                            <span className="fd text-2xl font-normal text-[#1a1612] leading-none">
                              <Price amount={stats.bundlePrice} className="gold-text font-bold" />
                            </span>
                          </div>
                          {stats.discountPercent > 0 && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4a045]">Tiered Savings Applied</span>
                              <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-white">-{stats.discountPercent}%</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleCheckout}
                          disabled={selectedIds.length < MIN_SELECTION}
                          className={cn(
                            "group flex items-center justify-center gap-3 rounded-full px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500",
                            selectedIds.length >= MIN_SELECTION
                              ? "text-white shadow-lg shadow-[#e5c07b]/30 hover:scale-105 active:scale-95"
                              : "bg-black/5 text-black/20 cursor-not-allowed"
                          )}
                          style={selectedIds.length >= MIN_SELECTION ? {
                            background: 'linear-gradient(135deg, #e5c07b 0%, #d4a045 100%)'
                          } : {}}
                        >
                          <ShoppingBag size={16} />
                          {selectedIds.length < MIN_SELECTION
                            ? `Select ${MIN_SELECTION - selectedIds.length} more`
                            : "Secure Bundle"
                          }
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
