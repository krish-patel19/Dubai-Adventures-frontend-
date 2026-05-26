import mongoose from "mongoose";
import "./PricingRule"; // Ensure PricingRule schema is registered before Activity populates it

const activitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    fullDescription: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    reviewCount: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    originalPrice: {
        type: Number,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Moderate", "Challenging"],
        default: "Easy",
    },
    languages: {
        type: [String],
        default: ["English"],
    },
    category: {
        type: String,
        enum: ["desert", "atv", "luxury", "sky", "water", "city"],
        required: true,
    },
    bookingType: {
        type: String,
        enum: ["Shared", "Private"],
        default: "Shared",
    },
    linkedAssets: {
        type: [String],
        default: [],
    },
    experienceCategories: {
        type: [String],
        default: [],
    },
    badge: {
        type: String,
    },
    badgeType: {
        type: String,
        enum: ["gold", "luxury", "popular", "new"],
    },
    highlights: {
        type: [String],
        default: [],
    },
    included: {
        type: [String],
        default: [],
    },
    timeSlots: {
        type: [String],
        default: [],
    },
    maxGroupSize: {
        type: Number,
        required: true,
    },
    notIncluded: {
        type: [String],
        default: [],
    },
    whatToBring: {
        type: [String],
        default: [],
    },
    safetyRestrictions: {
        type: [String],
        default: [],
    },
    agePolicy: {
        type: String,
    },
    bestTime: {
        type: String,
    },
    location: {
        address: { type: String, default: "" },
        details: { type: String, default: "" }
    },
    licenseRequirements: {
        type: String,
    },
    cancellationPolicy: {
        type: String,
    },
    isHighMargin: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    pricingRules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PricingRule",
    }],
    isCombo: {
        type: Boolean,
        default: false,
    },
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
    }],
    dateOverrides: [{
        date: String,
        price: Number,
    }],
    transportation: [{
        type: { type: String, enum: ["Shared", "Private", "Luxury"], required: true },
        label: { type: String, default: "" },
        capacity: { type: Number, default: 0 },
        basePrice: { type: Number, default: 0 },
        pickupLocation: { type: String, default: "" },
        dropoffLocation: { type: String, default: "" },
        features: { type: [String], default: [] },
        isAvailable: { type: Boolean, default: true }
    }],
    translations: {
        ar: {
            title: String,
            subtitle: String,
            shortDescription: String,
            fullDescription: String,
            highlights: [String],
            included: [String],
            notIncluded: [String],
        },
        ru: {
            title: String,
            subtitle: String,
            shortDescription: String,
            fullDescription: String,
            highlights: [String],
            included: [String],
            notIncluded: [String],
        },
        zh: {
            title: String,
            subtitle: String,
            shortDescription: String,
            fullDescription: String,
            highlights: [String],
            included: [String],
            notIncluded: [String],
        }
    }
}, {
    timestamps: true,
    collection: "activities",
});

// Force model refresh to ensure new schema (transportation) is picked up
if (mongoose.models && mongoose.models.Activity) {
    delete mongoose.models.Activity;
}

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
