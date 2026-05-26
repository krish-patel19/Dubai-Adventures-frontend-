import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        applicableTo: {
            type: String,
            enum: ["all", "specific"],
            default: "all",
        },
        applicableActivityIds: {
            type: [String],
            default: [],
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        maxUses: {
            type: Number,
            default: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        validFrom: {
            type: Date,
            default: null,
        },
        validTo: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "coupons",
    }
);

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
