"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Clock,
  Crown,
  Diamond,
  Heart,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeCategoryId } from "@/lib/site-config";
import type { TourPackageSummary } from "../types";
import Price from "./Price";
import { resolvePackageImages } from "../lib/package-images";

interface PackageCardProps {
  pkg: TourPackageSummary;
  className?: string;
  priority?: boolean;
}

export default function PackageCard({
  pkg,
  className,
  priority = false,
}: PackageCardProps) {
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);
  const packageHref = `/packages/${pkg.slug || pkg.id}`;
  const durationLabel = `${pkg.totalDays} Days / ${pkg.totalNights} Nights`;
  const normalizedCategory = normalizeCategoryId(pkg.category || "");
  const normalizedExperienceCategories = (pkg.experienceCategories || []).map(normalizeCategoryId);
  const isLuxury =
    pkg.badgeType === "luxury" ||
    normalizedCategory === "luxury" ||
    normalizedExperienceCategories.some((category) =>
      ["luxury", "vip", "premium-luxury", "royal"].includes(category),
    );
  const isPremium =
    isLuxury ||
    pkg.badgeType === "gold" ||
    pkg.badgeType === "popular" ||
    normalizedExperienceCategories.some((category) =>
      ["fine-dining", "sightseeing", "family"].includes(category),
    );

  const tierLabel = isLuxury ? "PREMIUM LUXURY" : isPremium ? "SIGNATURE" : "POPULAR";
  const tierIcon = isLuxury ? <Diamond size={12} /> : isPremium ? <Crown size={12} /> : <Sparkles size={12} />;
  const packageStyleLabel = formatPackageLabel(pkg.category || "Multi-Day Package");
  const packageSubtitle = pkg.subtitle || packageStyleLabel;
  const { heroImage } = resolvePackageImages(pkg);

  const openPackage = () => {
    router.push(packageHref);
  };

  const handleActionClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openPackage();
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openPackage}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPackage();
        }
      }}
      className={cn(
        "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[32px] border border-[#ebd5be] bg-white transition-all duration-500",
        isLuxury
          ? "border-[#c28639]/30 bg-slate-50 shadow-[0_15px_45px_rgba(194,134,57,0.15)]"
          : isPremium
            ? "border-[#D4A744]/30 shadow-[0_10px_30px_rgba(212,167,68,0.1)]"
            : "shadow-sm hover:border-[#D4A744]/40 hover:shadow-lg",
        className,
      )}
    >
      <div className="flex h-full w-full flex-col">
        <div className="relative aspect-[3/2] overflow-hidden rounded-t-[30px] bg-background-light shadow-inner">
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-secondary/10" />}
          <Image
            src={heroImage}
            alt={pkg.name}
            fill
            className={cn(
              "object-cover brightness-[1.1] transition duration-700 group-hover:scale-110",
              imgLoaded ? "opacity-100" : "opacity-0",
            )}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImgLoaded(true)}
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md",
                isLuxury ? "bg-[#c28639] text-white" : isPremium ? "bg-white text-[#aa7c45]" : "bg-white/90 text-[#645c55]",
              )}
            >
              {tierIcon}
              {tierLabel}
            </div>
            {pkg.badge && (
              <span className="w-fit rounded-full bg-primary/90 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-sm">
                {pkg.badge}
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40"
              aria-label={`Save ${pkg.name}`}
              type="button"
            >
              <Heart size={18} className="text-white" />
            </button>
            <button
              onClick={handleActionClick}
              className="group/cartbtn flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-[#c28639]"
              title="View Package"
              aria-label={`Open ${pkg.name}`}
              type="button"
            >
              <ShoppingCart size={18} className="text-white drop-shadow-md" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={cn("text-[#e5c07b]", star > Math.round(pkg.rating ?? 4.9) && "opacity-25")}
                      fill={star <= Math.round(pkg.rating ?? 4.9) ? "#e5c07b" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-white">{pkg.rating ?? 4.9}</span>
                <span className="truncate text-xs font-bold text-white/80">
                  ({(pkg.reviewCount ?? 0).toLocaleString()})
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
              <Clock size={12} className="text-[#e5c07b]" />
              <span className="whitespace-nowrap">{durationLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-500/20 shadow-sm">
              <Clock size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                <span className="whitespace-nowrap">{durationLabel}</span>
              </span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#8c7e73]">
              <Calendar size={10} className="fill-amber-500 text-amber-500" />
              Itinerary
            </span>
          </div>

          <h3 className="fd mb-3 min-h-[3.5rem] line-clamp-2 text-xl font-medium leading-tight text-[#1a1612]">
            {pkg.name}
          </h3>

          <p className="mb-6 min-h-[3rem] line-clamp-2 text-[13px] font-medium leading-relaxed text-[#645c55]">
            {pkg.overview || pkg.fullDescription || pkg.subtitle}
          </p>

          <div className="mb-6 grid grid-cols-2 gap-3 border-y border-[#f0e4d4]/50 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ead5be] bg-[#fdfaf5] text-[#c28639]">
                <Clock size={12} />
              </div>
              <div className="flex flex-col">
                <span className="mb-0.5 text-[9px] font-black uppercase leading-none tracking-tighter text-[#a89b8e]">
                  Duration
                </span>
                <span className="text-[11px] font-bold text-[#41362f]">
                  {durationLabel}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ead5be] bg-[#fdfaf5] text-[#c28639]">
                {isLuxury ? <Diamond size={12} /> : isPremium ? <Crown size={12} /> : <Sparkles size={12} />}
              </div>
              <div className="flex flex-col">
                <span className="mb-0.5 text-[9px] font-black uppercase leading-none tracking-tighter text-[#a89b8e]">
                  Package Style
                </span>
                <span className="truncate text-[11px] font-bold text-[#41362f]">
                  {packageStyleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-[#f0e4d4]/60 pt-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col">
                <span className="mb-2 text-[10px] font-black uppercase leading-none tracking-[0.15em] text-[#9a9187]">
                  PACKAGE PRICE
                </span>
                
                {pkg.originalPrice && pkg.originalPrice > pkg.basePrice && (
                  <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Price
                      amount={pkg.originalPrice}
                      strike={true}
                      strikeColor="#9a9187"
                      className="text-[13px] font-medium"
                    />
                    <span className="text-[8px] font-extrabold text-emerald-600 uppercase">Save {Math.round((1 - pkg.basePrice / pkg.originalPrice) * 100)}%</span>
                  </div>
                )}

                <div className="flex items-baseline leading-none">
                  <span className="fd text-3xl font-black" style={{ color: "#D4A744" }}>
                    <Price amount={pkg.basePrice} className="text-3xl" />
                  </span>
                </div>
                
                <span className="mt-3 text-[11px] font-bold leading-none text-[#9a9187]">
                  / per package
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={handleActionClick}
                className="group/btn relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-lg transition-all duration-300 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #e5c07b 0%, #c28639 100%)",
                  boxShadow: "0 8px 25px rgba(194,134,57,0.3)",
                }}
                type="button"
              >
                <span className="flex items-center gap-2">
                  DETAIL
                  <ChevronDown size={14} className="transition-transform group-hover/btn:translate-y-0.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatPackageLabel(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
