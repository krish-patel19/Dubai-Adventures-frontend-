import mongoose from "mongoose";

const dayElementSchema = new mongoose.Schema({
    id: { type: String, required: true },
    elementType: { type: String, enum: ['ACCOMMODATION', 'TRANSPORTATION', 'ACTIVITY', 'MEAL'], required: true },
    sortOrder: { type: Number, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const itineraryDaySchema = new mongoose.Schema({
    id: { type: String, required: true },
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    overnightCity: { type: String, default: "" },
    elements: [dayElementSchema]
});

const tourPackageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, default: "" },
    category: { type: String, default: "luxury" },
    overview: { type: String, required: true },
    fullDescription: { type: String, default: "" },
    totalDays: { type: Number, required: true },
    totalNights: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 0 },
    thumbnailUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    experienceCategories: { type: [String], default: [] },
    badge: { type: String, default: "" },
    badgeType: { type: String, enum: ["gold", "luxury", "popular", "new", ""], default: "" },
    highlights: { type: [String], default: [] },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    whatToBring: { type: [String], default: [] },
    safetyRestrictions: { type: [String], default: [] },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Challenging"], default: "Easy" },
    languages: { type: [String], default: ["English"] },
    agePolicy: { type: String, default: "" },
    bestTime: { type: String, default: "" },
    cancellationPolicy: { type: String, default: "" },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
    isHighMargin: { type: Boolean, default: false },
    itinerary: [itineraryDaySchema]
}, {
    timestamps: true,
    collection: "tour_packages",
});

if (mongoose.models && mongoose.models.TourPackage) {
    delete mongoose.models.TourPackage;
}

const TourPackage = mongoose.model("TourPackage", tourPackageSchema);

export default TourPackage;
