export interface ConciergeInventoryActivity {
  _id?: string;
  id: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: number;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  category?: string;
  badge?: string;
  badgeType?: "gold" | "luxury" | "popular" | "new" | string;
  experienceCategories?: string[];
  highlights?: string[];
  timeSlots?: string[];
  maxGroupSize?: number;
  isCombo?: boolean;
}

export interface ChatRecommendation {
  id: string;
  mongoId?: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  price: number;
  duration: string;
  image: string;
  category: string;
  rating: number;
  badge?: string;
  badgeType?: string;
  timeSlots: string[];
  maxGroupSize?: number;
  isCombo: boolean;
  matchLabel: string;
  recommendationReason: string;
  score: number;
}

type ConversationProfile = {
  normalizedText: string;
  significantTokens: string[];
  categorySignals: Set<string>;
  wantsLuxury: boolean;
  wantsFamily: boolean;
  wantsAdventure: boolean;
  wantsRomantic: boolean;
  wantsPrivate: boolean;
  wantsPackage: boolean;
  wantsBudget: boolean;
  wantsDinner: boolean;
  prefersSunset: boolean;
  prefersSunrise: boolean;
  prefersMorning: boolean;
  prefersEvening: boolean;
  targetBudget?: number;
  maxBudget?: number;
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "around",
  "best",
  "book",
  "booking",
  "can",
  "could",
  "day",
  "days",
  "dubai",
  "experience",
  "experiences",
  "for",
  "from",
  "have",
  "help",
  "ideal",
  "into",
  "just",
  "like",
  "need",
  "package",
  "packages",
  "person",
  "plan",
  "planning",
  "please",
  "show",
  "some",
  "something",
  "that",
  "these",
  "this",
  "tour",
  "tours",
  "trip",
  "want",
  "with",
]);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  desert: ["desert", "dune", "safari", "bbq", "camel", "camp", "sandboarding"],
  water: ["water", "yacht", "cruise", "boat", "marina", "sea", "beach", "scuba", "fishing", "waterpark", "dhow"],
  sky: ["sky", "balloon", "helicopter", "aerial", "sunrise", "views", "observation"],
  city: ["city", "downtown", "landmark", "burj", "mall", "sightseeing"],
  atv: ["atv", "buggy", "adrenaline", "off-road", "thrill", "polaris", "extreme"],
  luxury: ["luxury", "vip", "premium", "private", "exclusive", "signature"],
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function tokenize(value: string) {
  return unique(
    normalizeText(value)
      .split(" ")
      .filter((token) => token.length >= 4 && !STOP_WORDS.has(token))
  );
}

function parseBudget(text: string) {
  const normalized = normalizeText(text);
  const maxMatch = normalized.match(
    /(?:under|below|less than|max|maximum|up to)\s*(?:aed|dhs|dh|dirhams?)?\s*(\d{2,5})/
  );
  const trailingMaxMatch = normalized.match(
    /(\d{2,5})\s*(?:aed|dhs|dh|dirhams?)?\s*(?:max|maximum|budget)/
  );
  const aroundMatch = normalized.match(/(?:around|about|roughly)\s*(?:aed|dhs|dh|dirhams?)?\s*(\d{2,5})/);

  const maxBudget = Number(maxMatch?.[1] || trailingMaxMatch?.[1] || 0) || undefined;
  const targetBudget = Number(aroundMatch?.[1] || 0) || maxBudget;

  return { maxBudget, targetBudget };
}

function buildConversationProfile(conversationText: string): ConversationProfile {
  const normalizedText = normalizeText(conversationText);
  const categorySignals = new Set<string>();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      categorySignals.add(category);
    }
  }

  const { maxBudget, targetBudget } = parseBudget(normalizedText);

  return {
    normalizedText,
    significantTokens: tokenize(normalizedText),
    categorySignals,
    wantsLuxury: /luxury|vip|premium|exclusive|signature/.test(normalizedText),
    wantsFamily: /family|kids|kid|children|child|parents/.test(normalizedText),
    wantsAdventure: /adventure|thrill|thrilling|extreme|adrenaline|off road|off-road/.test(normalizedText),
    wantsRomantic: /romantic|couple|honeymoon|anniversary|date night|proposal/.test(normalizedText),
    wantsPrivate: /private|exclusive|just us|our own/.test(normalizedText),
    wantsPackage: /package|packages|combo|bundle|multi activity|itinerary/.test(normalizedText),
    wantsBudget: Boolean(maxBudget || targetBudget),
    wantsDinner: /dinner|bbq|buffet|meal|lunch|breakfast/.test(normalizedText),
    prefersSunset: /sunset|golden hour/.test(normalizedText),
    prefersSunrise: /sunrise|early morning/.test(normalizedText),
    prefersMorning: /morning|am\b|early/.test(normalizedText),
    prefersEvening: /evening|night|pm\b/.test(normalizedText),
    targetBudget,
    maxBudget,
  };
}

