"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BlogPostRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/travel-journal");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0B0B0B] text-[#C9A14A]">
            <div className="animate-pulse fd text-2xl italic font-serif">Deep diving into luxury...</div>
        </div>
    );
}
