import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── 1. Always pass through: Next.js internals, static files, auth APIs ──
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/public/") ||
        pathname.startsWith("/api/auth/") // NextAuth handles itself
    ) {
        return NextResponse.next();
    }

    // ── 2. Add security & performance headers to every response ──
    const res = NextResponse.next();

    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // ── 3. (Optional) Future-proofing: check session for protected routes ──
    // Currently all main-site pages are public. If you want to protect
    // specific routes (e.g. /profile, /my-bookings), add them here:
    const PROTECTED_PATHS: string[] = [
        // "/profile",
        // "/my-bookings",
    ];

    const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

    if (isProtected) {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            // Not logged in — redirect to home (auth modal opens there)
            const homeUrl = new URL("/", req.url);
            homeUrl.searchParams.set("auth", "login");
            return NextResponse.redirect(homeUrl);
        }
    }

    return res;
}

export const config = {
    // Run on all routes EXCEPT Next.js internals and static assets
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
    ],
};
