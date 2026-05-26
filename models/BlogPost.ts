import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    views: { type: Number, default: 0 },
    author: { type: String, default: "Admin" },
}, {
    timestamps: true,
    collection: "blogposts",
});

const BlogPost = mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;
