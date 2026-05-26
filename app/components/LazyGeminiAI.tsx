"use client";

import dynamic from "next/dynamic";

// ─── Lazy-load the AI chatbot (650+ lines, framer-motion heavy) ───
// Wrapped in a client component so we can use ssr: false
const GeminiAI = dynamic(() => import("./GeminiAI"), { ssr: false });

export default function LazyGeminiAI() {
  return <GeminiAI />;
}
