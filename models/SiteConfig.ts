import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema({
    heroSlides: {
        type: [{
            fallbackImage: { type: String, default: "" },
            videoUrl: { type: String, default: "" },
            title: { type: String, default: "" },
            subtitle: { type: String, default: "" },
            buttonText: { type: String, default: "Book Now" },
            buttonLink: { type: String, default: "#activities" },
        }],
        default: [],
    },
    general: {
        siteName: { type: String, default: "Dubai Adventures" },
        siteLogoUrl: { type: String, default: "" },
        siteTagline: { type: String, default: "" },
        contactAddress: { type: String, default: "" },
        contactPhone: { type: String, default: "" },
        contactEmail: { type: String, default: "" },
    },
    about: {
        heading: { type: String, default: "" },
        subheading: { type: String, default: "" },
        description: { type: String, default: "" },
        stats: {
            type: [{ label: String, value: String }],
            default: [],
        },
        pillars: {
            type: [{ icon: String, title: String, text: String }],
            default: [],
        },
    },
    aboutPage: {
        eyebrow: { type: String, default: "" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
    },
    seo: {
        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },
        ogImage: { type: String, default: "" },
    },
    social: {
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        youtube: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
    },
    legal: {
        privacyPolicy: { type: String, default: "" },
        termsOfService: { type: String, default: "" },
        refundPolicy: { type: String, default: "" },
    },
    categories: {
        type: [{ id: String, label: String, icon: String }],
        default: [],
    },
    featuresHeading: { type: String, default: "The Dubai Adventures Difference" },
    featuresSubheading: { type: String, default: "" },
    features: {
        type: [{ icon: String, title: String, desc: String }],
        default: [],
    },
    footerExperiences: { type: [String], default: [] },
    footerCompany: { type: [String], default: [] },
    aiPlanner: {
        isActive: { type: Boolean, default: true },
        chatbotName: { type: String, default: "Khalid" },
        chatbotIcon: { type: String, default: "mosque" },
        systemInstructions: { type: String, default: "You are an expert luxury travel consultant for \"Dubai Adventures\". Your goal is to help users plan their dream Dubai experiences in a friendly, helpful, and sophisticated manner." },
        welcomeGreeting: { type: String, default: "Salaam! I'm your Dubai Expert. I can help you find the best desert safari" },
        modelEngine: { type: String, default: "gemini-flash-latest" },
        plannerPage: {
            heroEyebrow: { type: String, default: "Next-Gen AI Intelligence" },
            heroTitlePrefix: { type: String, default: "Your Personal" },
            heroTitleHighlight: { type: String, default: "Dubai Architect" },
            heroDescription: { type: String, default: "Describe your travelers, budget, style, and must-do experiences. Our AI concierge will shape a polished Dubai itinerary around real bookable tours." },
            heroImages: {
                type: [String],
                default: [
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
                    "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974",
                    "https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=1974"
                ],
            },
            queryPlaceholder: { type: String, default: "E.g., 'A 3-day luxury trip for 2 with desert safari and yacht cruise...'" },
            submitLabel: { type: String, default: "Forge Itinerary" },
            loadingLabel: { type: String, default: "Architecting..." },
            promptChipsLabel: { type: String, default: "Try a concierge-ready brief" },
            emptyStateEyebrow: { type: String, default: "AI Concierge" },
            emptyStateTitle: { type: String, default: "Build a smarter Dubai trip brief" },
            emptyStateDescription: { type: String, default: "Share your travelers, dates, budget, and must-do experiences. The planner will return a day-by-day route linked to real tours." },
            dayLabel: { type: String, default: "Day" },
            downloadLabel: { type: String, default: "Secure PDF" },
            experienceButtonLabel: { type: String, default: "Select Experience" },
            featureCards: {
                type: [{
                    icon: { type: String, default: "sparkles" },
                    title: { type: String, default: "" },
                    desc: { type: String, default: "" },
                }],
                default: [
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
                ],
            },
            examplePrompts: {
                type: [String],
                default: [
                    "A 3-day luxury trip for 2 with desert safari and yacht cruise",
                    "A family Dubai plan with theme parks, dinner cruise, and city highlights",
                    "A romantic anniversary weekend with premium sunset experiences",
                ],
            },
        },
    },
}, {
    timestamps: true,
    collection: "siteconfig",
});

const SiteConfig = mongoose.models.SiteConfig || mongoose.model("SiteConfig", siteConfigSchema);
export default SiteConfig;
