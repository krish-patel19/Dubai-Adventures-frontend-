export interface ExperienceCategory {
  id: string;
  label: string;
  icon: string;
}

export interface TourPackageSummary {
  id: string;
  name: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  overview?: string;
  fullDescription?: string;
  totalDays: number;
  totalNights: number;
  basePrice: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  thumbnailUrl?: string;
  images?: string[];
  experienceCategories?: string[];
  badge?: string;
  badgeType?: "gold" | "luxury" | "popular" | "new" | "";
  highlights?: string[];
  included?: string[];
}

export interface PricingRule {
  _id?: string;
  ruleName: string;
  conditionType: "DateRange" | "Weekend" | "Holiday" | "Capacity";
  adjustmentType: "Percentage" | "Flat";
  value: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  capacityThreshold?: number;
}



export interface TransportTier {
  type: "Shared" | "Private" | "Luxury";
  label: string;
  capacity: number;
  basePrice: number;
  pickupLocation: string;
  dropoffLocation: string;
  features: string[];
  isAvailable: boolean;
}

export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  image: string;
  category: "desert" | "atv" | "luxury" | "sky" | "water" | "city";
  bookingType?: "Shared" | "Private";
  linkedAssets?: string[];
  badge?: string;
  badgeType?: "gold" | "luxury" | "popular" | "new";
  images?: string[];
  videoUrl?: string;
  childPrice?: number;
  peakSurcharge?: number;
  excluded?: string[];
  highlights: string[];
  included: string[];
  timeSlots: string[];
  maxGroupSize: number;
  originalPrice?: number;
  notIncluded: string[];
  whatToBring: string[];
  safetyRestrictions: string[];
  cancellationPolicy?: string;
  difficulty?: "Easy" | "Moderate" | "Challenging";
  languages?: string[];
  experienceCategories?: string[];
  pricingRules?: PricingRule[];
  location?: {
    address: string;
    details: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
  };
  dateOverrides?: { date: string; price: number }[];
  transportation?: TransportTier[];
  translations?: {
    [key: string]: {
      title?: string;
      subtitle?: string;
      shortDescription?: string;
      fullDescription?: string;
      highlights?: string[];
      included?: string[];
      notIncluded?: string[];
    };
  };
}

export interface HeroSlide {
  fallbackImage: string;
  videoUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface SiteConfig {
  heroSlides: HeroSlide[];
  general: {
    siteName: string;
    siteLogoUrl: string;
    siteTagline: string;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
  };
  about: {
    heading: string;
    subheading: string;
    description: string;
    stats: {
      label: string;
      value: string;
    }[];
    pillars?: {
      icon?: string;
      title: string;
      text: string;
    }[];
  };
  aboutPage?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
    whatsapp: string;
    twitter: string;
    linkedin: string;
  };
  legal: {
    privacyPolicy: string;
    termsOfService: string;
    refundPolicy: string;
  };
  categories: ExperienceCategory[];
  footerExperiences: string[];
  footerCompany: string[];
}

export interface BookingState {
  activity: Activity | null;
  date: Date | null;
  timeSlot: string;
  adults: number;
  children: number;
  productType?: "activity" | "package" | "bundle";
  transportationTier?: TransportTier | null;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod?: "card" | "wallet";
  walletType?: "apple" | "google" | null;
  packageStartDate?: Date | null;
  packageEndDate?: Date | null;
}

export interface BookingConfirmation {
  bookingId: string;
  activity: Activity;
  date: Date;
  timeSlot: string;
  adults: number;
  children: number;
  totalPrice: number;
  transportType?: string;
  transportFee?: number;
  fullName: string;
  email: string;
  nationality: string;
  paymentStatus: "paid" | "partial" | "unpaid";
  packageStartDate?: Date | null;
  packageEndDate?: Date | null;
}

export interface GalleryImage {
  _id: string;
  url: string;
  title: string;
  category: string;
  featured: boolean;
  createdAt: string;
}
