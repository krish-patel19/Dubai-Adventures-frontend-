import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A booking must belong to a user"],
        index: true,
    },
    activityId: {
        type: String,
        required: [true, "Activity ID is required"],
    },
    activityTitle: {
        type: String,
        required: [true, "Activity title is required"],
    },
    date: {
        type: Date,
        required: [true, "Booking date is required"],
    },
    timeSlot: {
        type: String,
        required: [true, "Time slot is required"],
    },
    adults: {
        type: Number,
        required: true,
        min: 1,
    },
    children: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    subtotalPrice: {
        type: Number,
        default: 0,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    nationality: {
        type: String,
        trim: true,
    },
    couponCode: {
        type: String,
        trim: true,
    },
    pickupAddress: {
        type: String,
        trim: true,
    },
    dropoffAddress: {
        type: String,
        trim: true,
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    productType: {
        type: String,
        enum: ["activity", "package", "bundle"],
        default: "activity",
    },
    assignedAssetId: {
        type: String,
        default: null,
    },
    transportType: {
        type: String,
        enum: ["Shared", "Private", "Luxury", null],
        default: null,
    },
    transportLabel: {
        type: String,
        default: "",
    },
    transportFee: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "confirmed",
    },
    packageStartDate: {
        type: Date,
        default: null,
    },
    packageEndDate: {
        type: Date,
        default: null,
    },
    isBundle: {
        type: Boolean,
        default: false,
    },
    bundleSubtitle: {
        type: String,
        default: "",
    },
    bundleImage: {
        type: String,
        default: "",
    },
    bundleSummary: {
        type: String,
        default: "",
    },
    bundleDuration: {
        type: String,
        default: "",
    },
    bundledItems: {
        type: [String],
        default: [],
    },
    bundledItemTitles: {
        type: [String],
        default: [],
    },
    paymentMethod: {
        type: String,
        enum: ["card", "wallet"],
        default: "card",
    },
    walletType: {
        type: String,
        enum: ["apple", "google", null],
        default: null,
    },
    reviewInviteSent: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: "bookings",
});

bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
