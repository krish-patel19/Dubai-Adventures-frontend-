import { DEFAULT_GEMINI_CHAT_MODEL, migrateGeminiModelName } from "./ai/gemini-models";

type ConfigRecord = Record<string, unknown>;

const DEFAULT_HERO_BUTTON_TEXT = "Book Now";
const DEFAULT_HERO_BUTTON_LINK = "#activities";
const DEFAULT_ABOUT_PAGE = {
  eyebrow: "Dubai Adventures",
  title: "About Our Story",
  description: "Learn how we design premium desert experiences, how we operate on-ground, and what guests can expect before booking with us.",
};
const DEFAULT_ABOUT_PILLARS = [
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
];

export interface NormalizedPlannerFeatureCard {
  icon: string;
  title: string;
  desc: string;
}

export interface NormalizedPlannerPageConfig {
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroImages: string[];
  queryPlaceholder: string;
  submitLabel: string;
  loadingLabel: string;
  promptChipsLabel: string;
  emptyStateEyebrow: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  dayLabel: string;
  downloadLabel: string;
  experienceButtonLabel: string;
  featureCards: NormalizedPlannerFeatureCard[];
  examplePrompts: string[];
}

export interface NormalizedAiPlannerConfig {
  isActive: boolean;
  chatbotName: string;
  chatbotIcon: string;
  systemInstructions: string;
  welcomeGreeting: string;
  modelEngine: string;
  plannerPage: NormalizedPlannerPageConfig;
}

export const DEFAULT_AI_PLANNER_FEATURE_CARDS: NormalizedPlannerFeatureCard[] = [
  {
    icon: "compass",
    title: "Precision Tuning",
    desc: "Our AI maps your budget, group style, and must-do experiences into a sharper Dubai itinerary.",
  },
  {
    icon: "layout",
    title: "Live Inventory",
    desc: "Recommendations connect directly to real tours and packages your team is actively selling.",
  },
  {
    icon: "sparkles",
    title: "Luxury Concierge",
    desc: "From premium couples plans to family-friendly routes, the planner responds with polished structure fast.",
  },
];

export const DEFAULT_AI_PLANNER_EXAMPLE_PROMPTS = [
  "A 3-day luxury trip for 2 with desert safari and yacht cruise",
  "A family Dubai plan with theme parks, dinner cruise, and city highlights",
  "A romantic anniversary weekend with premium sunset experiences",
];

export const DEFAULT_AI_PLANNER_CONFIG: NormalizedAiPlannerConfig = {
  isActive: true,
  chatbotName: "AI Assistant",
  chatbotIcon: "sparkles",
  systemInstructions:
    "You are an expert luxury travel consultant for \"Dubai Adventures\". Your goal is to help users plan their dream Dubai experiences in a friendly, helpful, and sophisticated manner.",
  welcomeGreeting:
    "Salaam! I'm your Dubai Expert. I can help you find the best desert safari and luxury Dubai experiences.",
  modelEngine: DEFAULT_GEMINI_CHAT_MODEL,
  plannerPage: {
    heroEyebrow: "Next-Gen AI Intelligence",
    heroTitlePrefix: "Your Personal",
    heroTitleHighlight: "Dubai Architect",
    heroDescription:
      "Describe your travelers, budget, style, and must-do experiences. Our AI concierge will shape a polished Dubai itinerary around real bookable tours.",
    heroImages: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974",
      "https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=1974"
    ],
    queryPlaceholder: "E.g., 'A 3-day luxury trip for 2 with desert safari and yacht cruise...'",
    submitLabel: "Forge Itinerary",
    loadingLabel: "Architecting...",
    promptChipsLabel: "Try a concierge-ready brief",
    emptyStateEyebrow: "AI Concierge",
    emptyStateTitle: "Build a smarter Dubai trip brief",
    emptyStateDescription:
      "Share your travelers, dates, budget, and must-do experiences. The planner will return a day-by-day route linked to real tours.",
    dayLabel: "Day",
    downloadLabel: "Secure PDF",
    experienceButtonLabel: "Select Experience",
    featureCards: DEFAULT_AI_PLANNER_FEATURE_CARDS,
    examplePrompts: DEFAULT_AI_PLANNER_EXAMPLE_PROMPTS,
  },
};

export interface ExperienceCategoryConfig {
  id: string;
  label: string;
  icon: string;
}

