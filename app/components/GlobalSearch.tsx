"use client";

import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Clock,
  MapPin,
  RefreshCcw,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEFAULT_EXPERIENCE_CATEGORIES,
  normalizeCategoryId,
  normalizeSiteConfig,
} from "@/lib/site-config";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchTranslation = {
  title?: string;
  subtitle?: string;
  shortDescription?: string;
  fullDescription?: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
};

type SearchActivity = {
  _id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  shortDescription?: string;
  fullDescription?: string;
  category?: string;
  experienceCategories?: string[];
  badge?: string;
  duration?: string;
  image?: string;
  images?: string[];
  price?: number;
  rating?: number;
  location?:
  | string
  | {
    address?: string;
    details?: string;
  };
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  translations?: Record<string, SearchTranslation>;
};

type SearchCategory = {
  id: string;
  label: string;
  icon: string;
};

type SearchDocument = {
  title: string;
  subtitle: string;
  description: string;
  categories: string;
  location: string;
  keywords: string;
  full: string;
};

type RankedResult = {
  activity: SearchActivity;
  href: string;
  title: string;
  subtitle: string;
  location: string;
  imageSrc: string;
  score: number;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c";
const FALLBACK_TRENDING_TERMS = [
  "Desert Safari",
  "Luxury Yacht",
  "Burj Khalifa",
  "Hot Air Balloon",
  "Dhow Cruise",
  "Scuba Diving",
];
const MAX_RESULTS = 8;
const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  desert: "Desert Safari",
  atv: "ATV & Buggy",
  luxury: "Luxury Escape",
  sky: "Sky Adventure",
  water: "Water Experience",
  city: "City Tours",
};

function asTextArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }

  return [] as string[];
}

