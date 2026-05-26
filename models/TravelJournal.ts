import mongoose from "mongoose";

const travelJournalSchema = new mongoose.Schema({
    hero: {
        title1: { type: String, default: "Dubai" },
        title2: { type: String, default: "Adventures" },
        subtitle: { type: String, default: "Luxury Travel Journal" },
        image: { type: String, default: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070" },
        introduction: {
            type: [String], default: [
                "Dubai is a destination where luxury knows no bounds, a city that seamlessly blends traditional heritage with futuristic innovation. It is an oasis of opulence, offering experiences that are both grand in scale and intimate in detail.",
                "From the soaring heights of its iconic skyline to the serene tranquility of its golden deserts, every moment in Dubai is designed to be unforgettable. This is a place for those who seek the extraordinary and appreciate the finer things in life."
            ]
        },
        ctaText: { type: String, default: "BEGIN YOUR LUXURY JOURNEY" },
        ctaLink: { type: String, default: "#vision" }
    },
    vision: {
        statement: { type: String, default: "Redefining travel in Dubai with curated luxury experiences and storytelling that captures the essence of the extraordinary." }
    },
    experiencesSection: {
        badge: { type: String, default: "Curated Collection" },
        heading: { type: String, default: "Luxury Narratives" },
        description: { type: String, default: "Every format is a masterpiece of curation, designed for those who seek the extraordinary." }
    },
    experiences: {
        prestige: {
            label: { type: String, default: "01 / Prestige" },
            heading: { type: String, default: "Iconic Prestige Experiences" },
            image: { type: String, default: "https://images.unsplash.com/photo-1582672060674-bc2ae808f8dd?q=80&w=1935" },
            items: { type: [String], default: ["Burj Khalifa VIP Access", "Burj Al Arab Dining", "Private Helicopter Tours", "VIP Royal Dining"] }
        },
        desert: {
            label: { type: String, default: "02 / Desert" },
            heading: { type: String, default: "Elite Desert Escapes" },
            image: { type: String, default: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=1974" },
            items: { type: [String], default: ["Private Platinum Safaris", "Luxury Desert Camps", "Sunrise Hot Air Balloon", "Private Falconry Displays"] }
        },
        waterfront: {
            label: { type: String, default: "03 / Waterfront" },
            heading: { type: String, default: "Waterfront & Yacht Lifestyle" },
            image: { type: String, default: "https://images.unsplash.com/photo-1567896836024-53b7bc01af82?q=80&w=2070" },
            items: { type: [String], default: ["Private Yacht Charters", "Dubai Marina Lifestyle", "Exclusive Beach Clubs", "Luxury Water Sports"] }
        },
        shopping: {
            label: { type: String, default: "04 / Legacy" },
            heading: { type: String, default: "High-End Shopping & Lifestyle" },
            image: { type: String, default: "https://images.unsplash.com/photo-1581235720704-06d3acfc13a7?q=80&w=1780" },
            items: { type: [String], default: ["Dubai Mall Personal Shopping", "Global Luxury Brands", "Private Gold Souk Tours", "Exclusive Fashion Boutiques"] }
        }
    },
    seasonalSection: {
        badge: { type: String, default: "The Art of Timing" },
        heading: { type: String, default: "Seasonal Orchestration" },
        winterSubtitle: { type: String, default: "Peak Brilliance" },
        summerSubtitle: { type: String, default: "Indoor Opulence" },
        transitSubtitle: { type: String, default: "Global Harmony" }
    },
    seasonalGuide: {
        winter: { type: String, default: "The peak luxury season, perfect for outdoor desert escapes and yachting." },
        summer: { type: String, default: "Exclusive indoor luxury experiences, from high-end malls to underwater dining." },
        springAutumn: { type: String, default: "A balanced climate ideal for exploring both the city and the serene coastline." }
    },
    fineDiningSection: {
        badge: { type: String, default: "Culinary Arts" },
        heading: { type: String, default: "Fine Dining" }
    },
    fineDining: {
        image: { type: String, default: "https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=2070" },
        items: { type: [String], default: ["Michelin-star restaurants", "Underwater dining experiences", "Rooftop luxury dining", "Private chef services"] }
    },
    premiumEdgeSection: {
        heading: { type: String, default: "Elegance Defined" }
    },
    whyChooseUs: {
        items: { type: [String], default: ["Premium curated experiences", "Designed for luxury travelers", "Exclusive insider access", "Uncompromising focus on elegance and quality"] }
    },
    finaleSection: {
        buttonText: { type: String, default: "Experience Excellence" },
        buttonLink: { type: String, default: "/bookings" }
    },
    taglines: {
        type: [String],
        default: ["Dubai: The Pinnacle of Luxury", "Where Every Moment is a Masterpiece", "Experience the Extraordinary"]
    }
}, {
    timestamps: true,
    collection: "traveljournal"
});

export function normalizeTravelJournal(data: any) {
    const d = data || {};
    return {
        hero: {
            title1: d.hero?.title1 || "Dubai",
            title2: d.hero?.title2 || "Adventures",
            subtitle: d.hero?.subtitle || "Luxury Travel Journal",
            image: d.hero?.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
            introduction: Array.isArray(d.hero?.introduction) ? d.hero.introduction : [
                "Dubai is a destination where luxury knows no bounds...",
                "From the soaring heights of its iconic skyline..."
            ],
            ctaText: d.hero?.ctaText || "BEGIN YOUR LUXURY JOURNEY",
            ctaLink: d.hero?.ctaLink || "#vision"
        },
        vision: {
            statement: d.vision?.statement || "Redefining travel in Dubai with curated luxury experiences..."
        },
        experiencesSection: {
            badge: d.experiencesSection?.badge || "Curated Collection",
            heading: d.experiencesSection?.heading || "Luxury Narratives",
            description: d.experiencesSection?.description || "Every format is a masterpiece of curation..."
        },
        experiences: {
            prestige: {
                label: d.experiences?.prestige?.label || "01 / Prestige",
                heading: d.experiences?.prestige?.heading || "Iconic Prestige Experiences",
                image: d.experiences?.prestige?.image || "https://images.unsplash.com/photo-1582672060674-bc2ae808f8dd?q=80&w=1935",
                items: Array.isArray(d.experiences?.prestige?.items) ? d.experiences.prestige.items : ["Burj Khalifa VIP Access", "Burj Al Arab Dining", "Private Helicopter Tours", "VIP Royal Dining"]
            },
            desert: {
                label: d.experiences?.desert?.label || "02 / Desert",
                heading: d.experiences?.desert?.heading || "Elite Desert Escapes",
                image: d.experiences?.desert?.image || "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=1974",
                items: Array.isArray(d.experiences?.desert?.items) ? d.experiences.desert.items : ["Private Platinum Safaris", "Luxury Desert Camps", "Sunrise Hot Air Balloon", "Private Falconry Displays"]
            },
            waterfront: {
                label: d.experiences?.waterfront?.label || "03 / Waterfront",
                heading: d.experiences?.waterfront?.heading || "Waterfront & Yacht Lifestyle",
                image: d.experiences?.waterfront?.image || "https://images.unsplash.com/photo-1567896836024-53b7bc01af82?q=80&w=2070",
                items: Array.isArray(d.experiences?.waterfront?.items) ? d.experiences.waterfront.items : ["Private Yacht Charters", "Dubai Marina Lifestyle", "Exclusive Beach Clubs", "Luxury Water Sports"]
            },
            shopping: {
                label: d.experiences?.shopping?.label || "04 / Legacy",
                heading: d.experiences?.shopping?.heading || "High-End Shopping & Lifestyle",
                image: d.experiences?.shopping?.image || "https://images.unsplash.com/photo-1581235720704-06d3acfc13a7?q=80&w=1780",
                items: Array.isArray(d.experiences?.shopping?.items) ? d.experiences.shopping.items : ["Dubai Mall Personal Shopping", "Global Luxury Brands", "Private Gold Souk Tours", "Exclusive Fashion Boutiques"]
            }
        },
        seasonalSection: {
            badge: d.seasonalSection?.badge || "The Art of Timing",
            heading: d.seasonalSection?.heading || "Seasonal Orchestration",
            winterSubtitle: d.seasonalSection?.winterSubtitle || "Peak Brilliance",
            summerSubtitle: d.seasonalSection?.summerSubtitle || "Indoor Opulence",
            transitSubtitle: d.seasonalSection?.transitSubtitle || "Global Harmony"
        },
        seasonalGuide: {
            winter: d.seasonalGuide?.winter || "The peak luxury season...",
            summer: d.seasonalGuide?.summer || "Exclusive indoor luxury experiences...",
            springAutumn: d.seasonalGuide?.springAutumn || "A balanced climate..."
        },
        fineDiningSection: {
            badge: d.fineDiningSection?.badge || "Culinary Arts",
            heading: d.fineDiningSection?.heading || "Fine Dining"
        },
        fineDining: {
            image: d.fineDining?.image || "https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=2070",
            items: Array.isArray(d.fineDining?.items) ? d.fineDining.items : ["Michelin-star restaurants", "Underwater dining experiences", "Rooftop luxury dining", "Private chef services"]
        },
        premiumEdgeSection: {
            heading: d.premiumEdgeSection?.heading || "Elegance Defined"
        },
        whyChooseUs: {
            items: Array.isArray(d.whyChooseUs?.items) ? d.whyChooseUs.items : ["Premium curated experiences", "Designed for luxury travelers", "Exclusive insider access", "Uncompromising focus on elegance and quality"]
        },
        finaleSection: {
            buttonText: d.finaleSection?.buttonText || "Experience Excellence",
            buttonLink: d.finaleSection?.buttonLink || "/bookings"
        },
        taglines: Array.isArray(d.taglines) ? d.taglines : ["Dubai: The Pinnacle of Luxury", "Where Every Moment is a Masterpiece", "Experience the Extraordinary"]
    };
}

const TravelJournal = mongoose.models.TravelJournal || mongoose.model("TravelJournal", travelJournalSchema);
export default TravelJournal;
