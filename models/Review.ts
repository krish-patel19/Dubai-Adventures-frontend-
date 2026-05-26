import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: "" },
    activityTitle: { type: String, default: "" },
    activityId: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    avatar: { type: String, default: "" },
    status: {
        type: String,
        enum: ["pending", "published", "hidden"],
        default: "pending",
    },
    approvedAt: { type: Date },
}, {
    timestamps: true,
    collection: "reviews",
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
