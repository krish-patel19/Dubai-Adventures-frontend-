export type ExperienceTemplate = {
    id: string;
    title: string;
    subtitle: string;
    category: "desert" | "atv" | "luxury" | "sky" | "water" | "city";
    price: number;
    duration: string;
    rating: number;
    reviewCount: number;
    image: string;
    images?: string[];
    shortDescription: string;
    fullDescription: string;
    experienceCategories: string[];
    badge?: string;
    badgeType?: "gold" | "luxury" | "popular" | "new";
    highlights: string[];
    included: string[];
    timeSlots: string[];
    maxGroupSize: number;
    originalPrice?: number;
    difficulty?: "Easy" | "Moderate" | "Challenging";
    languages?: string[];
    notIncluded?: string[];
    whatToBring?: string[];
    safetyRestrictions?: string[];
    agePolicy?: string;
    bestTime?: string;
    location?: {
        address: string;
        details: string;
        coordinates: {
            type: "Point";
            coordinates: [number, number]; // [lng, lat]
        };
    };
    licenseRequirements?: string;
    cancellationPolicy?: string;
    isCombo?: boolean;
    isHighMargin?: boolean;
    isPublished?: boolean;
};

export const EXPERIENCE_TEMPLATES: ExperienceTemplate[] = [
    {
        id: "dubai-ultimate-adrenaline-bundle",
        title: "Dubai Ultimate Adrenaline Bundle",
        subtitle: "High-Speed Desert & Water Action",
        category: "atv",
        price: 649,
        duration: "2 Days",
        rating: 4.8,
        reviewCount: 890,
        image: "https://res.cloudinary.com/dxfocockf/image/upload/v1773654271/adrenaline_buggy_action_main_fee7br.png",
        images: [
            "https://res.cloudinary.com/dxfocockf/image/upload/v1773654274/adrenaline_sandboarding_dunes_odfsbf.png",
            "https://res.cloudinary.com/dxfocockf/image/upload/v1773654278/adrenaline_fishing_sea_adventure_ly8lft.png"
        ],
        shortDescription: "For those who can't sit still. Command a high-powered buggy in the desert and test your skills in the deep blue waters of the Gulf.",
        fullDescription: "Push your limits with the ultimate adrenaline combo. This package takes you from the rolling red dunes to the deep blue sea. Take control of an 800cc dune buggy for a 60-minute self-drive safari that will test your nerves. Then, head to the coast for a 4-hour deep-sea fishing expedition. Whether you're sandboarding down dunes or reeling in the catch of the day, this bundle is pure excitement.",
        experienceCategories: ["atv-buggy", "deep-sea-fishing", "thrill-seeker"],
        badge: "THRILL SEEKER",
        badgeType: "popular",
        highlights: [
            "60-Min Self-Drive Dune Buggy (800cc)",
            "Deep-Sea Fishing with expert gear",
            "High-resolution action photos included",
            "Sandboarding in high dunes"
        ],
        included: [
            "800cc Dune Buggy Rental",
            "Safety Helmets & Goggles",
            "Sandboard Rental",
            "Deep Sea Fishing Gear & Bait",
            "Beverages on Boat"
        ],
        notIncluded: [
            "Fishing License (Temporary one provided)",
            "Personal Insurance"
        ],
        whatToBring: [
            "Spare clothes (You will get sandy!)",
            "Sunscreen",
            "A sense of adventure"
        ],
        safetyRestrictions: [
            "Buggy drivers must be 16+ years",
            "Not suitable for guests with motion sickness"
        ],
        agePolicy: "Driver: 16+ years, Passenger: 10+ years",
        bestTime: "Winter Months (Anytime)",
        location: {
            address: "Desert Base Camp / Dubai Marina Yacht Club",
            details: "Day 1: Desert Safari (Buggy). Day 2: Fishing (Sea). Please report to base camp 15 mins early.",
            coordinates: { type: "Point", coordinates: [55.1403, 25.0657] }
        },
        licenseRequirements: "Valid ID (No License required for Buggy)",
        cancellationPolicy: "Free cancellation up to 48 hours before the first activity.",
        timeSlots: ["09:00 AM", "02:30 PM"],
        maxGroupSize: 10,
        originalPrice: 820,
        difficulty: "Challenging",
        languages: ["English", "Arabic", "Urdu"],
        isCombo: true,
        isHighMargin: true,
        isPublished: true
    },
    {
        id: "premium-red-dune-safari",
        title: "Premium Red Dune Safari with BBQ Dinner",
        subtitle: "The ultimate desert adventure",
        category: "desert",
        price: 250,
        duration: "6 Hours",
        rating: 4.9,
        reviewCount: 1240,
        image: "https://images.unsplash.com/photo-1542401886-65d6c61db217?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Sunset dune bashing, camel ride, and a VIP BBQ dinner under the stars in a premium desert camp.",
        fullDescription: "Set out for an unforgettable Lahbab Desert evening with 4x4 dune bashing, sandboarding, and a sunset photo stop. Arrive at a VIP Bedouin-inspired camp with camel rides, henna art, and live entertainment. End the night with a lavish BBQ buffet featuring vegetarian and non-vegetarian options.",
        experienceCategories: ["desert-safari", "premium-luxury", "super-savers"],
        badge: "Bestseller",
        badgeType: "popular",
        highlights: [
            "Thrilling 4x4 dune bashing on red dunes",
            "VIP camp seating with table service",
            "Live belly dance, Tanoura, and fire show",
            "Sunset photography stop in the desert",
            "Lavish BBQ buffet dinner"
        ],
        included: [
            "Entry Ticket",
            "Dune bashing (30-40 mins)",
            "Sandboarding session",
            "Short camel ride",
            "BBQ dinner buffet"
        ],
        location: {
            address: "Lahbab Desert, Dubai",
            details: "Please report to the desert base camp 15 minutes before your scheduled slot.",
            coordinates: { type: "Point", coordinates: [55.5871, 25.0407] }
        },
        timeSlots: ["14:30", "15:00", "15:30"],
        maxGroupSize: 100,
        originalPrice: 320,
        difficulty: "Easy",
        languages: ["English", "Arabic"]
    },
    {
        id: "dune-buggy-adventure",
        title: "Extreme Polaris Dune Buggy Safari",
        subtitle: "Self-drive desert adrenaline",
        category: "atv",
        price: 650,
        duration: "3 Hours",
        rating: 4.9,
        reviewCount: 320,
        image: "https://images.unsplash.com/photo-1627993072237-775b5b0583b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Command a high-performance Polaris RZR and carve through towering dunes with a professional guide.",
        fullDescription: "Suit up for a full-throttle desert ride with a 1000cc Polaris RZR. After a safety briefing, follow a lead guide into open desert terrain for a heart-pumping adventure. Enjoy photo stops, sandboarding, and rugged off-road vistas.",
        experienceCategories: ["atv-buggy", "desert-safari"],
        badge: "Trending",
        badgeType: "new",
        highlights: [
            "Self-drive Polaris RZR 1000cc buggy",
            "Guided route across open desert dunes",
            "Safety gear and briefing included",
            "Sandboarding during the tour",
            "Epic desert photo stops"
        ],
        included: [
            "1-hour buggy drive time",
            "Helmet, goggles, and gloves",
            "Professional lead guide",
            "Water and soft drinks",
            "Sandboarding equipment"
        ],
        location: {
            address: "Desert Adventure Hub, Lahbab",
            details: "Report at the reception desk 15 minutes before your scheduled slot.",
            coordinates: { type: "Point", coordinates: [55.5900, 25.0350] }
        },
        timeSlots: ["08:00", "12:00", "16:00"],
        maxGroupSize: 4,
        difficulty: "Moderate",
        languages: ["English"]
    },
    {
        id: "dubai-marina-luxury-yacht",
        title: "Dubai Marina Luxury Yacht Cruise",
        subtitle: "Sail past Dubai's iconic skyline",
        category: "water",
        price: 850,
        duration: "2-4 Hours",
        rating: 4.8,
        reviewCount: 450,
        image: "https://images.unsplash.com/photo-1568853757656-7ee3dfdb41bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Private yacht charter with premium service, panoramic skyline views, and optional BBQ setup.",
        fullDescription: "Cruise the Dubai Marina, Ain Dubai, and Palm Jumeirah on a private luxury yacht. Enjoy spacious decks, onboard music, and a professional crew catering to your group. Choose sunrise, daytime, or sunset sailings.",
        experienceCategories: ["yacht-water", "premium-luxury"],
        badge: "Luxury",
        badgeType: "luxury",
        highlights: [
            "Private yacht charter for up to 12 guests",
            "Cruise past Ain Dubai and Palm Jumeirah",
            "Spacious sun deck and lounge seating",
            "Bluetooth sound system onboard",
            "Optional BBQ catering setup"
        ],
        included: [
            "Private yacht and crew",
            "Ice, water, and soft drinks",
            "Safety equipment",
            "Fuel and marina fees",
            "Towels"
        ],
        location: {
            address: "Dubai Marina Yacht Club, Pier 7",
            details: "Boarding starts 15 minutes before departure. Please bring your original ID.",
            coordinates: { type: "Point", coordinates: [55.1410, 25.0710] }
        },
        timeSlots: ["09:00", "14:00", "17:00 (Sunset)"],
        maxGroupSize: 12,
        originalPrice: 1100,
        difficulty: "Easy",
        languages: ["English", "Arabic"]
    },
    {
        id: "burj-khalifa-at-the-top",
        title: "Burj Khalifa 'At The Top' Sky Ticket",
        subtitle: "Views from the world's tallest tower",
        category: "city",
        price: 180,
        duration: "2 Hours",
        rating: 4.7,
        reviewCount: 8900,
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Skip the line and soar to levels 124 & 125 for breathtaking 360° views of Dubai.",
        fullDescription: "Ascend the Burj Khalifa in the world’s fastest elevators and step out onto the observation decks at levels 124 and 125. Enjoy panoramic views of the city skyline, ocean, and desert, plus interactive telescopes and a stunning glass-walled terrace.",
        experienceCategories: ["super-savers", "theme-parks"],
        badge: "Must Do",
        badgeType: "popular",
        highlights: [
            "Access to levels 124 & 125",
            "World’s fastest double-deck elevators",
            "360° panoramic viewing decks",
            "Interactive telescopes",
            "Prime-time sunset slots available"
        ],
        included: [
            "General admission ticket",
            "Access to observation decks",
            "Use of telescopes",
            "Photo opportunities",
            "Free WiFi"
        ],
        location: {
            address: "Burj Khalifa, Lower Ground Floor, Dubai Mall",
            details: "Follow 'At The Top' signage in Dubai Mall. Arrive 15 minutes before your time slot.",
            coordinates: { type: "Point", coordinates: [55.2744, 25.1972] }
        },
        timeSlots: ["10:00", "14:00", "17:00 (Prime Time)", "20:00"],
        maxGroupSize: 50,
        difficulty: "Easy",
        languages: ["English"]
    },
    {
        id: "sunrise-hot-air-balloon",
        title: "Sunrise Hot Air Balloon Over Dubai Desert",
        subtitle: "Float above golden dunes at sunrise",
        category: "sky",
        price: 1250,
        duration: "4-5 Hours",
        rating: 4.9,
        reviewCount: 620,
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Watch the desert awaken from the sky with a serene sunrise balloon flight and gourmet breakfast.",
        fullDescription: "Begin before dawn with light refreshments at our desert launch site. Lift off over sweeping dunes and spot desert wildlife as the sun rises. After landing, celebrate with a gourmet breakfast and a commemorative flight certificate.",
        experienceCategories: ["sky-balloon", "premium-luxury"],
        badge: "Sunrise",
        badgeType: "gold",
        highlights: [
            "Sunrise flight over the Dubai desert",
            "Wildlife spotting from above",
            "Gourmet breakfast after landing",
            "Professional pilot and crew",
            "Commemorative flight certificate"
        ],
        included: [
            "Entry Permit",
            "Balloon flight (45-60 mins)",
            "Light refreshments",
            "Breakfast after landing",
            "Flight certificate"
        ],
        timeSlots: ["04:30", "05:00"],
        maxGroupSize: 20,
        difficulty: "Easy",
        languages: ["English"]
    },
    {
        id: "dhow-cruise-dinner-marina",
        title: "Dubai Marina Dhow Cruise Dinner",
        subtitle: "Traditional cruise with a city-lit skyline",
        category: "water",
        price: 220,
        duration: "2 Hours",
        rating: 4.6,
        reviewCount: 780,
        image: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Sail the Marina aboard a classic dhow with buffet dinner and live entertainment.",
        fullDescription: "Enjoy a relaxing evening cruise through Dubai Marina on a traditional wooden dhow. Indulge in an international buffet, live entertainment, and shimmering waterfront views as the city lights sparkle.",
        experienceCategories: ["dhow-cruises", "yacht-water"],
        badge: "Evening",
        badgeType: "popular",
        highlights: [
            "2-hour Marina cruise",
            "International buffet dinner",
            "Live music and entertainment",
            "Open-air upper deck seating",
            "Stunning skyline views"
        ],
        included: [
            "Cruise ticket",
            "Dinner buffet",
            "Welcome drink",
            "Live entertainment",
            "Onboard service"
        ],
        timeSlots: ["20:00", "21:00"],
        maxGroupSize: 150,
        difficulty: "Easy",
        languages: ["English"]
    },
    {
        id: "atlantis-aquaventure-waterpark",
        title: "Atlantis Aquaventure Waterpark Day Pass",
        subtitle: "Dubai’s most iconic waterpark adventure",
        category: "water",
        price: 320,
        duration: "Full Day",
        rating: 4.7,
        reviewCount: 3200,
        image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Unlimited access to record-breaking slides, lazy rivers, and a private beach.",
        fullDescription: "Spend a full day at Atlantis Aquaventure with adrenaline slides, river rides, splash zones, and a private beach. Perfect for families and thrill-seekers looking for a complete waterpark experience.",
        experienceCategories: ["theme-parks", "super-savers"],
        badge: "Family",
        badgeType: "popular",
        highlights: [
            "Access to all slides and attractions",
            "Lazy river and splash zones",
            "Private beach access",
            "Family-friendly play areas",
            "Locker and towel facilities"
        ],
        included: [
            "Full-day admission ticket",
            "Access to rides and pools",
            "Beach access",
            "Changing rooms",
            "On-site lifeguards"
        ],
        timeSlots: ["10:00", "11:00"],
        maxGroupSize: 200,
        difficulty: "Easy",
        languages: ["English"]
    },
    {
        id: "palm-helicopter-tour",
        title: "Palm & Burj Helicopter Tour",
        subtitle: "Dubai’s icons from the sky",
        category: "sky",
        price: 720,
        duration: "25 Minutes",
        rating: 4.8,
        reviewCount: 540,
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Fly above Palm Jumeirah, Burj Al Arab, and Downtown in a premium helicopter tour.",
        fullDescription: "Lift off from a private helipad and capture Dubai’s skyline from above. Soar over Palm Jumeirah, Atlantis, Burj Al Arab, and the Burj Khalifa in a smooth, air-conditioned helicopter.",
        experienceCategories: ["helicopter", "premium-luxury"],
        badge: "Iconic",
        badgeType: "gold",
        highlights: [
            "Aerial views of Palm Jumeirah",
            "Burj Al Arab and Downtown skyline",
            "Premium helicopter with wide windows",
            "Professional pilot commentary",
            "Photo-ready route"
        ],
        included: [
            "Helicopter flight experience",
            "Safety briefing",
            "Professional pilot",
            "Insurance coverage",
            "Helipad access"
        ],
        timeSlots: ["09:00", "11:00", "14:00", "16:00"],
        maxGroupSize: 5,
        difficulty: "Easy",
        languages: ["English"]
    },
    {
        id: "deep-sea-fishing-charter",
        title: "Deep Sea Fishing Charter",
        subtitle: "Private fishing adventure on open waters",
        category: "water",
        price: 950,
        duration: "4 Hours",
        rating: 4.8,
        reviewCount: 210,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Catch kingfish and tuna on a private charter with expert crew and premium gear.",
        fullDescription: "Set out from Dubai Marina for an exclusive deep-sea fishing session. Your crew provides top-grade fishing gear, bait, and guidance as you chase the best catches in the Arabian Gulf.",
        experienceCategories: ["deep-sea-fishing", "yacht-water"],
        badge: "Private",
        badgeType: "luxury",
        highlights: [
            "Private fishing boat with captain",
            "Premium rods, reels, and bait",
            "Guidance for beginners",
            "Scenic coastline views",
            "Catch-and-keep options"
        ],
        included: [
            "Fishing gear and bait",
            "Professional captain and crew",
            "Ice box for catch",
            "Soft drinks and water",
            "Safety equipment"
        ],
        timeSlots: ["06:00", "10:00", "15:00"],
        maxGroupSize: 6,
        difficulty: "Moderate",
        languages: ["English"]
    },
    {
        id: "discover-scuba-diving",
        title: "Discover Scuba Diving in Dubai",
        subtitle: "First-time dive in calm waters",
        category: "water",
        price: 450,
        duration: "3-4 Hours",
        rating: 4.7,
        reviewCount: 180,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        shortDescription: "Learn the basics and dive with certified instructors in a safe, beginner-friendly session.",
        fullDescription: "Start with a brief skills session, then enjoy a guided dive with a PADI-certified instructor. Explore Dubai’s calm waters and marine life in a safe, controlled environment.",
        experienceCategories: ["scuba-diving", "yacht-water"],
        badge: "Certified",
        badgeType: "new",
        highlights: [
            "Beginner-friendly dive session",
            "PADI-certified instructors",
            "All equipment provided",
            "Calm, supervised waters",
            "Underwater photo opportunities"
        ],
        included: [
            "Training and safety briefing",
            "Full scuba gear",
            "Instructor-led dive",
            "Water and refreshments",
            "All permits and fees"
        ],
        timeSlots: ["08:00", "12:00"],
        maxGroupSize: 8,
        difficulty: "Easy",
        languages: ["English"]
    }
];

