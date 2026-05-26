import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { normalizeSiteConfig } from "@/lib/site-config";
import SiteConfig from "@/models/SiteConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        await connectToDatabase();
        const config = await SiteConfig.findOne({}).lean();
        return NextResponse.json(normalizeSiteConfig(config || {}), {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            },
        });
    } catch (error) {
        console.error("Config fetch error:", error);
        return NextResponse.json(normalizeSiteConfig({}), {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            },
        });
    }
}
