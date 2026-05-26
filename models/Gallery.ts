import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String, default: "" },
    category: { type: String, default: "General" },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
}, {
    timestamps: true,
    collection: "gallery",
});

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
export default Gallery;