const CATEGORY_DEFAULTS: Partial<Record<ExperienceTemplate["category"], Partial<ExperienceTemplate>>> = {
    desert: {
        duration: "6 Hours",
        highlights: ["Dune bashing adventure", "Sunset photo stop", "Camel ride experience"],
        included: ["Safety briefing", "Water & soft drinks"],
        timeSlots: ["14:30", "15:30"],
        difficulty: "Easy",
        languages: ["English", "Arabic"],
    },
    atv: {
        duration: "2-3 Hours",
        highlights: ["Self-drive ATV or buggy", "Guided desert trail", "Photo stops"],
        included: ["Safety gear", "Professional guide", "Water & soft drinks"],
        timeSlots: ["08:00", "12:00", "16:00"],
        difficulty: "Moderate",
        languages: ["English"],
    },
    luxury: {
        duration: "3-4 Hours",
        highlights: ["Private experience", "Premium service", "Curated itinerary"],
        included: ["Private host", "Refreshments", "Priority access"],
        timeSlots: ["10:00", "15:00", "19:00"],
        difficulty: "Easy",
        languages: ["English", "Arabic"],
    },
    sky: {
        duration: "2-4 Hours",
        highlights: ["Aerial city views", "Photo-ready route", "Expert crew"],
        included: ["Safety briefing", "Professional pilot", "Insurance coverage"],
        timeSlots: ["05:00", "09:00", "16:00"],
        difficulty: "Easy",
        languages: ["English"],
    },
    water: {
        duration: "2-4 Hours",
        highlights: ["Coastal skyline views", "Onboard comfort", "Waterfront experience"],
        included: ["Crew assistance", "Safety equipment", "Water & soft drinks"],
        timeSlots: ["09:00", "13:00", "17:00"],
        difficulty: "Easy",
        languages: ["English"],
    },
    city: {
        duration: "2 Hours",
        highlights: ["Iconic landmarks", "Skip-the-line access", "Best photo spots"],
        included: ["Entrance ticket", "Guided access", "WiFi access"],
        timeSlots: ["10:00", "15:00", "19:00"],
        difficulty: "Easy",
        languages: ["English"],
    },
};

