import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        
        if (slug) {
            const post = await BlogPost.findOne({ slug, status: "published" });
            if (!post) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            // Increment views in background
            BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec();
            return NextResponse.json(post);
        }

        const posts = await BlogPost.find({ status: "published" }).sort({ createdAt: -1 });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}
