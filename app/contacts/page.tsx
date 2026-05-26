"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Youtube, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactsPage() {
    const [config, setConfig] = useState<any>(null);
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    useEffect(() => {
        fetch("/api/config")
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error("Failed to load config", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");

        try {
            const res = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormStatus("success");
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                setTimeout(() => setFormStatus("idle"), 5000);
            } else {
                setFormStatus("error");
            }
        } catch (err) {
            console.error("Submission error", err);
            setFormStatus("error");
        }
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Call Us",
            value: config?.general?.contactPhone || "+971 50 123 4567",
            href: `tel:${config?.general?.contactPhone}`,
            label: "Speak with our concierge"
        },
        {
            icon: Mail,
            title: "Email Us",
            value: config?.general?.contactEmail || "bookings@dubaiadventures.com",
            href: `mailto:${config?.general?.contactEmail}`,
            label: "For inquiries and bookings"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            value: config?.general?.contactAddress || "Downtown Dubai, UAE",
            href: `https://maps.google.com/?q=${encodeURIComponent(config?.general?.contactAddress || "Dubai")}`,
            label: "Our executive office"
        }
    ];

    return (
        <main className="min-h-screen bg-[#FDFCFB] text-[#2D241E]">
            <Navbar hasBooking={false} onCartClick={() => { }} onAuthClick={() => { }} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 text-center">
                    <span className="inline-block text-[0.7rem] sm:text-[0.78rem] tracking-[0.4em] uppercase font-bold text-primary mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Luxury Concierge
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-normal mb-10 leading-[1.2] animate-in fade-in slide-in-from-bottom-3 duration-1000">
                        Let's Design Your <span className="italic font-normal gold-text px-2 inline-block">Next Adventure</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-[1rem] sm:text-[1.1rem] text-[#8C7E73] font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 opacity-90">
                        Our dedicated team is ready to curate your perfect Dubai experience.
                        Reach out to us for bespoke itineraries and premium service.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">

                    {/* Left Side: Contact Info */}
                    <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
                        <div className="grid grid-cols-1 gap-6">
                            {contactInfo.map((info, idx) => (
                                <a
                                    key={idx}
                                    href={info.href}
                                    className="group flex items-start gap-6 p-6 rounded-3xl bg-white border border-primary/10 shadow-[0_4px_20px_rgba(235,218,202,0.2)] hover:shadow-[0_10px_40px_rgba(235,218,202,0.4)] transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                        <info.icon size={22} className="stroke-[1.5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-[#A89B8E] mb-1">{info.title}</h3>
                                        <p className="text-[1.1rem] font-bold text-[#41362F] mb-1 group-hover:text-primary transition-colors">{info.value}</p>
                                        <span className="text-[0.78rem] font-medium text-[#8C7E73]">{info.label}</span>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <ArrowRight size={18} className="text-primary" />
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div className="p-8 rounded-3xl bg-white border border-primary/10 shadow-[0_10px_40px_rgba(235,218,202,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                                <MessageSquare size={120} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-extralight tracking-widest uppercase mb-6 relative z-10 text-[#41362F]">Follow Our Journey</h3>
                            <div className="flex gap-4 relative z-10">
                                {[
                                    { icon: Instagram, href: config?.social?.instagram, label: "Instagram" },
                                    { icon: Facebook, href: config?.social?.facebook, label: "Facebook" },
                                    { icon: Youtube, href: config?.social?.youtube, label: "Youtube" }
                                ].map((social, idx) => (
                                    social.href && (
                                        <a
                                            key={idx}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-500"
                                            aria-label={social.label}
                                        >
                                            <social.icon size={20} className="stroke-[1.5]" />
                                        </a>
                                    )
                                ))}
                            </div>
                            <p className="mt-8 text-[0.8rem] text-[#8C7E73] font-medium relative z-10">
                                Discover exclusive content and updates on our social channels.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-4 duration-1000 delay-150">
                        <div className="bg-white border border-primary/10 rounded-[40px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(235,218,202,0.3)] relative">
                            {formStatus === "success" ? (
                                <div className="py-20 text-center animate-in zoom-in-95 duration-500">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mx-auto mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#41362F] mb-4">Message Sent Successfully</h2>
                                    <p className="text-[#8C7E73] font-medium max-w-sm mx-auto">
                                        Thank you for reaching out. Our concierge team will get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setFormStatus("idle")}
                                        className="mt-8 text-primary font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] uppercase tracking-widest font-extrabold text-[#A89B8E] ml-4">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full bg-[#FDFCFB] border border-primary/10 rounded-2xl px-6 py-4 text-[0.95rem] font-medium text-[#41362F] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] uppercase tracking-widest font-extrabold text-[#A89B8E] ml-4">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="john@example.com"
                                                className="w-full bg-[#FDFCFB] border border-primary/10 rounded-2xl px-6 py-4 text-[0.95rem] font-medium text-[#41362F] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] uppercase tracking-widest font-extrabold text-[#A89B8E] ml-4">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+971 00 000 0000"
                                                className="w-full bg-[#FDFCFB] border border-primary/10 rounded-2xl px-6 py-4 text-[0.95rem] font-medium text-[#41362F] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] uppercase tracking-widest font-extrabold text-[#A89B8E] ml-4">Subject</label>
                                            <input
                                                type="text"
                                                placeholder="Bespoke Safari Inquiry"
                                                className="w-full bg-[#FDFCFB] border border-primary/10 rounded-2xl px-6 py-4 text-[0.95rem] font-medium text-[#41362F] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] uppercase tracking-widest font-extrabold text-[#A89B8E] ml-4">Your message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="How can we help you design your perfect adventure?"
                                            className="w-full bg-[#FDFCFB] border border-primary/10 rounded-2xl px-6 py-4 text-[0.95rem] font-medium text-[#41362F] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        disabled={formStatus === "submitting"}
                                        type="submit"
                                        className="w-full btn btn-primary py-5 rounded-2xl text-[0.9rem] font-bold uppercase tracking-widest flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group transition-all active:scale-[0.98]"
                                    >
                                        {formStatus === "submitting" ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                            </>
                                        )}
                                    </button>

                                    {formStatus === "error" && (
                                        <p className="text-center text-red-500 text-[0.8rem] font-bold mt-4">
                                            There was an error sending your message. Please try again.
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