const templateIndex = new Map<string, ExperienceTemplate>();
for (const template of EXPERIENCE_TEMPLATES) {
    templateIndex.set(normalizeKey(template.id), template);
    templateIndex.set(normalizeKey(template.title), template);
}

function normalizeKey(value: string | undefined) {
    return (value || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function coalesceString(value: unknown, fallback = "") {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof fallback === "string" && fallback.trim()) return fallback;
    return "";
}

function coalesceNumber(value: unknown, fallback?: number) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof fallback === "number" && Number.isFinite(fallback)) return fallback;
    return undefined;
}

function coalesceArray<T>(value: unknown, fallback: T[] = []) {
    if (Array.isArray(value) && value.length) return value as T[];
    if (Array.isArray(fallback) && fallback.length) return fallback;
    return [] as T[];
}

function findTemplate(activity: any) {
    const idKey = normalizeKey(activity?.id);
    if (idKey && templateIndex.has(idKey)) return templateIndex.get(idKey);
    const titleKey = normalizeKey(activity?.title);
    if (titleKey && templateIndex.has(titleKey)) return templateIndex.get(titleKey);
    return undefined;
}

export function enrichActivity(activity: any) {
    const template = findTemplate(activity);
    const categoryDefaults = CATEGORY_DEFAULTS[(activity?.category || template?.category) as ExperienceTemplate["category"]];

    return {
        ...activity,
        id: coalesceString(activity?.id, template?.id || ""),
        title: coalesceString(activity?.title, template?.title || ""),
        subtitle: coalesceString(activity?.subtitle, template?.subtitle || categoryDefaults?.subtitle || ""),
        shortDescription: coalesceString(
            activity?.shortDescription,
            template?.shortDescription || categoryDefaults?.shortDescription || "",
        ),
        fullDescription: coalesceString(
            activity?.fullDescription,
            template?.fullDescription || categoryDefaults?.fullDescription || "",
        ),
        category: coalesceString(activity?.category, template?.category || ""),
        price: coalesceNumber(activity?.price, template?.price),
        duration: coalesceString(activity?.duration, template?.duration || categoryDefaults?.duration || ""),
        rating: coalesceNumber(activity?.rating, template?.rating),
        reviewCount: coalesceNumber(activity?.reviewCount, template?.reviewCount),
        image: coalesceString(activity?.image, template?.image || categoryDefaults?.image || ""),
        images: coalesceArray(activity?.images, template?.images || categoryDefaults?.images || []),
        experienceCategories: coalesceArray(
            activity?.experienceCategories,
            template?.experienceCategories || categoryDefaults?.experienceCategories || [],
        ),
        badge: coalesceString(activity?.badge, template?.badge || categoryDefaults?.badge || ""),
        badgeType: activity?.badgeType || template?.badgeType || categoryDefaults?.badgeType,
        highlights: coalesceArray(activity?.highlights, template?.highlights || categoryDefaults?.highlights || []),
        included: coalesceArray(activity?.included, template?.included || categoryDefaults?.included || []),
        timeSlots: coalesceArray(activity?.timeSlots, template?.timeSlots || categoryDefaults?.timeSlots || []),
        maxGroupSize: coalesceNumber(activity?.maxGroupSize, template?.maxGroupSize || categoryDefaults?.maxGroupSize),
        originalPrice: activity?.originalPrice ?? template?.originalPrice ?? categoryDefaults?.originalPrice,
        difficulty: activity?.difficulty || template?.difficulty || categoryDefaults?.difficulty,
        languages: coalesceArray(
            activity?.languages,
            template?.languages || categoryDefaults?.languages || ["English"],
        ),
        // Migration aid for location
        location: {
            address: activity?.location?.address ?? template?.location?.address ?? activity?.meetingLocation ?? "",
            details: activity?.location?.details ?? template?.location?.details ?? activity?.meetingDetails ?? "",
            coordinates: activity?.location?.coordinates ?? template?.location?.coordinates ?? {
                type: "Point",
                coordinates: [55.2708, 25.2048]
            }
        }
    };
}

export function getExperienceTemplateById(id: string) {
    return EXPERIENCE_TEMPLATES.find((template) => template.id === id);
}