function averageDurationHours(duration?: string) {
  if (!duration) return undefined;
  const normalized = normalizeText(duration);
  if (normalized.includes("full day")) return 8;
  if (normalized.includes("2 days")) return 16;

  const matches = normalized.match(/\d+/g)?.map(Number).filter(Number.isFinite) || [];
  if (!matches.length) return undefined;
  if (matches.length === 1) return matches[0];
  return matches.reduce((sum, value) => sum + value, 0) / matches.length;
}

function buildSearchText(activity: ConciergeInventoryActivity) {
  return normalizeText(
    [
      activity.id,
      activity.title,
      activity.subtitle,
      activity.shortDescription,
      activity.fullDescription,
      activity.category,
      activity.badge,
      activity.badgeType,
      ...(activity.experienceCategories || []),
      ...(activity.highlights || []),
      ...(activity.timeSlots || []),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function categoryDisplayName(activity: ConciergeInventoryActivity) {
  if (activity.isCombo) return "package";
  return "tour";
}

function pushReason(reasons: string[], value: string) {
  if (!reasons.includes(value)) {
    reasons.push(value);
  }
}

function scoreActivity(activity: ConciergeInventoryActivity, profile: ConversationProfile) {
  const searchText = buildSearchText(activity);
  const reasons: string[] = [];
  let score = Math.round((activity.rating || 4.5) * 10);
  score += Math.min(Math.round((activity.reviewCount || 0) / 250), 12);

  const price = activity.price || 0;
  const durationHours = averageDurationHours(activity.duration);
  const badgeType = activity.badgeType || "";

  if (activity.isCombo) {
    score += 4;
  }

  if (profile.wantsPackage) {
    if (activity.isCombo) {
      score += 26;
      pushReason(reasons, "package-style option that matches your request");
    } else {
      score -= 6;
    }
  }

  if (profile.wantsLuxury || profile.wantsPrivate || profile.wantsRomantic) {
    if (badgeType === "luxury" || badgeType === "gold" || /luxury|private|premium|exclusive|sunset|sunrise/.test(searchText)) {
      score += 18;
      pushReason(reasons, "premium feel with a polished Dubai experience");
    }
  }

  if (profile.wantsAdventure) {
    if (activity.category === "atv" || activity.category === "sky" || /adrenaline|thrill|buggy|helicopter|balloon|fishing|scuba/.test(searchText)) {
      score += 15;
      pushReason(reasons, "strong match for an adventure-led plan");
    }
  }

  if (profile.wantsFamily) {
    if (/family|kid|child|easy|waterpark|aquaventure/.test(searchText) || (activity.maxGroupSize || 0) >= 6) {
      score += 14;
      pushReason(reasons, "comfortable choice for families or mixed groups");
    }
  }

  if (profile.wantsDinner) {
    if (/dinner|bbq|buffet|breakfast|lunch/.test(searchText)) {
      score += 14;
      pushReason(reasons, "includes a dining element that fits your request");
    }
  }

  if (profile.prefersSunset) {
    if (/sunset/.test(searchText) || (activity.timeSlots || []).some((slot) => /17|18|19|20/.test(slot))) {
      score += 12;
      pushReason(reasons, "well suited to a sunset schedule");
    }
  }

  if (profile.prefersSunrise || profile.prefersMorning) {
    if (/sunrise/.test(searchText) || (activity.timeSlots || []).some((slot) => /04|05|06|07|08|09|10/.test(slot))) {
      score += 10;
      pushReason(reasons, "works well for an early start");
    }
  }

  if (profile.prefersEvening) {
    if ((activity.timeSlots || []).some((slot) => /17|18|19|20|21/.test(slot)) || /night|evening|dinner/.test(searchText)) {
      score += 10;
      pushReason(reasons, "fits an evening plan nicely");
    }
  }

  if (profile.categorySignals.size) {
    if (activity.category && profile.categorySignals.has(activity.category)) {
      score += 20;
      pushReason(reasons, `clear match for the ${activity.category} style you asked for`);
    }

    if (profile.categorySignals.has("luxury") && (badgeType === "luxury" || badgeType === "gold")) {
      score += 8;
    }
  }

  if (profile.maxBudget) {
    if (price <= profile.maxBudget) {
      score += 22;
      pushReason(reasons, "comfortably within your stated budget");
    } else if (price <= profile.maxBudget * 1.15) {
      score += 3;
      pushReason(reasons, "slightly above budget but stronger on quality");
    } else {
      score -= 24;
    }
  } else if (profile.targetBudget) {
    const budgetDistance = Math.abs(price - profile.targetBudget);
    score += Math.max(0, 10 - Math.round(budgetDistance / 80));
  }

  if (durationHours) {
    if (profile.wantsPackage && durationHours >= 6) {
      score += 6;
    }
    if (profile.prefersEvening && durationHours <= 4) {
      score += 3;
    }
  }

  const tokenMatches = profile.significantTokens.filter((token) => searchText.includes(token));
  score += Math.min(tokenMatches.length * 3, 15);
  if (tokenMatches.length >= 2) {
    pushReason(reasons, "closely aligned with the details in your message");
  }

  return { score, reasons };
}

function buildRecommendationReason(activity: ConciergeInventoryActivity, reasons: string[]) {
  const uniqueReasons = unique(reasons).slice(0, 2);

  if (!uniqueReasons.length) {
    if (activity.isCombo) {
      return "High-value package that combines more than one Dubai experience elegantly.";
    }

    if (activity.badgeType === "luxury" || activity.badgeType === "gold") {
      return "Premium live experience with strong guest appeal and a more elevated feel.";
    }

    return "Well-reviewed live experience that fits a broad range of Dubai plans.";
  }

  const sentence = uniqueReasons.join(" and ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function toRecommendation(activity: ConciergeInventoryActivity, score: number, reasons: string[]): ChatRecommendation {
  return {
    id: activity.id,
    mongoId: activity._id,
    title: activity.title,
    subtitle: activity.subtitle || "",
    shortDescription: activity.shortDescription || "",
    price: activity.price || 0,
    duration: activity.duration || "",
    image: activity.image || "",
    category: activity.category || "city",
    rating: activity.rating || 4.8,
    badge: activity.badge,
    badgeType: activity.badgeType,
    timeSlots: activity.timeSlots || [],
    maxGroupSize: activity.maxGroupSize,
    isCombo: Boolean(activity.isCombo),
    matchLabel: activity.isCombo ? "Package Match" : "Tour Match",
    recommendationReason: buildRecommendationReason(activity, reasons),
    score,
  };
}

export function extractActivityIdsFromText(content: string) {
  return unique(
    Array.from(content.matchAll(/\[ACTIVITY:([a-z0-9-]+)\]/gi))
      .map((match) => match[1]?.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function stripActivityTags(content: string) {
  return content.replace(/\s*\[ACTIVITY:[a-z0-9-]+\]\s*/gi, " ").replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
}

export function getChatRecommendations(
  activities: ConciergeInventoryActivity[],
  conversationText: string,
  limit = 3
) {
  const profile = buildConversationProfile(conversationText);

  return activities
    .filter((activity) => Boolean(activity.id && activity.title))
    .map((activity) => {
      const { score, reasons } = scoreActivity(activity, profile);
      return toRecommendation(activity, score, reasons);
    })
    .sort((left, right) => right.score - left.score || right.rating - left.rating || left.price - right.price)
    .slice(0, limit);
}

export function mergeChatRecommendations(
  taggedIds: string[],
  rankedRecommendations: ChatRecommendation[],
  activities: ConciergeInventoryActivity[],
  conversationText: string,
  limit = 4
) {
  const rankedMap = new Map(rankedRecommendations.map((recommendation) => [recommendation.id, recommendation]));
  const activityMap = new Map(activities.map((activity) => [activity.id, activity]));
  const merged: ChatRecommendation[] = [];

  for (const taggedId of taggedIds) {
    const rankedRecommendation = rankedMap.get(taggedId);
    if (rankedRecommendation) {
      merged.push(rankedRecommendation);
      continue;
    }

    const activity = activityMap.get(taggedId);
    if (activity) {
      merged.push(...getChatRecommendations([activity], conversationText, 1));
    }
  }

  for (const recommendation of rankedRecommendations) {
    if (!merged.some((item) => item.id === recommendation.id)) {
      merged.push(recommendation);
    }
  }

  return merged.slice(0, limit);
}

export function buildProfessionalFallbackReply(
  conversationText: string,
  recommendations: ChatRecommendation[]
) {
  if (!recommendations.length) {
    return [
      "I can still curate this professionally for you.",
      "Share your preferred budget, group type, and whether you want desert, water, sky, or city experiences, and I will match the strongest live options.",
    ].join(" ");
  }

  const opener = /package|combo|bundle/.test(normalizeText(conversationText))
    ? "Based on your request, these are the strongest live package and tour matches right now:"
    : "Based on your requirement, these are the strongest live matches right now:";

  const lines = recommendations.slice(0, 3).map((recommendation) => {
    const typeLabel = recommendation.isCombo ? "Package" : "Tour";
    return `- ${recommendation.title} (${typeLabel}, ${recommendation.price} AED): ${recommendation.recommendationReason} [ACTIVITY:${recommendation.id}]`;
  });

  return [
    opener,
    "",
    ...lines,
    "",
    "If you want, I can narrow this further by budget, family suitability, luxury level, or morning versus sunset timing.",
  ].join("\n");
}
