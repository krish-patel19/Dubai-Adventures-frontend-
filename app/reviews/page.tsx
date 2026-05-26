"use client";

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Send, User, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        activityTitle: '',
        comment: ''
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/reviews");
            const data = await res.json();
            const reviewList = Array.isArray(data) ? data : (data.reviews || []);
            setReviews(reviewList);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'rating' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSubmitSuccess(true);
                setFormData({
                    name: '',
                    email: '',
                    rating: 5,
                    activityTitle: '',
                    comment: ''
                });
                setTimeout(() => setSubmitSuccess(false), 5000);
            }
        } catch (err) {
            console.error("Failed to submit review", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            <Navbar 
                hasBooking={false}
                onCartClick={() => {}}
                onAuthClick={(mode: "login" | "signup") => {
                    setAuthMode(mode);
                    setIsAuthModalOpen(true);
                }}
            />
            
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-[#FDFBF7] overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-[#C5A059]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#C5A059]/5 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-light mb-6 text-[#2E2C29]">
                            Guest <span className="font-semibold text-[#C5A059] italic fd-normal">Experiences</span>
                        </h1>
                        <p className="text-[#78716C] max-w-2xl mx-auto text-lg leading-relaxed">
                            Discover why travelers from around the world choose Dubai Adventures for their desert safaris and luxury experiences.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    
                    {/* Submission Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <div className="bg-white p-8 rounded-3xl border-2 border-[#D4A744] shadow-[0_10px_40px_rgba(92,85,75,0.08)]">
                                <h3 className="text-2xl font-semibold mb-2 text-[#2E2C29]">Share Your Journey</h3>
                                <p className="text-[#78716C] text-sm mb-8">We value your feedback and would love to hear about your adventure.</p>
                                
                                {submitSuccess ? (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h4 className="text-emerald-900 font-bold mb-2">Thank You!</h4>
                                        <p className="text-emerald-700 text-sm">Your review has been submitted and is currently pending approval by our team.</p>
                                        <button 
                                            onClick={() => setSubmitSuccess(false)}
                                            className="mt-6 text-emerald-700 font-bold text-sm underline underline-offset-4"
                                        >
                                            Submit another review
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-2 px-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="John Doe"
                                                    className="w-full bg-[#FDFBF7] border border-[#E6E2D8] rounded-2xl py-4 pl-12 pr-4 text-[#2E2C29] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-2 px-1">Email Address (Optional)</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                className="w-full bg-[#FDFBF7] border border-[#E6E2D8] rounded-2xl py-4 px-5 text-[#2E2C29] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-2 px-1">Experience Rated</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" size={18} />
                                                <input
                                                    type="text"
                                                    name="activityTitle"
                                                    value={formData.activityTitle}
                                                    onChange={handleInputChange}
                                                    placeholder="Premium Desert Safari"
                                                    className="w-full bg-[#FDFBF7] border border-[#E6E2D8] rounded-2xl py-4 pl-12 pr-4 text-[#2E2C29] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-2 px-1">Rating</label>
                                            <div className="flex bg-[#FDFBF7] border border-[#E6E2D8] rounded-2xl p-2 gap-1">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, rating: num }))}
                                                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${
                                                            formData.rating >= num ? "bg-[#C5A059] text-white" : "hover:bg-[#C5A059]/10 text-[#C5A059]"
                                                        }`}
                                                    >
                                                        <Star size={18} className={formData.rating >= num ? "fill-current" : ""} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-2 px-1">Your Story</label>
                                            <textarea
                                                name="comment"
                                                required
                                                value={formData.comment}
                                                onChange={handleInputChange}
                                                rows={4}
                                                placeholder="Tell us about your experience..."
                                                className="w-full bg-[#FDFBF7] border border-[#E6E2D8] rounded-2xl py-4 px-5 text-[#2E2C29] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none resize-none"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#2E2C29] hover:bg-[#C5A059] text-white font-bold py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group"
                                        >
                                            {submitting ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                <>
                                                    Submit Experience
                                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-2 space-y-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white p-8 rounded-3xl border border-[#E6E2D8] h-64 animate-pulse"></div>
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl border-2 border-[#D4A744] text-center">
                                <MessageSquare size={48} className="mx-auto mb-4 text-[#E6E2D8]" />
                                <h4 className="text-xl font-semibold text-[#2E2C29]">No reviews yet</h4>
                                <p className="text-[#78716C] mt-2">Be the first to share your adventure!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {reviews.map((review, i) => (
                                    <div 
                                        key={review._id || i}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#D4A744] shadow-[0_4px_20px_rgba(92,85,75,0.04)] hover:shadow-[0_10px_40px_rgba(92,85,75,0.12)] transition-all duration-500 hover:-translate-y-1 flex flex-col group animate-in slide-in-from-bottom-4 duration-500 ease-out"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={16} 
                                                    className={i < review.rating ? "fill-[#C5A059] text-[#C5A059]" : "fill-[#E6E2D8] text-[#E6E2D8]"} 
                                                    strokeWidth={0} 
                                                />
                                            ))}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <p className="text-[#5C554B] leading-relaxed italic text-lg mb-8">
                                                "{review.comment}"
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-[#F5F0E6] flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5F0E6] to-[#E6DCC3] flex items-center justify-center text-[#C5A059] font-bold text-lg shadow-inner">
                                                    {review.name?.charAt(0) || "G"}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#2E2C29]">{review.name}</h4>
                                                    <div className="flex items-center gap-1.5 text-[#9CA3AF] text-xs font-medium">
                                                        <MapPin size={12} className="text-[#C5A059]" />
                                                        {review.activityTitle || "Dubai Adventure"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[10px] uppercase tracking-widest font-bold">
                                                <Calendar size={12} className="text-[#C5A059]" />
                                                {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </main>
    );
};

export default ReviewsPage;
