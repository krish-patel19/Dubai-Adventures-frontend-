"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, MessageCircle, Twitter, Linkedin } from "lucide-react";
import { normalizeSiteConfig, normalizeCategoryId } from "@/lib/site-config";
import { SiteConfig } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { cn } from "@/lib/utils";

type LegalKey = keyof SiteConfig["legal"];

const SOCIAL_META: Array<{
  key: keyof SiteConfig["social"];
  label: string;
  icon: React.ReactNode;
}> = [
    { key: "facebook", label: "Facebook", icon: <Facebook size={18} /> },
    { key: "linkedin", label: "Linkedin", icon: <Linkedin size={18} /> },
    { key: "twitter", label: "Twitter", icon: <Twitter size={18} /> },
    { key: "instagram", label: "Instagram", icon: <Instagram size={18} /> },
    { key: "youtube", label: "YouTube", icon: <Youtube size={18} /> },
  ];

const LEGAL_META = [
  { key: "privacyPolicy", label: "Privacy Policy", href: "/privacy-policy" },
  { key: "termsOfService", label: "Terms of Service", href: "/terms-of-service" },
  { key: "refundPolicy", label: "Refund Policy", href: "/refund-policy" },
];

function getCompanyHref(label: string) {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("journal") || normalized.includes("blog")) return "/travel-journal";
  if (normalized.includes("review")) return "/reviews";
  if (normalized.includes("about")) return "/about";
  if (normalized.includes("contact")) return "/contacts";
  if (normalized.includes("gallery")) return "/gallery";
  return "#contact";
}

export default function Footer({ initialSiteConfig }: { initialSiteConfig?: any }) {
  const [siteName, setSiteName] = useState("Dubai Adventures");
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [experiences, setExperiences] = useState<string[]>([]);
  const [company, setCompany] = useState<string[]>([]);
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const { t, isRTL } = useLanguage();
  const [socialLinks, setSocialLinks] = useState<SiteConfig["social"]>({
    instagram: "",
    facebook: "",
    youtube: "",
    whatsapp: "",
    twitter: "",
    linkedin: "",
  });
  const [legal, setLegal] = useState<SiteConfig["legal"]>({
    privacyPolicy: "",
    termsOfService: "",
    refundPolicy: "",
  });

  useEffect(() => {
    const handleData = (data: any) => {
      const normalized = normalizeSiteConfig(data);
      if (normalized.footerExperiences.length) setExperiences(normalized.footerExperiences);
      if (normalized.footerCompany.length) setCompany(normalized.footerCompany);
      setSiteName(normalized.general.siteName || "Dubai Adventures");
      setSiteLogoUrl(normalized.general.siteLogoUrl || "");
      setContactAddress(normalized.general.contactAddress || "");
      setContactPhone(normalized.general.contactPhone || "");
      setContactEmail(normalized.general.contactEmail || "");
      setSocialLinks(normalized.social);
      setLegal(normalized.legal);
    };

    if (initialSiteConfig) {
      handleData(initialSiteConfig);
      return;
    }

    fetch("/api/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        handleData(data);
      })
      .catch(console.error);
  }, [initialSiteConfig]);

  const handleCategoryClick = (item: string) => {
    const categoryId = normalizeCategoryId(item);
    localStorage.setItem("activeCategory", categoryId);
    window.dispatchEvent(new CustomEvent("categoryFilterChanged", { detail: categoryId }));
  };

  const socialItems = SOCIAL_META.filter((item) => socialLinks[item.key]);

  const defaultExperiences = ["Desert Safari", "ATV & Quad Biking", "Hot Air Balloon", "Luxury Yacht", "Sandboarding", "Buggy Tours"];
  const defaultCompany = ["About Us", "Reviews", "Gallery", "Travel Journal"];

  return (
    <footer id="contact" className="bg-background-light relative border-t border-border-light text-text-muted-dark overflow-hidden">
      {/* Solid background constraint to match Home Page Theme Color consistently across all pages */}
      <div className="absolute inset-0 bg-secondary/5 pointer-events-none" />

      {/* Premium Divider */}
      <div className="relative z-10 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* BRAND & DESCRIPTION */}
          <div className="space-y-8">
            <div className="flex items-center gap-2.5">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={siteName}
                  className="w-8 h-8 object-contain rounded-md"
                />
              ) : (
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="#c28639" strokeWidth="1.4" fill="none" />
                  <circle cx="16" cy="16" r="2.5" fill="#c28639" />
                </svg>
              )}
              <span className="fd text-lg text-text-dark">
                <span className="font-bold">{siteName.split(" ")[0]}</span> <em className="gold-text not-italic">{siteName.split(" ").slice(1).join(" ")}</em>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              {t("desc", "footer")}
            </p>
            {socialItems.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialItems.map((s) => (
                  <a
                    key={s.label}
                    href={socialLinks[s.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-2xl border border-border-light flex items-center justify-center transition-all duration-300 bg-white/5 hover:border-primary hover:text-primary hover:scale-105"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* EXPERIENCES */}
          <div>
            <h4 className="text-primary text-xs tracking-widest uppercase font-bold mb-8">{t("experiences", "footer")}</h4>
            <ul className="space-y-4">
              {(experiences.length ? experiences : defaultExperiences).map((item) => (
                <li key={item}>
                  <Link
                    href="/#activities"
                    onClick={() => handleCategoryClick(item)}
                    className="text-sm hover:text-text-dark transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-primary text-xs tracking-widest uppercase font-bold mb-8">{t("company", "footer")}</h4>
            <ul className="space-y-4">
              {(company.length ? company : defaultCompany).map((item) => (
                <li key={item}>
                  <Link href={getCompanyHref(item)} className="text-sm hover:text-text-dark transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-primary text-xs tracking-widest uppercase font-bold mb-8">{t("contactUs", "footer")}</h4>
            <div className="space-y-6">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactAddress || "Downtown Dubai, UAE")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-sm leading-relaxed hover:text-primary transition-colors group"
              >
                <MapPin size={16} className="text-primary shrink-0 mt-1" />
                <span>{contactAddress || "Downtown Dubai, UAE"}</span>
              </a>
              <a
                href={`tel:${(contactPhone || "+971501234567").replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-sm cursor-pointer group hover:text-primary transition-colors"
              >
                <Phone size={16} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span>{contactPhone || "+971 50 123 4567"}</span>
              </a>
              <a
                href={`mailto:${contactEmail || "bookings@dubaiadventures.com"}`}
                className="flex items-center gap-3 text-sm cursor-pointer group hover:text-primary transition-colors"
              >
                <Mail size={16} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{contactEmail || "bookings@dubaiadventures.com"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <p className="text-xs">
            © {new Date().getFullYear()} {siteName}. {t("rights", "footer")}
          </p>

          <div className="flex gap-6">
            {LEGAL_META.map((item) => {
              const hasContent = item.key in legal && (legal as any)[item.key];

              if (!hasContent) return null;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-[11px] font-medium text-text-muted-dark/60 hover:text-primary transition-all duration-300"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