function normalizeText(value: unknown) {
  const text = asTextArray(value).join(" ").trim();
  if (!text) {
    return "";
  }

  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getActivityTranslation(activity: SearchActivity, language: string) {
  return activity.translations?.[language];
}

function getDisplayTitle(activity: SearchActivity, language: string) {
  return getActivityTranslation(activity, language)?.title || activity.title || "Dubai Experience";
}

function getDisplaySubtitle(activity: SearchActivity, language: string) {
  return getActivityTranslation(activity, language)?.subtitle || activity.subtitle || "";
}

function getLocationParts(location: SearchActivity["location"]) {
  if (typeof location === "string") {
    return {
      address: location,
      details: "",
      combined: location,
    };
  }

  if (!location || typeof location !== "object") {
    return {
      address: "",
      details: "",
      combined: "",
    };
  }

  const address = typeof location.address === "string" ? location.address : "";
  const details = typeof location.details === "string" ? location.details : "";

  return {
    address,
    details,
    combined: [address, details].filter(Boolean).join(" "),
  };
}

function getActivityImage(activity: SearchActivity) {
  const candidates = [activity.image, ...(activity.images || [])];
  return candidates.find((item) => typeof item === "string" && item.trim().length > 0) || FALLBACK_IMAGE;
}

function getActivityHref(activity: SearchActivity) {
  const identifier = activity.id || activity._id;
  return typeof identifier === "string" && identifier.trim().length > 0
    ? `/activities/${identifier}`
    : "";
}

function buildSearchDocument(activity: SearchActivity, language: string): SearchDocument {
  const translation = getActivityTranslation(activity, language);
  const location = getLocationParts(activity.location);

  const title = normalizeText([translation?.title, activity.title]);
  const subtitle = normalizeText([translation?.subtitle, activity.subtitle]);
  const description = normalizeText([
    translation?.shortDescription,
    activity.shortDescription,
    translation?.fullDescription,
    activity.fullDescription,
  ]);
  const categories = normalizeText([
    activity.category,
    activity.badge,
    ...(activity.experienceCategories || []),
  ]);
  const keywords = normalizeText([
    ...(translation?.highlights || []),
    ...(activity.highlights || []),
    ...(translation?.included || []),
    ...(activity.included || []),
    ...(translation?.notIncluded || []),
    ...(activity.notIncluded || []),
  ]);
  const locationText = normalizeText(location.combined);

  return {
    title,
    subtitle,
    description,
    categories,
    location: locationText,
    keywords,
    full: [title, subtitle, description, categories, locationText, keywords]
      .filter(Boolean)
      .join(" "),
  };
}

function getDisplayDescription(activity: SearchActivity, language: string) {
  const translation = getActivityTranslation(activity, language);
  return (
    translation?.shortDescription ||
    activity.shortDescription ||
    translation?.fullDescription ||
    activity.fullDescription ||
    "Explore this Dubai experience in detail."
  );
}

function getActivityCategoryLabel(
  activity: SearchActivity,
  categoryLabels: Map<string, string>,
) {
  const explicitCategory = (activity.experienceCategories || [])
    .map((category) => normalizeCategoryId(category))
    .find((categoryId) => categoryLabels.has(categoryId));

  if (explicitCategory) {
    return categoryLabels.get(explicitCategory) || "Experience";
  }

  if (typeof activity.category === "string" && activity.category.trim()) {
    return DEFAULT_CATEGORY_LABELS[activity.category] || activity.category;
  }

  return "Experience";
}

function getActivityTags(activity: SearchActivity, categoryLabels: Map<string, string>) {
  const tags = [
    activity.badge,
    ...(activity.experienceCategories || []).map((category) => {
      const normalizedCategory = normalizeCategoryId(category);
      return categoryLabels.get(normalizedCategory) || category;
    }),
  ]
    .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    .filter((tag, index, values) => values.indexOf(tag) === index);

  return tags.slice(0, 4);
}

function scoreActivityMatch(activity: SearchActivity, query: string, language: string) {
  const href = getActivityHref(activity);
  if (!href || !query) {
    return null;
  }

  const queryTokens = query.split(" ").filter(Boolean);
  if (!queryTokens.length) {
    return null;
  }

  const doc = buildSearchDocument(activity, language);
  let score = 0;

  if (doc.title === query) score += 400;
  if (doc.title.startsWith(query)) score += 240;
  if (doc.title.includes(query)) score += 180;
  if (doc.full.includes(query)) score += 60;
  if (doc.subtitle.includes(query)) score += 120;
  if (doc.categories.includes(query)) score += 115;
  if (doc.location.includes(query)) score += 100;
  if (doc.description.includes(query)) score += 80;
  if (doc.keywords.includes(query)) score += 70;

  let matchedTokens = 0;

  for (const token of queryTokens) {
    let matched = false;

    if (doc.title.includes(token)) {
      score += 44;
      matched = true;
    }
    if (doc.subtitle.includes(token)) {
      score += 24;
      matched = true;
    }
    if (doc.categories.includes(token)) {
      score += 30;
      matched = true;
    }
    if (doc.location.includes(token)) {
      score += 24;
      matched = true;
    }
    if (doc.description.includes(token)) {
      score += 18;
      matched = true;
    }
    if (doc.keywords.includes(token)) {
      score += 16;
      matched = true;
    }

    if (matched) {
      matchedTokens += 1;
    }
  }

  if (!score || !matchedTokens) {
    return null;
  }

  if (queryTokens.length > 1) {
    if (matchedTokens === queryTokens.length) {
      score += 60;
    } else if (matchedTokens >= Math.max(2, queryTokens.length - 1)) {
      score += 16;
    } else {
      return null;
    }
  }

  const displayTitle = getDisplayTitle(activity, language);
  const displaySubtitle = getDisplaySubtitle(activity, language);
  const location = getLocationParts(activity.location);

  return {
    activity,
    href,
    title: displayTitle,
    subtitle: displaySubtitle,
    location: location.address || location.details || "Dubai",
    imageSrc: getActivityImage(activity),
    score: score + Math.round((activity.rating || 0) * 2),
  } satisfies RankedResult;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const { currency, convert } = useCurrency();
  const { language } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState<SearchActivity[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>(DEFAULT_EXPERIENCE_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [reloadToken, setReloadToken] = useState(0);
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeText(deferredQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      setQuery("");
      setActiveIndex(-1);
      return;
    }

    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || (hasFetchedInitialData && reloadToken === 0 && activities.length > 0)) {
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    async function loadSearchData() {
      setIsLoading(true);
      setError("");

      const [activitiesResult, configResult] = await Promise.allSettled([
        fetch("/api/activities", { cache: "no-store", signal: controller.signal }),
        fetch("/api/config", { cache: "no-store", signal: controller.signal }),
      ]);

      if (isCancelled) {
        return;
      }

      if (activitiesResult.status === "fulfilled") {
        try {
          const activityPayload = await activitiesResult.value.json();
          setActivities(Array.isArray(activityPayload) ? activityPayload : []);
        } catch (parseError) {
          console.error("Search activity parse error:", parseError);
          setActivities([]);
          setError("We couldn't load experiences for search right now.");
        }
      } else if ((activitiesResult.reason as Error)?.name !== "AbortError") {
        console.error("Search activity fetch error:", activitiesResult.reason);
        setError("We couldn't load experiences for search right now.");
      }

      if (configResult.status === "fulfilled") {
        try {
          const configPayload = await configResult.value.json();
          const normalizedConfig = normalizeSiteConfig(configPayload);
          if (Array.isArray(normalizedConfig.categories) && normalizedConfig.categories.length > 0) {
            setCategories(normalizedConfig.categories);
          }
        } catch (parseError) {
          console.error("Search config parse error:", parseError);
        }
      } else if ((configResult.reason as Error)?.name !== "AbortError") {
        console.error("Search config fetch error:", configResult.reason);
      }

      setHasFetchedInitialData(true);
      setIsLoading(false);
      if (reloadToken !== 0) {
        setReloadToken(0);
      }
    }

    void loadSearchData();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [activities.length, hasFetchedInitialData, isOpen, reloadToken]);

  const rankedResults = normalizedQuery
    ? activities
      .map((activity) => scoreActivityMatch(activity, normalizedQuery, language))
      .filter((result): result is RankedResult => Boolean(result))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return left.title.localeCompare(right.title);
      })
      .slice(0, MAX_RESULTS)
    : [];
  const categoryLabels = new Map(categories.map((category) => [category.id, category.label]));

  useEffect(() => {
    if (!normalizedQuery || rankedResults.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(0);
  }, [normalizedQuery, rankedResults.length]);

  const quickCategories = categories.filter((category) => category.id !== "all").slice(0, 3);
  const trendingTerms = [...activities]
    .sort((left, right) => (right.rating || 0) - (left.rating || 0))
    .map((activity) => getDisplayTitle(activity, language))
    .filter((term, index, values) => Boolean(term) && values.indexOf(term) === index)
    .slice(0, 6);

  const quickSearchTerms = trendingTerms.length > 0 ? trendingTerms : FALLBACK_TRENDING_TERMS;
  const highlightedResult = activeIndex >= 0 ? rankedResults[activeIndex] : null;
  const showInitialLoading = isLoading && !hasFetchedInitialData;
  const hasNoActivities = hasFetchedInitialData && !isLoading && !error && activities.length === 0;

  const handleRetry = () => {
    setReloadToken((current) => current + 1);
  };

  const handleNavigateToActivity = (result: RankedResult) => {
    onClose();
    router.push(result.href);
  };

  const handleCategoryJump = (categoryId: string) => {
    localStorage.setItem("activeCategory", categoryId);
    window.dispatchEvent(new CustomEvent("categoryFilterChanged", { detail: categoryId }));
    onClose();
    router.push("/#activities");
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && rankedResults.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current < rankedResults.length - 1 ? current + 1 : 0));
      return;
    }

    if (event.key === "ArrowUp" && rankedResults.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current > 0 ? current - 1 : rankedResults.length - 1));
      return;
    }

    if (event.key === "Enter" && highlightedResult) {
      event.preventDefault();
      handleNavigateToActivity(highlightedResult);
    }
  };

  if (!isOpen || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white/85 text-black backdrop-blur-2xl transition-all duration-500 animate-in fade-in zoom-in-95"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,158,11,0.08),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(0,0,0,0.03),transparent_20%),radial-gradient(circle_at_50%_82%,rgba(245,158,11,0.1),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.02),transparent_24%)]" />
      </div>

      <div className="relative w-full border-b border-black/5 bg-white/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-28 flex items-center justify-between gap-6">
          <div className="flex-1 flex items-center gap-4 relative min-w-0"> {/* <-- Note: added min-w-0 here to help flexbox truncate correctly */}
            <Search className="text-primary w-8 h-8 absolute left-0 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search tours, categories, locations, or highlights..."
              // Add 'truncate' to the end of these classes to fix the text cut-off
              className="w-full bg-transparent border-none outline-none text-2xl sm:text-4xl xl:text-5xl font-black text-black placeholder:text-black/40 pl-14 pr-14 focus:ring-0 tracking-tight truncate"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-0 text-black/50 hover:text-black transition-colors p-2 bg-white/40 rounded-full"
                aria-label="Clear search query"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center text-black/50 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm shrink-0 uppercase text-[10px] font-black tracking-widest gap-1 flex-col"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto custom-scrollbar w-full py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {normalizedQuery ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2">
                  <Sparkles size={14} />
                  {showInitialLoading
                    ? "Searching Experiences..."
                    : rankedResults.length > 0
                      ? `${rankedResults.length} Curated Match${rankedResults.length === 1 ? "" : "es"}`
                      : "No Exact Matches Found"}
                </h4>
                {highlightedResult && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/60">
                    Use arrow keys to browse and Enter to open {highlightedResult.title}
                  </p>
                )}
              </div>

              {error && !activities.length ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-1">
                      Search Temporarily Unavailable
                    </p>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-red-200 text-[11px] font-black uppercase tracking-[0.18em] text-red-600 hover:bg-red-50 transition-all"
                  >
                    <RefreshCcw size={14} />
                    Retry Search
                  </button>
                </div>
              ) : showInitialLoading ? (
                <div className="text-sm text-black/70 font-medium px-4 border-l-2 border-primary/50 py-2">
                  Curating the best matches for your search...
                </div>
              ) : rankedResults.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-8 items-start">
                  <div className="xl:col-span-7 space-y-4">
                    {rankedResults.map((result, index) => {
                      const isActive = index === activeIndex;
                      const displayCategory = getActivityCategoryLabel(result.activity, categoryLabels);
                      const displayDescription = getDisplayDescription(result.activity, language);
                      const displayTags = getActivityTags(result.activity, categoryLabels);

                      return (
                        <button
                          key={result.href}
                          type="button"
                          onClick={() => handleNavigateToActivity(result)}
                          onMouseEnter={() => setActiveIndex(index)}
                          onFocus={() => setActiveIndex(index)}
                          aria-pressed={isActive}
                          className={`group w-full text-left flex flex-col sm:flex-row gap-4 rounded-[28px] p-4 border bg-white transition-all duration-300 ${isActive
                            ? "border-primary shadow-2xl shadow-primary/10 -translate-y-0.5"
                            : "border-black/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5"
                            }`}
                        >
                          <div className="relative w-full sm:w-44 shrink-0 h-44 sm:h-36 rounded-2xl overflow-hidden">
                            <Image
                              src={result.imageSrc}
                              alt={result.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                            <div className="absolute right-3 top-3 bg-black/55 text-white text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase border border-white/20">
                              {currency}{" "}
                              {convert(result.activity.price || 0).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                <Sparkles size={12} />
                                <span className="line-clamp-1">{displayCategory}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {typeof result.activity.rating === "number" && result.activity.rating > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">
                                    <Star size={11} className="text-primary fill-primary" />
                                    <span>{result.activity.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {result.activity.duration && (
                                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">
                                    <Clock size={12} />
                                    <span>{result.activity.duration}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h4 className="text-xl font-black text-black uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                              {result.title}
                            </h4>

                            <p className="text-sm text-gray-600 font-medium leading-relaxed mt-3 line-clamp-2">
                              {displayDescription}
                            </p>

                            {displayTags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {displayTags.map((tag) => (
                                  <span
                                    key={`${result.href}-${tag}`}
                                    className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-[0.14em] text-primary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <MapPin size={14} className="text-primary shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 truncate">
                                  {result.location}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary shrink-0">
                                View
                                <ArrowRight size={14} className={isActive ? "translate-x-0.5" : ""} />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden xl:block xl:col-span-5">
                    {highlightedResult && (
                      <div className="sticky top-0 rounded-[32px] overflow-hidden border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={highlightedResult.imageSrc}
                            alt={highlightedResult.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                          <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                            <Sparkles size={12} />
                            {getActivityCategoryLabel(highlightedResult.activity, categoryLabels)}
                          </div>
                          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/80 mb-2">
                                Selected Experience
                              </p>
                              <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-tight line-clamp-2">
                                {highlightedResult.title}
                              </h3>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-white/15 bg-black/45 px-4 py-3 text-right text-white backdrop-blur-md">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80 mb-1">From</p>
                              <p className="text-xl font-black">
                                {currency}{" "}
                                {convert(highlightedResult.activity.price || 0).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-7">
                          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
                            {typeof highlightedResult.activity.rating === "number" && highlightedResult.activity.rating > 0 && (
                              <span className="inline-flex items-center gap-1.5">
                                <Star size={12} className="text-primary fill-primary" />
                                {highlightedResult.activity.rating.toFixed(1)}
                              </span>
                            )}
                            {highlightedResult.activity.duration && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock size={12} />
                                {highlightedResult.activity.duration}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 truncate min-w-0">
                              <MapPin size={12} className="shrink-0 text-primary" />
                              <span className="truncate">{highlightedResult.location}</span>
                            </span>
                          </div>

                          <p className="mt-5 text-sm leading-relaxed text-gray-600 font-medium">
                            {getDisplayDescription(highlightedResult.activity, language)}
                          </p>

                          {getActivityTags(highlightedResult.activity, categoryLabels).length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                              {getActivityTags(highlightedResult.activity, categoryLabels).map((tag) => (
                                <span
                                  key={`preview-${highlightedResult.href}-${tag}`}
                                  className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-[0.14em] text-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-7 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleNavigateToActivity(highlightedResult)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white hover:brightness-105 transition-all"
                            >
                              View Experience
                              <ArrowRight size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const bookingId = highlightedResult.activity.id || highlightedResult.activity._id;
                                onClose();
                                router.push(bookingId ? `/book/${bookingId}` : highlightedResult.href);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-black/5 px-4 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-black hover:bg-black/10 transition-all"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : hasNoActivities ? (
                <div className="text-sm text-black/70 font-medium px-4 border-l-2 border-primary/50 py-2">
                  There are no published experiences available to search yet.
                </div>
              ) : (
                <div className="rounded-3xl border border-black/10 bg-white/60 backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
                    Try a Different Angle
                  </p>
                  <p className="text-sm text-black/70 font-medium mb-5">
                    Search by location, a category like luxury yacht or desert safari, or try one of the popular shortcuts below.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {quickSearchTerms.slice(0, 4).map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="px-5 py-3 rounded-full border border-black/10 bg-black/5 hover:border-primary/60 hover:bg-black/10 hover:text-black transition-all text-[11px] font-black text-black/80 uppercase tracking-[0.18em]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-7 space-y-14">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary mb-8 flex items-center gap-2">
                    <Search size={14} />
                    Popular Searches
                  </h4>

                  {error && !activities.length ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                      <p className="text-sm text-red-700 font-medium mb-4">{error}</p>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-red-200 text-[11px] font-black uppercase tracking-[0.18em] text-red-600 hover:bg-red-50 transition-all"
                      >
                        <RefreshCcw size={14} />
                        Retry Search
                      </button>
                    </div>
                  ) : showInitialLoading ? (
                    <div className="text-sm text-black/70 font-medium px-4 border-l-2 border-primary/50 py-2">
                      Loading your searchable experiences...
                    </div>
                  ) : (
                    <div className="rounded-[32px] border border-black/10 bg-white/60 backdrop-blur-xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
                      <div className="flex flex-wrap gap-3">
                        {quickSearchTerms.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="px-6 py-3 rounded-full border border-black/10 bg-black/5 hover:border-primary/60 focus:border-primary/60 hover:bg-black/10 hover:text-black transition-all text-sm font-bold text-black/80 uppercase tracking-wider text-[11px]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary mb-8 flex items-center gap-2">
                    <MapPin size={14} />
                    Popular Categories
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {quickCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryJump(category.id)}
                        className="p-4 rounded-[28px] bg-white/60 border border-black/10 hover:bg-black/5 hover:border-primary/40 transition-all text-center flex flex-col items-center justify-center gap-2 min-h-[104px] shadow-[0_18px_50px_rgba(0,0,0,0.05)]"
                      >
                        <span className="text-lg leading-none text-primary">{category.icon || "✦"}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-black text-center">
                          {category.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 hidden md:block">
                <div className="bg-white/70 rounded-[3rem] p-10 border border-black/10 relative overflow-hidden group hover:border-primary/40 transition-colors duration-500 shadow-[0_25px_90px_rgba(0,0,0,0.08)] backdrop-blur-md">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                  <Sparkles className="text-primary w-10 h-10 mb-8" />
                  <h3 className="text-3xl font-black text-black uppercase tracking-tight mb-4 leading-none">
                    Can&apos;t Decide?
                  </h3>
                  <p className="text-base font-medium text-black/70 leading-relaxed mb-10">
                    Let our advanced AI concierge architect the perfect Dubai itinerary for your travel style, budget, and group size.
                  </p>
                  <Link
                    href="/planner"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-3 w-full py-5 bg-primary border border-primary/40 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white hover:brightness-105 transition-all shadow-xl shadow-primary/20"
                  >
                    Open AI Planner
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
