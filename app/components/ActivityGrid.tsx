"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import ActivityCard from "./ActivityCard";
import PackageCard from "./PackageCard";
import type { Activity, ExperienceCategory, TourPackageSummary } from "../types";
import {
  DEFAULT_EXPERIENCE_CATEGORIES,
  normalizeCategoryId,
} from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface Props {
  activities: Activity[];
  packages?: TourPackageSummary[];
  selectedId: string | null;
  comboCta?: ReactNode;
}

const CATEGORY_HINTS: Record<string, string[]> = {
  "super-savers": ["save", "deal", "budget", "value", "offer"],
  "city-tours": ["city", "tour", "downtown", "burj", "frame"],
  "atv-and-quad-biking": ["atv", "quad", "bike", "biking"],
  "desert-safari": ["desert", "safari", "dune"],
  "hot-air-balloon": ["balloon"],
  "luxury-yacht": ["yacht", "cruise", "boat"],
  "sandboarding": ["sandboard", "sandboarding"],
  "buggy-tours": ["buggy", "polaris", "can-am"],
};

type GridItem =
  | { kind: "activity"; key: string; item: Activity }
  | { kind: "package"; key: string; item: TourPackageSummary };

function resolveFilterCategories(categories: ExperienceCategory[]) {
  const hasAll = categories.some((category) => category.id === "all");
  return hasAll
    ? categories
    : [DEFAULT_EXPERIENCE_CATEGORIES[0], ...categories];
}

function matchesActivityCategory(activity: Activity, categoryId: string) {
  if (categoryId === "all") {
    return true;
  }

  const explicitCategories = (activity.experienceCategories || []).map(normalizeCategoryId);
  if (explicitCategories.includes(categoryId)) {
    return true;
  }

  const haystack = [
    activity.title,
    activity.subtitle,
    activity.shortDescription,
    activity.fullDescription,
    activity.category,
    activity.badge || "",
    ...(activity.highlights || []),
    ...(activity.included || []),
  ]
    .join(" ")
    .toLowerCase();

  switch (categoryId) {
    case "super-savers":
      return activity.price <= 250 || CATEGORY_HINTS[categoryId].some((hint) => haystack.includes(hint));
    case "city-tours":
      return activity.category === "city" || explicitCategories.includes(categoryId);
    case "multi-day-packages":
      return explicitCategories.includes(categoryId);
    default:
      return (CATEGORY_HINTS[categoryId] || []).some((hint) => haystack.includes(hint));
  }
}

function matchesPackageCategory(pkg: TourPackageSummary, categoryId: string) {
  if (categoryId === "all" || categoryId === "multi-day-packages") {
    return true;
  }

  const explicitCategories = (pkg.experienceCategories || []).map(normalizeCategoryId);
  return explicitCategories.includes(categoryId);
}

export default function ActivityGrid({
  activities,
  packages = [],
  selectedId,
  comboCta,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<ExperienceCategory[]>(DEFAULT_EXPERIENCE_CATEGORIES);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(resolveFilterCategories(data.categories));
        }
      })
      .catch(console.error);
  }, []);

  const filteredItems = useMemo<GridItem[]>(() => {
    const safeActivities = Array.isArray(activities) ? activities : [];
    const safePackages = Array.isArray(packages) ? packages : [];

    const activityItems = safeActivities
      .filter((activity) =>
        activeCategory === "all" ? true : matchesActivityCategory(activity, activeCategory),
      )
      .map((activity) => ({
        kind: "activity" as const,
        key: activity.id,
        item: activity,
      }));

    const packageItems = safePackages
      .filter((pkg) =>
        activeCategory === "all" ? true : matchesPackageCategory(pkg, activeCategory),
      )
      .map((pkg) => ({
        kind: "package" as const,
        key: pkg.slug || pkg.id,
        item: pkg,
      }));

    return [...activityItems, ...packageItems];
  }, [activeCategory, activities, packages]);

  useEffect(() => {
    setVisibleCards(new Set());
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.idx);
            setVisibleCards((current) => new Set([...current, index]));
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    cardRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [filteredItems.length]);

  useEffect(() => {
    // Check localStorage on mount for cross-page transitions
    const storedCategory = localStorage.getItem("activeCategory");
    if (storedCategory) {
      setActiveCategory(storedCategory);
      localStorage.removeItem("activeCategory"); // Consume it
    }

    const handleCategoryChange = (event: Event) => {
      setActiveCategory((event as CustomEvent<string>).detail);
    };

    window.addEventListener("categoryFilterChanged", handleCategoryChange);
    return () => window.removeEventListener("categoryFilterChanged", handleCategoryChange);
  }, []);


  return (
    <div id="activities" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="mb-16 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-primary">
            Curated Experiences
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <h2 className="fd mb-4 text-4xl font-light leading-tight text-text-dark sm:text-5xl md:text-6xl">
          Signature <em className="gold-text not-italic">Adventures</em>
        </h2>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-text-muted-dark">
          Handpicked experiences that deliver unparalleled thrills, curated filters, and luxury
          memories beneath Dubai&apos;s golden skies.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap items-center justify-center gap-2.5">
        {resolveFilterCategories(categories).map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300",
              activeCategory === category.id
                ? "border-primary/40 bg-primary/15 text-primary shadow-[0_10px_30px_rgba(212,150,42,0.16)]"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-800 hover:text-slate-900",
            )}
          >
            <span className="text-sm leading-none">{category.icon || "✦"}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {comboCta && activeCategory === "super-savers" && <div className="mb-12">{comboCta}</div>}

      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-7">
        {filteredItems.map((gridItem, index) => {
          return (
            <div key={`wrapper-${gridItem.kind}-${gridItem.key}`} className="contents">
              <div
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                data-idx={index}
                className={cn(
                  "h-full min-h-full transition-all duration-700",
                  visibleCards.has(index) ? "translate-y-0 opacity-100" : "translate-y-9 opacity-0",
                )}
                style={{ transitionDelay: `${(index % 3) * 90}ms` }}
              >
                {gridItem.kind === "activity" ? (
                  <ActivityCard
                    activity={gridItem.item}
                    isSelected={selectedId === gridItem.item.id}
                  />
                ) : (
                  <PackageCard pkg={gridItem.item} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#bb8c4b]/10 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-[#fdfaf5] border border-[#ead5be] shadow-inner">
              <Sparkles className="w-10 h-10 text-[#bb8c4b]/40 animate-pulse" />
            </div>
          </div>
          <h3 className="fd text-2xl font-light text-[#41362f] mb-3 tracking-tight italic">
            Curating New <em className="gold-text not-italic">Experiences</em>
          </h3>
          <p className="max-w-md text-center text-[13px] leading-relaxed text-[#8c7e73] font-medium tracking-wide">
            Our luxury collection is currently being finalized. <br />
            New signature packages will be arriving shortly in this category.
          </p>
          <div className="mt-10 h-px w-20 bg-gradient-to-r from-transparent via-[#bb8c4b]/30 to-transparent" />
        </div>
      )}
    </div>
  );
}
