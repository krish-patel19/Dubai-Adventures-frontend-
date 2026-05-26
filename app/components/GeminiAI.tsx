"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowRight,
    Bot,
    Clock,
    Compass,
    Crown,
    Diamond,
    MapPin,
    MessageSquare,
    RefreshCcw,
    Send,
    Sparkles,
    Star,
    User,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { stripActivityTags } from "@/lib/ai/chat-recommendations";

interface Message {
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    isError?: boolean;
    fallback?: boolean;
    recommendations?: ChatRecommendationData[];
}

interface CardActivity {
    id: string;
    title: string;
    subtitle?: string;
    shortDescription?: string;
    price: number;
    duration?: string;
    image?: string;
    category: string;
    rating?: number;
    badge?: string;
    badgeType?: string;
    timeSlots?: string[];
    maxGroupSize?: number;
    isCombo?: boolean;
    matchLabel?: string;
    recommendationReason?: string;
}

interface ChatRecommendationData extends CardActivity {
    score?: number;
}

const QUICK_PROMPTS = [
    "I want a luxury yacht for a couple at sunset.",
    "Show me a family package under 400 AED.",
    "Recommend an adrenaline tour or combo package.",
    "Plan a premium desert evening with dinner.",
];

const CATEGORY_LABELS: Record<string, string> = {
    desert: "Desert Escape",
    water: "Waterfront",
    sky: "Skyline",
    city: "City Icon",
    atv: "Adventure",
    luxury: "Luxury",
};

function normalizeCardActivity(source: Partial<CardActivity> | null | undefined): CardActivity | null {
    if (!source?.id || !source?.title) {
        return null;
    }

    return {
        id: source.id,
        title: source.title,
        subtitle: source.subtitle || "",
        shortDescription: source.shortDescription || "",
        price: typeof source.price === "number" ? source.price : 0,
        duration: source.duration || "",
        image: source.image || "",
        category: source.category || "city",
        rating: source.rating || 4.8,
        badge: source.badge || "",
        badgeType: source.badgeType || "",
        timeSlots: source.timeSlots || [],
        maxGroupSize: source.maxGroupSize,
        isCombo: Boolean(source.isCombo),
        matchLabel: source.matchLabel || "",
        recommendationReason: source.recommendationReason || "",
    };
}

function normalizeRecommendations(value: unknown): ChatRecommendationData[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => normalizeCardActivity(item as Partial<ChatRecommendationData>))
        .filter((item): item is ChatRecommendationData => Boolean(item));
}

