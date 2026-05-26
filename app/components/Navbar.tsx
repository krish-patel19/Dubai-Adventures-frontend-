"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Compass, User, ShoppingCart, Globe, ChevronDown, Sparkles, Search } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency, CURRENCY_SYMBOLS } from "../context/CurrencyContext";
import dynamic from "next/dynamic";
import { useCart } from "../context/CartContext";

// ─── Lazy-load GlobalSearch (976 lines, portal-based overlay) ───
const GlobalSearch = dynamic(() => import("./GlobalSearch"), { ssr: false });

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
] as const;

const CURRENCY_OPTIONS = [
  { code: "AED", label: "UAE Dirham" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "INR", label: "Indian Rupee" },
] as const;

interface NavbarProps {
  hasBooking: boolean;
  onCartClick: () => void;
  onAuthClick: (mode: "login" | "signup") => void;
  initialSiteConfig?: any;
}

export default function Navbar({ hasBooking, onCartClick, onAuthClick, initialSiteConfig }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, symbol } = useCurrency();
  const [siteName, setSiteName] = useState("Dubai Adventures");
  const [siteLogoUrl, setSiteLogoUrl] = useState("");

  const primaryLinks = [
    { label: t("reviews"), href: "/reviews" },
    { label: t("gallery"), href: "/gallery" },
    { label: t("about"), href: pathname === "/about" ? "#about" : "/about" },
    { label: t("contact"), href: "/contacts" },
  ];

  const aiLink = { label: t("aiPlanner"), href: "/planner", icon: <Sparkles size={12} className="text-primary" />, authRequired: false };
  const bookingsLink = { label: t("myBookings"), href: "/bookings", authRequired: true, icon: <Compass size={13} className="text-primary" /> };

  const mobileLinks = [
    ...primaryLinks.map(l => ({ ...l, authRequired: false, icon: <Compass size={13} className="text-primary" /> })),
    aiLink,
    bookingsLink
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch site config for dynamic branding
  useEffect(() => {
    if (initialSiteConfig) {
      if (initialSiteConfig.general?.siteName) setSiteName(initialSiteConfig.general.siteName);
      if (initialSiteConfig.general?.siteLogoUrl) setSiteLogoUrl(initialSiteConfig.general.siteLogoUrl);
      return;
    }

    fetch("/api/config", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data?.general?.siteName) setSiteName(data.general.siteName);
        if (data?.general?.siteLogoUrl) setSiteLogoUrl(data.general.siteLogoUrl);
      })
      .catch(() => { });
  }, [initialSiteConfig]);

  const navClass = cn(
    "fixed top-0 inset-x-0 z-50 transition-all duration-500",
    scrolled ? "bg-background-light/80 backdrop-blur-lg border-b border-border-light" : "bg-transparent"
  );

  const textColor = scrolled ? "text-text-dark" : "text-text-light";
  const mutedTextColor = scrolled ? "text-text-muted-dark" : "text-text-muted-light";

  // Split siteName for bold first word + gold rest
  const siteNameFirst = siteName.split(" ")[0];
  const siteNameRest = siteName.split(" ").slice(1).join(" ");

  return (
    <nav className={navClass}>
      <div className="w-full px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 -ml-2 sm:-ml-4">
            <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={siteName}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                  <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="url(#lg1n)" strokeWidth="1.2" fill="none" />
                  <polygon points="16,8 24,12 24,20 16,24 8,20 8,12" fill="url(#lg2n)" opacity="0.1" />
                  <circle cx="16" cy="16" r="3.5" fill="url(#lg1n)" />
                  <defs>
                    <linearGradient id="lg1n" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="var(--color-primary-dark)" /><stop offset="0.45" stopColor="var(--color-primary-light)" /><stop offset="1" stopColor="var(--color-primary-dark)" />
                    </linearGradient>
                    <linearGradient id="lg2n" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="var(--color-primary)" /><stop offset="1" stopColor="var(--color-primary-dark)" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
            <span className={cn(
              "fd text-xl sm:text-[1.85rem] tracking-tight transition-all duration-500",
              textColor
            )}>
              <span className="font-bold">{siteNameFirst}</span> <em className="gold-text not-italic font-semibold tracking-tighter">{siteNameRest}</em>
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden xl:flex items-center gap-4 lg:gap-6">
            {primaryLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={cn("relative text-[0.75rem] tracking-[0.15em] uppercase font-bold group transition-colors", mutedTextColor)}>
                  <span className="transition-colors duration-250 hover:text-primary">{link.label}</span>
                </Link>
              </li>
            ))}

            {/* AI Planner Link - Distinct Style */}
            <li>
              <Link href={aiLink.href} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-[0.75rem] tracking-[0.15em] uppercase font-black text-primary hover:bg-primary/10 transition-all">
                {aiLink.icon}
                {aiLink.label}
              </Link>
            </li>
          </ul>

          {/* Grouped Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Dynamic Full Page Cart Destination Anchor */}
            <button
              id="nav-cart-icon"
              onClick={() => router.push('/cart')}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition-all duration-300 shadow-sm",
                scrolled
                  ? "bg-secondary/5 border-border-light text-text-dark hover:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-2 focus:ring-white/40"
              )}
              aria-label="View Luxury Cart"
            >
              <ShoppingCart size={16} className={cn("sm:w-5 sm:h-5", scrolled ? "opacity-70" : "opacity-90")} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#c28639] text-[9px] sm:text-[10px] font-black text-white shadow-md animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Search Button (Mobile & Desktop) */}
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition-all duration-300 shadow-sm",
                scrolled
                  ? "bg-secondary/5 border-border-light text-text-dark hover:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-2 focus:ring-white/40"
              )}
              aria-label="Search experiences"
            >
              <Search size={16} className={cn("sm:w-5 sm:h-5", scrolled ? "opacity-70" : "opacity-90")} />
            </button>

            {/* Desktop-only Language & Auth */}
            <div className="hidden lg:flex items-center gap-3 sm:gap-4">
              {/* Language Switcher */}
              <div className="relative group">
                <button className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 uppercase text-[10px] font-black tracking-widest",
                  scrolled
                    ? "bg-secondary/5 border-border-light text-text-dark hover:border-primary/40"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                )}>
                  <Globe size={14} className="opacity-70" />
                  {language}
                  <ChevronDown size={12} className="opacity-40 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl shadow-2xl border border-border-light overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60]">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-xs font-bold transition-all hover:bg-primary/10",
                        language === lang.code ? "text-primary bg-primary/5" : "text-text-dark"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Switcher */}
              <div className="relative group">
                <button className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 uppercase text-[10px] font-black tracking-widest",
                  scrolled
                    ? "bg-secondary/5 border-border-light text-text-dark hover:border-primary/40"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                )}>
                  {symbol !== currency && <span className="opacity-70">{symbol}</span>}
                  {currency}
                  <ChevronDown size={12} className="opacity-40 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-border-light overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60]">
                  {CURRENCY_OPTIONS.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-xs font-bold transition-all hover:bg-primary/10",
                        currency === curr.code ? "text-primary bg-primary/5" : "text-text-dark"
                      )}
                    >
                      {curr.code}
                      {CURRENCY_SYMBOLS[curr.code as keyof typeof CURRENCY_SYMBOLS] !== curr.code && (
                        <span className="text-[10px] opacity-40 float-right mt-0.5">
                          {CURRENCY_SYMBOLS[curr.code as keyof typeof CURRENCY_SYMBOLS]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {isLoggedIn ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <button className={cn(
                      "flex items-center gap-2.5 px-1.5 py-1.5 pr-4 rounded-full border transition-all duration-300",
                      scrolled
                        ? "bg-amber-500/5 border-amber-500/20 hover:border-primary/40 shadow-sm"
                        : "bg-white/10 border-white/20 hover:bg-white/20 shadow-lg shadow-black/5"
                    )}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 border border-primary/30 shadow-inner">
                        <User size={16} className="text-primary" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className={cn("text-[11px] font-black tracking-[0.15em] uppercase", textColor)}>
                          {session?.user?.name?.split(" ")[0] || "User"}
                        </span>
                        <span className={cn("text-[9px] font-medium opacity-40 lowercase hidden sm:inline-block", textColor)}>
                          {session?.user?.email?.split('@')[0]}
                        </span>
                      </div>
                      <ChevronDown size={12} className={cn("opacity-30 group-hover:rotate-180 transition-transform duration-300", textColor)} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border-light overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 translate-y-2 group-hover:translate-y-0 z-[60]">
                      {/* Dropdown Header */}
                      <div className="p-5 border-b border-border-light bg-gradient-to-br from-primary/5 to-transparent">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Authenticated Account</p>
                        <h4 className="text-sm font-black text-text-dark uppercase tracking-tight truncate">
                          {session?.user?.name || "Guest User"}
                        </h4>
                        <p className="text-[10px] text-text-muted-dark font-medium truncate opacity-60">
                          {session?.user?.email}
                        </p>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="p-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-text-dark transition-all hover:bg-primary/10 hover:text-primary group/item"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            <User size={16} className="text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span>{t("myProfile")}</span>
                            <span className="text-[9px] font-medium opacity-40 uppercase tracking-widest mt-0.5">Manage identity</span>
                          </div>
                        </Link>
                        <Link
                          href="/bookings"
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-text-dark transition-all hover:bg-primary/10 hover:text-primary group/item"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            <Compass size={16} className="text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span>{t("myBookings")}</span>
                            <span className="text-[9px] font-medium opacity-40 uppercase tracking-widest mt-0.5">History vault</span>
                          </div>
                        </Link>

                        {hasBooking && (
                          <button
                            onClick={onCartClick}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-primary transition-all hover:bg-primary/5 group/item border border-primary/10"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                              <ShoppingCart size={16} className="text-primary" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span>{t("yourBooking")}</span>
                              <span className="text-[9px] font-medium opacity-40 uppercase tracking-widest mt-0.5">Review active cart</span>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 transition-all hover:bg-red-50 group/item"
                        >
                          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover/item:rotate-12 transition-transform">
                            <X size={16} className="text-red-400" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span>{t("logout")}</span>
                            <span className="text-[9px] font-medium opacity-40 uppercase tracking-widest mt-0.5">End your session</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => onAuthClick("login")} className={cn("inline-flex items-center px-4 py-2 text-[0.78rem] font-medium tracking-wide uppercase transition-all duration-350", mutedTextColor)}>
                    {t("login")}
                  </button>
                  <button onClick={() => onAuthClick("signup")} className="btn btn-primary px-4 py-2 text-[0.78rem]">
                    {t("signup")}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className={cn("xl:hidden p-1.5 rounded-lg transition-colors border border-transparent hover:bg-black/5", textColor)}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="xl:hidden px-5 pb-5 pt-2 bg-background-light/95 backdrop-blur-lg shadow-2xl overflow-y-auto max-h-[calc(100vh-72px)]">
          {isLoggedIn && (
            <div className="mb-6 p-4 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider text-text-dark">
                    {session?.user?.name || "Guest User"}
                  </span>
                  <span className="text-[10px] font-medium opacity-60 text-text-muted-dark">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {hasBooking && (
                  <button
                    onClick={() => { onCartClick(); setMenuOpen(false); }}
                    className="w-full py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/5"
                  >
                    <ShoppingCart size={14} />
                    {t("yourBooking")}
                  </button>
                )}
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="w-full py-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          )}

          {mobileLinks.map((link) => {
            if (link.authRequired && !isLoggedIn) return null;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-4 text-[0.78rem] tracking-widest uppercase text-text-muted-dark border-b border-border-light group"
              >
                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  {link.icon || <Compass size={13} className="text-primary" />}
                </div>
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 flex gap-2">
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => { onAuthClick("login"); setMenuOpen(false); }}
                  className="btn btn-ghost flex-1"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => { onAuthClick("signup"); setMenuOpen(false); }}
                  className="btn btn-primary flex-1"
                >
                  {t("signup")}
                </button>
              </>
            )}
          </div>

          {/* Mobile Language Switcher */}
          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted-dark mb-3 px-1">{t("language") || "Language"}</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setMenuOpen(false); }}
                  className={cn(
                    "px-4 py-2.5 text-center text-xs font-bold rounded-xl border transition-all",
                    language === lang.code
                      ? "text-primary border-primary/40 bg-primary/10"
                      : "text-text-dark border-border-light bg-white/50"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Currency Switcher */}
          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted-dark mb-3 px-1">{t("currency") || "Currency"}</p>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCY_OPTIONS.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => { setCurrency(curr.code); setMenuOpen(false); }}
                  className={cn(
                    "px-4 py-3 text-center text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2",
                    currency === curr.code
                      ? "text-primary border-primary/40 bg-primary/10"
                      : "text-text-dark border-border-light bg-white/50"
                  )}
                >
                  {CURRENCY_SYMBOLS[curr.code as keyof typeof CURRENCY_SYMBOLS] !== curr.code && (
                    <span className="opacity-40">{CURRENCY_SYMBOLS[curr.code as keyof typeof CURRENCY_SYMBOLS]}</span>
                  )}
                  {curr.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Search Overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
