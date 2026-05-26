import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema({
    ruleName: {
        type: String,
        required: true,
    },
    conditionType: {
        type: String,
        enum: ["DateRange", "Weekend", "Holiday", "Capacity"],
        required: true,
    },
    adjustmentType: {
        type: String,
        enum: ["Percentage", "Flat"],
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: { type: Date },
    endDate: { type: Date },
    capacityThreshold: { type: Number } // e.g., 80 for 80%
}, {
    timestamps: true,
    collection: "pricingRules"
});

const PricingRule = mongoose.models.PricingRule || mongoose.model("PricingRule", pricingRuleSchema);

export default PricingRule;