const ChatActivityCard = ({
    activityId,
    recommendation,
}: {
    activityId?: string;
    recommendation?: ChatRecommendationData;
}) => {
    const [activity, setActivity] = useState<CardActivity | null>(normalizeCardActivity(recommendation));
    const [loading, setLoading] = useState(!recommendation && Boolean(activityId));

    useEffect(() => {
        const prefetched = normalizeCardActivity(recommendation);
        if (prefetched) {
            setActivity(prefetched);
            setLoading(false);
            return;
        }

        if (!activityId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/activities/mini?id=${encodeURIComponent(activityId)}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setActivity(normalizeCardActivity(data));
                }
            })
            .catch((err) => console.error("Card Fetch Error:", err))
            .finally(() => setLoading(false));
    }, [activityId, recommendation]);

    if (loading) {
        return (
            <div className="mt-4 h-[220px] w-full animate-pulse overflow-hidden rounded-[28px] border border-[#d7c0a0]/40 bg-white/60" />
        );
    }

    if (!activity) return null;

    const tierIcon =
        activity.isCombo ? (
            <Crown size={12} />
        ) : activity.badgeType === "luxury" || activity.badgeType === "gold" ? (
            <Diamond size={12} />
        ) : (
            <Sparkles size={12} />
        );

    const tierLabel =
        activity.matchLabel ||
        (activity.isCombo ? "Package Match" : activity.badgeType === "luxury" ? "Luxury Match" : "Tour Match");

    return (
        <Link
            href={`/activities/${activity.id}`}
            className="mt-4 block overflow-hidden rounded-[28px] border border-[#d1b38a]/45 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(249,241,227,0.94))] shadow-[0_18px_45px_rgba(62,40,18,0.12)] transition-transform duration-300 hover:-translate-y-0.5"
        >
            <div className="relative h-40 overflow-hidden">
                <Image
                    src={activity.image || "/placeholder-activity.jpg"}
                    alt={activity.title}
                    fill
                    className="object-cover"

                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d140d]/90 via-[#1d140d]/25 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[#2d241e]/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f6d49b] backdrop-blur">
                        {tierIcon}
                        {tierLabel}
                    </span>
                    {activity.badge ? (
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d5b2b]">
                            {activity.badge}
                        </span>
                    ) : null}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f3d39f]/80">
                        {CATEGORY_LABELS[activity.category] || "Curated Experience"}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold leading-tight text-white">
                        {activity.title}
                    </h4>
                </div>
            </div>

            <div className="space-y-4 p-4">
                {activity.recommendationReason ? (
                    <div className="rounded-2xl border border-[#e6d6bd] bg-white/75 px-4 py-3 text-[13px] leading-relaxed text-[#5d4a3d]">
                        {activity.recommendationReason}
                    </div>
                ) : null}

                {activity.shortDescription ? (
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-[#5d4a3d]">
                        {activity.shortDescription}
                    </p>
                ) : null}

                <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#eadbc5] bg-white/75 p-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7c4c]">From</p>
                        <p className="mt-1 text-[15px] font-semibold text-[#241a13]">{activity.price} AED</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7c4c]">Duration</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-[#241a13]">
                            <Clock size={12} className="text-[#b78848]" />
                            {activity.duration || "Flexible"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7c4c]">Rating</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-[#241a13]">
                            <Star size={12} className="fill-[#d8a84c] text-[#d8a84c]" />
                            {(activity.rating || 4.8).toFixed(1)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#2d241e] px-4 py-3 text-white">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#d8b57f]">
                            {activity.isCombo ? "Package" : "Tour"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#f8f1e7]">
                            View full details and booking options
                        </p>
                    </div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10">
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function GeminiAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => {
                if (data.aiPlanner) {
                    setConfig(data.aiPlanner);
                }
            })
            .catch((err) => console.error("Failed to fetch AI configuration", err));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const ensureWelcomeMessage = () => {
        if (messages.length > 0) return;

        setMessages([
            {
                role: "ai",
                content:
                    config?.welcomeGreeting ||
                    "Welcome to your private Dubai concierge. Tell me your budget, group type, and preferred vibe, and I will match the strongest live tours and packages for you.",
                timestamp: new Date(),
            },
        ]);
    };

    const handleSendMessage = async (presetText?: string) => {
        const userText = (presetText ?? input).trim();
        if (!userText || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: userText,
            timestamp: new Date(),
        };
        const nextMessages = [...messages, userMessage];

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: nextMessages.map((message) => ({
                        role: message.role,
                        content: message.content,
                    })),
                }),
            });

            const data = await res.json();

            if (data.content) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "ai",
                        content: data.content,
                        timestamp: new Date(),
                        fallback: Boolean(data.fallback),
                        recommendations: normalizeRecommendations(data.recommendations),
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "ai",
                        content: data.details || data.error || "An unexpected error occurred. Please try again later.",
                        timestamp: new Date(),
                        isError: true,
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "Network connection lost. Please verify your internet connection and try again.",
                    timestamp: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageText = (content: string, recommendations?: ChatRecommendationData[]) => {
        const displayContent = recommendations?.length ? stripActivityTags(content) : content;
        const parts = displayContent.split(/(\[ACTIVITY:[a-z0-9-]+\])/i);

        return parts.map((part, index) => {
            const match = part.match(/\[ACTIVITY:([a-z0-9-]+)\]/i);
            if (match && !recommendations?.length) {
                return <ChatActivityCard key={`card-${index}`} activityId={match[1]} />;
            }

            if (!part.trim()) {
                return null;
            }

            const lines = part.split("\n").filter((line) => line.trim().length > 0);

            return (
                <div key={`text-${index}`} className="space-y-2">
                    {lines.map((line, lineIndex) => (
                        <p key={`${index}-${lineIndex}`} className="leading-relaxed">
                            {line}
                        </p>
                    ))}
                </div>
            );
        });
    };

    if (config?.isActive === false) return null;

    const ChatIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => {
        const icon = config?.chatbotIcon || "sparkles";
        switch (icon) {
            case "mosque":
                return <Compass size={size} className={className} />;
            case "bot":
                return <Bot size={size} className={className} />;
            default:
                return <Sparkles size={size} className={className} />;
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans antialiased">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, y: 18, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.95 }}
                        onClick={() => {
                            setIsOpen(true);
                            ensureWelcomeMessage();
                        }}
                        className="group flex items-center gap-3 rounded-full border border-[#d6b27d]/30 bg-[linear-gradient(135deg,#2d241e_0%,#3b2e25_58%,#8a6335_100%)] px-4 py-3 text-left text-white shadow-[0_18px_40px_rgba(32,22,15,0.3)] transition-transform hover:-translate-y-0.5"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10">
                            <ChatIcon size={22} className="text-[#f2c881]" />
                        </div>
                        <div className="hidden min-w-0 sm:block">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#dcb474]">
                                Private Concierge
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#f9f2e7]">
                                Luxury tour and package matching
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10">
                            <MessageSquare size={18} />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.22 }}
                        className="relative flex h-[760px] w-[430px] max-h-[86vh] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[34px] border border-[#d9c0a1]/45 bg-[linear-gradient(180deg,#fbf6ef_0%,#f7efe4_35%,#f2eadf_100%)] shadow-[0_30px_90px_rgba(31,20,10,0.28)]"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,177,111,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(61,41,23,0.08),transparent_28%)]" />

                        <div className="relative shrink-0 overflow-hidden border-b border-[#ceb28d]/35 bg-[linear-gradient(135deg,#241a14_0%,#382b21_45%,#8b6334_100%)] px-5 pb-5 pt-5 text-white">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,218,160,0.18),transparent_30%)]" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10">
                                            <ChatIcon size={22} className="text-[#f3ca85]" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#dfbb7d]">
                                                Dubai Adventures
                                            </p>
                                            <h3 className="mt-1 text-xl font-semibold text-[#fff8f0]">
                                                {config?.chatbotName || "Private Concierge"}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-[#f1e0c8]">
                                        Professional Gemini-powered tour matching for luxury charters, VIP desert plans, signature experiences, and package recommendations.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-[#fff4e5]">
                                            Live inventory matching
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-[#fff4e5]">
                                            Tours + packages
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 transition-colors hover:bg-white/15"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="relative flex-1 space-y-5 overflow-y-auto px-4 py-5"
                        >
                            {messages.length <= 1 && !isLoading ? (
                                <div className="rounded-[28px] border border-[#e6d3b7] bg-white/75 p-4 shadow-[0_14px_30px_rgba(61,40,20,0.06)] backdrop-blur">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a67f44]">
                                        Quick Concierge Briefs
                                    </p>
                                    <div className="mt-3 grid gap-2">
                                        {QUICK_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => handleSendMessage(prompt)}
                                                className="rounded-2xl border border-[#ead8bc] bg-[#f8f2ea] px-4 py-3 text-left text-[13px] font-medium text-[#46352a] transition-colors hover:border-[#cfa46a] hover:bg-white"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}-${message.timestamp.getTime()}`}
                                    className={cn(
                                        "flex gap-3",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === "ai" ? (
                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#cfb086]/45 bg-[#2d241e] text-[#efc67e] shadow-sm">
                                            <ChatIcon size={16} />
                                        </div>
                                    ) : null}

                                    <div
                                        className={cn(
                                            "max-w-[86%] rounded-[28px] px-4 py-4 shadow-sm",
                                            message.role === "user"
                                                ? "rounded-tr-md bg-[linear-gradient(135deg,#8e6636_0%,#c59455_100%)] text-white shadow-[0_14px_28px_rgba(128,88,40,0.25)]"
                                                : message.isError
                                                    ? "rounded-tl-md border border-red-200 bg-red-50 text-red-900"
                                                    : "rounded-tl-md border border-[#ead7bc] bg-white/[0.88] text-[#473529] shadow-[0_16px_32px_rgba(61,40,20,0.08)] backdrop-blur"
                                        )}
                                    >
                                        {message.role === "ai" && !message.isError ? (
                                            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a67f44]">
                                                <Sparkles size={12} />
                                                {message.fallback ? "Live Concierge Match" : "Private Concierge"}
                                            </div>
                                        ) : null}

                                        {message.isError ? (
                                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                                <AlertCircle size={14} />
                                                System Alert
                                            </div>
                                        ) : null}

                                        <div className="space-y-3 text-[14px] font-medium">
                                            {renderMessageText(message.content, message.recommendations)}
                                        </div>

                                        {message.recommendations?.length ? (
                                            <div className="mt-4">
                                                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9b7743]">
                                                    <Crown size={12} />
                                                    Matched Experiences
                                                </div>
                                                <div className="space-y-3">
                                                    {message.recommendations.slice(0, 3).map((recommendation) => (
                                                        <ChatActivityCard
                                                            key={`${message.timestamp.getTime()}-${recommendation.id}`}
                                                            recommendation={recommendation}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        <div
                                            className={cn(
                                                "mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-65",
                                                message.role === "user" ? "text-right text-white/80" : "text-[#846947]"
                                            )}
                                        >
                                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>

                                    {message.role === "user" ? (
                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9c3a5] bg-white text-[#7b5f43] shadow-sm">
                                            <User size={16} />
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            {isLoading ? (
                                <div className="flex gap-3">
                                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#cfb086]/45 bg-[#2d241e] text-[#efc67e]">
                                        <RefreshCcw size={14} className="animate-spin" />
                                    </div>
                                    <div className="rounded-[28px] rounded-tl-md border border-[#ead7bc] bg-white/[0.85] px-4 py-4 shadow-sm">
                                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a67f44]">
                                            Curating Matches
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-[#c69b5a] animate-bounce [animation-delay:-0.3s]" />
                                            <div className="h-2 w-2 rounded-full bg-[#c69b5a] animate-bounce [animation-delay:-0.15s]" />
                                            <div className="h-2 w-2 rounded-full bg-[#c69b5a] animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="relative shrink-0 border-t border-[#e3d2b7] bg-white/70 px-4 pb-4 pt-3 backdrop-blur">
                            <div className="mb-3 flex flex-wrap gap-2">
                                {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                                    <button
                                        key={`footer-${prompt}`}
                                        onClick={() => handleSendMessage(prompt)}
                                        className="rounded-full border border-[#e5d2b5] bg-[#faf5ee] px-3 py-1.5 text-[11px] font-medium text-[#6d543b] transition-colors hover:border-[#cda062] hover:bg-white"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-end gap-3 rounded-[28px] border border-[#dcc6a5] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf5ec_100%)] p-2 shadow-[0_10px_24px_rgba(61,40,20,0.06)]">
                                <textarea
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Describe your ideal Dubai experience, budget, guests, or timing..."
                                    className="min-h-[52px] w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-relaxed text-[#32261d] outline-none placeholder:text-[#927a60] no-scrollbar"
                                    rows={1}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8f6737_0%,#c49252_100%)] text-white shadow-[0_12px_25px_rgba(133,91,42,0.28)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Send size={18} className="relative left-[1px]" />
                                </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#977952]">
                                <span>Live inventory powered</span>
                                <span className="inline-flex items-center gap-1">
                                    <MapPin size={11} />
                                    Dubai only
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
