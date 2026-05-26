import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Yacht", "Van", "Equipment"],
        required: true,
    },
    baseCapacity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Available", "Maintenance", "Occupied"],
        default: "Available",
    },
    maintenanceStatusDetail: {
        type: String,
    },
    location: {
        type: String,
    },
    poolId: {
        type: String, // e.g., "Luxury-Van-Pool"
    },
    activityScaling: [{
        activityType: String,
        capacity: Number,
    }],
    metadata: {
        type: Map,
        of: String,
    }
}, {
    timestamps: true,
    collection: "assets",
});

const Asset = mongoose.models.Asset || mongoose.model("Asset", assetSchema);

export default Asset;