export const DEFAULT_EXPERIENCE_CATEGORIES: ExperienceCategoryConfig[] = [
  { id: "all", label: "All Experiences", icon: "✦" },
  { id: "super-savers", label: "Super Savers", icon: "🏷️" },
  { id: "multi-day-packages", label: "Multi-Day Packages", icon: "🧳" },
  { id: "city-tours", label: "City Tours", icon: "🏙️" },
];

const REQUIRED_CATEGORY_INSERTS: Array<{
  after: string;
  category: ExperienceCategoryConfig;
}> = [
  {
    after: "super-savers",
    category: { id: "multi-day-packages", label: "Multi-Day Packages", icon: "🧳" },
  },
  {
    after: "multi-day-packages",
    category: { id: "city-tours", label: "City Tours", icon: "🏙️" },
  },
];

const defaultCategoryMap = new Map(DEFAULT_EXPERIENCE_CATEGORIES.map((category) => [category.id, category]));

function asRecord(value: unknown): ConfigRecord {
  return value && typeof value === "object" ? (value as ConfigRecord) : {};
}

function readString(source: ConfigRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(v => String(v).trim()).filter(Boolean) : [];
}

function readObjectArray(value: unknown) {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeCategoryId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function ensureRequiredCategories(categories: ExperienceCategoryConfig[]) {
  const nextCategories = [...categories];
  const seen = new Set(nextCategories.map((category) => category.id));

  REQUIRED_CATEGORY_INSERTS.forEach(({ after, category }) => {
    if (seen.has(category.id)) {
      return;
    }

    const insertAfterIndex = nextCategories.findIndex((item) => item.id === after);
    const insertAt = insertAfterIndex >= 0 ? insertAfterIndex + 1 : nextCategories.length;
    nextCategories.splice(insertAt, 0, category);
    seen.add(category.id);
  });

  return nextCategories;
}

function normalizeCategories(value: unknown): ExperienceCategoryConfig[] {
  const categories = readObjectArray(value)
    .map((category) => {
      const label = readString(category, ["label"]);
      const id = normalizeCategoryId(readString(category, ["id"], label));
      if (!id || !label) {
        return null;
      }

      const fallback = defaultCategoryMap.get(id);
      return {
        id,
        label,
        icon: readString(category, ["icon"], fallback?.icon || "✦"),
      };
    })
    .filter((category): category is ExperienceCategoryConfig => Boolean(category));

  if (!categories.length) {
    return ensureRequiredCategories(DEFAULT_EXPERIENCE_CATEGORIES);
  }

  const seen = new Set<string>();
  const dedupedCategories = categories.filter((category) => {
    if (seen.has(category.id)) {
      return false;
    }

    seen.add(category.id);
    return true;
  });

  return ensureRequiredCategories(dedupedCategories);
}

export interface NormalizedHeroSlide {
  fallbackImage: string;
  videoUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export function normalizeHeroSlide(input: unknown): NormalizedHeroSlide {
  const slide = asRecord(input);

  return {
    fallbackImage: readString(slide, ["fallbackImage", "fallbackImageUrl", "image", "imageUrl", "backgroundImage", "poster"]),
    videoUrl: readString(slide, ["videoUrl", "backgroundVideoUrl", "backgroundVideo", "video", "video_url", "mp4Url"]),
    title: readString(slide, ["title", "heading", "headline"]),
    subtitle: readString(slide, ["subtitle", "subheading", "tagline", "description"]),
    buttonText: readString(slide, ["buttonText", "ctaText", "primaryButtonText"], DEFAULT_HERO_BUTTON_TEXT),
    buttonLink: readString(slide, ["buttonLink", "ctaLink", "primaryButtonLink"], DEFAULT_HERO_BUTTON_LINK),
  };
}

export function isConfiguredHeroSlide(slide: NormalizedHeroSlide) {
  return Boolean(slide.title || slide.subtitle || slide.videoUrl || slide.fallbackImage);
}

function normalizePlannerFeatureCards(value: unknown) {
  const cards = readObjectArray(value)
    .map((card, index) => ({
      icon: readString(card, ["icon"], DEFAULT_AI_PLANNER_FEATURE_CARDS[index]?.icon || "sparkles"),
      title: readString(card, ["title"], DEFAULT_AI_PLANNER_FEATURE_CARDS[index]?.title || ""),
      desc: readString(card, ["desc", "text", "description"], DEFAULT_AI_PLANNER_FEATURE_CARDS[index]?.desc || ""),
    }))
    .filter((card) => card.title || card.desc);

  if (!cards.length) {
    return DEFAULT_AI_PLANNER_FEATURE_CARDS.map((card) => ({ ...card }));
  }

  return cards;
}

function normalizePlannerExamplePrompts(value: unknown) {
  const prompts = readStringArray(value);

  if (!prompts.length) {
    return [...DEFAULT_AI_PLANNER_EXAMPLE_PROMPTS];
  }

  return prompts;
}

export function normalizeAiPlannerConfig(input: unknown): NormalizedAiPlannerConfig {
  const planner = asRecord(input);
  const plannerPage = asRecord(planner.plannerPage);

  return {
    isActive: readBoolean(planner.isActive, DEFAULT_AI_PLANNER_CONFIG.isActive),
    chatbotName: readString(planner, ["chatbotName"], DEFAULT_AI_PLANNER_CONFIG.chatbotName),
    chatbotIcon: readString(planner, ["chatbotIcon"], DEFAULT_AI_PLANNER_CONFIG.chatbotIcon),
    systemInstructions: readString(
      planner,
      ["systemInstructions"],
      DEFAULT_AI_PLANNER_CONFIG.systemInstructions,
    ),
    welcomeGreeting: readString(planner, ["welcomeGreeting"], DEFAULT_AI_PLANNER_CONFIG.welcomeGreeting),
    modelEngine: migrateGeminiModelName(readString(planner, ["modelEngine"], DEFAULT_AI_PLANNER_CONFIG.modelEngine)),
    plannerPage: {
      heroEyebrow: readString(plannerPage, ["heroEyebrow"], DEFAULT_AI_PLANNER_CONFIG.plannerPage.heroEyebrow),
      heroTitlePrefix: readString(
        plannerPage,
        ["heroTitlePrefix", "heroTitleLineOne"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.heroTitlePrefix,
      ),
      heroTitleHighlight: readString(
        plannerPage,
        ["heroTitleHighlight", "heroTitleAccent"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.heroTitleHighlight,
      ),
      heroDescription: readString(
        plannerPage,
        ["heroDescription", "description"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.heroDescription,
      ),
      heroImages: readStringArray(plannerPage.heroImages || plannerPage.images).length
        ? readStringArray(plannerPage.heroImages || plannerPage.images)
        : [...DEFAULT_AI_PLANNER_CONFIG.plannerPage.heroImages],
      queryPlaceholder: readString(
        plannerPage,
        ["queryPlaceholder", "inputPlaceholder"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.queryPlaceholder,
      ),
      submitLabel: readString(plannerPage, ["submitLabel", "buttonLabel"], DEFAULT_AI_PLANNER_CONFIG.plannerPage.submitLabel),
      loadingLabel: readString(plannerPage, ["loadingLabel"], DEFAULT_AI_PLANNER_CONFIG.plannerPage.loadingLabel),
      promptChipsLabel: readString(
        plannerPage,
        ["promptChipsLabel", "quickPromptsLabel"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.promptChipsLabel,
      ),
      emptyStateEyebrow: readString(
        plannerPage,
        ["emptyStateEyebrow"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.emptyStateEyebrow,
      ),
      emptyStateTitle: readString(
        plannerPage,
        ["emptyStateTitle"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.emptyStateTitle,
      ),
      emptyStateDescription: readString(
        plannerPage,
        ["emptyStateDescription"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.emptyStateDescription,
      ),
      dayLabel: readString(plannerPage, ["dayLabel"], DEFAULT_AI_PLANNER_CONFIG.plannerPage.dayLabel),
      downloadLabel: readString(
        plannerPage,
        ["downloadLabel"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.downloadLabel,
      ),
      experienceButtonLabel: readString(
        plannerPage,
        ["experienceButtonLabel", "activityButtonLabel"],
        DEFAULT_AI_PLANNER_CONFIG.plannerPage.experienceButtonLabel,
      ),
      featureCards: normalizePlannerFeatureCards(plannerPage.featureCards),
      examplePrompts: normalizePlannerExamplePrompts(plannerPage.examplePrompts),
    },
  };
}

export function normalizeSiteConfig(input: unknown) {
  const config = asRecord(input);
  const general = asRecord(config.general);
  const about = asRecord(config.about);
  const aboutPage = asRecord(config.aboutPage);
  const seo = asRecord(config.seo);
  const social = asRecord(config.social);
  const legal = asRecord(config.legal);
  const heroSection = asRecord(config.heroSection);

  const rawHeroSlides = Array.isArray(config.heroSlides)
    ? config.heroSlides
    : Array.isArray(heroSection.slides)
      ? heroSection.slides
      : Array.isArray(config.slides)
        ? config.slides
        : [];

  const heroSlides = rawHeroSlides
    .map(normalizeHeroSlide)
    .filter(isConfiguredHeroSlide);

  const normalizedGeneral = {
    siteName: readString(general, ["siteName"], readString(config, ["siteName"], "Desert Safari Dubai")),
    siteLogoUrl: readString(general, ["siteLogoUrl"], readString(config, ["siteLogoUrl"])),
    siteTagline: readString(general, ["siteTagline"], readString(config, ["siteTagline"])),
    contactAddress: readString(general, ["contactAddress"], readString(config, ["contactAddress"])),
    contactPhone: readString(general, ["contactPhone"], readString(config, ["contactPhone"])),
    contactEmail: readString(general, ["contactEmail"], readString(config, ["contactEmail"])),
  };

  const normalizedPillars = readObjectArray(about.pillars)
    .map((pillar, idx) => ({
      icon: readString(pillar, ["icon"], DEFAULT_ABOUT_PILLARS[idx]?.icon || "sparkles"),
      title: readString(pillar, ["title"], DEFAULT_ABOUT_PILLARS[idx]?.title || ""),
      text: readString(pillar, ["text", "desc"], DEFAULT_ABOUT_PILLARS[idx]?.text || ""),
    }))
    .filter((pillar) => pillar.title || pillar.text);

  return {
    heroSlides,
    general: normalizedGeneral,
    about: {
      heading: readString(about, ["heading"], "About Us"),
      subheading: readString(about, ["subheading"]),
      description: readString(about, ["description"]),
      stats: readObjectArray(about.stats).map((stat) => ({
        label: readString(stat, ["label"]),
        value: readString(stat, ["value"]),
      })),
      pillars: normalizedPillars.length ? normalizedPillars : DEFAULT_ABOUT_PILLARS,
    },
    aboutPage: {
      eyebrow: readString(aboutPage, ["eyebrow", "label"], DEFAULT_ABOUT_PAGE.eyebrow),
      title: readString(aboutPage, ["title", "heading"], DEFAULT_ABOUT_PAGE.title),
      description: readString(aboutPage, ["description", "subtitle"], DEFAULT_ABOUT_PAGE.description),
    },
    seo: {
      metaTitle: readString(seo, ["metaTitle"]),
      metaDescription: readString(seo, ["metaDescription"]),
      ogImage: readString(seo, ["ogImage"]),
    },
    social: {
      instagram: readString(social, ["instagram"]),
      facebook: readString(social, ["facebook"]),
      youtube: readString(social, ["youtube"]),
      whatsapp: readString(social, ["whatsapp"]),
      twitter: readString(social, ["twitter"]),
      linkedin: readString(social, ["linkedin"]),
    },
    legal: {
      privacyPolicy: readString(legal, ["privacyPolicy"]),
      termsOfService: readString(legal, ["termsOfService"]),
      refundPolicy: readString(legal, ["refundPolicy"]),
    },
    categories: normalizeCategories(config.categories),
    featuresHeading: String(config.featuresHeading || ""),
    featuresSubheading: String(config.featuresSubheading || ""),
    features: readObjectArray(config.features).map((f) => ({
      icon: readString(f, ["icon"], "⭐"),
      title: readString(f, ["title"], "Awesome Feature"),
      desc: readString(f, ["desc"], "Description goes here"),
    })),
    footerExperiences: readStringArray(config.footerExperiences),
    footerCompany: readStringArray(config.footerCompany),
    contactAddress: normalizedGeneral.contactAddress,
    contactPhone: normalizedGeneral.contactPhone,
    contactEmail: normalizedGeneral.contactEmail,
    aiPlanner: normalizeAiPlannerConfig(config.aiPlanner),
  };
}
