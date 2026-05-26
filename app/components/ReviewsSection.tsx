"use client";

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const GuestExperiences = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/reviews")
            .then(res => res.json())
            .then(data => {
                const reviewList = Array.isArray(data) ? data : (data.reviews || []);
                setReviews(reviewList);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch reviews", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="py-24 text-center bg-[#FDFBF7]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent"></div>
            </div>
        );
    }

    if (reviews.length === 0) return null;

    return (
        // SECTION BACKGROUND: Warm White (#FDFBF7)
        // TEXT COLOR: Dark Warm Grey (#4A4843)
        <section className="py-20 bg-[#FDFBF7] text-[#4A4843]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-light mb-4 text-[#2E2C29]">
                        Guest <span className="font-medium text-[#C5A059]">Experiences</span>
                    </h2>
                    <p className="text-[#78716C] max-w-xl mx-auto">
                        See what our adventurers have to say about their journey with us.
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div
                            key={review._id || review.id}
                            // CARD STYLING:
                            // bg-white: White background for cards
                            // border-[#E6E2D8]: Subtle warm beige border
                            // shadow: Soft warm shadow
                            className="bg-white p-8 rounded-2xl border-2 border-[#D4A744] shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            {/* Star Rating: Gold/Bronze accent (#C5A059) */}
                            <div className="flex gap-1 mb-4 text-[#C5A059]">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={16} 
                                        className={i < review.rating ? "fill-[#C5A059] text-[#C5A059]" : "fill-[#E6E2D8] text-[#E6E2D8]"} 
                                        strokeWidth={0} 
                                    />
                                ))}
                            </div>

                            {/* Review Text */}
                            <p className="mb-6 leading-relaxed text-[#5C554B] line-clamp-4">
                                "{review.comment || review.text}"
                            </p>

                            {/* User Info */}
                            <div className="flex items-center gap-3 mt-auto">
                                {/* Avatar Placeholder: Warm beige background with Gold text */}
                                <div className="w-10 h-10 rounded-full bg-[#F5F0E6] flex items-center justify-center text-[#C5A059] font-bold text-sm shrink-0">
                                    {review.name?.charAt(0) || "G"}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-[#2E2C29] text-sm truncate">{review.name}</h4>
                                    <p className="text-xs text-[#9CA3AF] truncate">{review.activityTitle || review.location || "Dubai Adventure"}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default GuestExperiences;
