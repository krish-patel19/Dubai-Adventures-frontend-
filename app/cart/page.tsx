"use client";

import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { calculateActivityTotal } from "@/app/lib/pricing";
import { Trash2, ShoppingCart, ArrowRight, Users, Calendar, Bus, Car, Crown, Plus, Minus, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Price from "@/app/components/Price";
import Link from "next/link";
import { useEffect } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, formatDubaiDate, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setIsCartOpen(false); // Ensure drawer is closed if they navigated here manually while it was open
  }, [setIsCartOpen]);

  const cartTotal = cart.reduce((total, item) => {
    const breakdown = calculateActivityTotal(item.activity, {
      date: item.date,
      adults: item.adults,
      children: item.children,
      transportationTier: item.transportationTier
    });
    return total + breakdown.total;
  }, 0);

  const handleCheckoutAll = () => {
    const bundleData = {
      id: "bundle_" + Date.now(),
      title: "Custom Premium Bundle",
      subtitle: "Your Curated Experience Collection",
      image: cart[0]?.activity.image || "",
      originalPrice: cartTotal * 1.1,
      price: cartTotal, 
      items: cart.map(item => item.activity)
    };
    localStorage.setItem("pending_bundle", JSON.stringify(bundleData));
    clearCart();
    router.push("/book/bundle");
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#e5c07b]/30 pb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#a89b8e] hover:text-[#c28639] transition-colors mb-4">
              <ChevronLeft size={14} /> Continue Exploring
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-[#1a1612] tracking-tighter">Your Cart</h1>
            <p className="text-sm font-bold text-[#c28639] uppercase tracking-[0.2em] mt-2">{cart.length} Experiences Selected</p>
          </div>
          {cart.length > 0 && (
            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#a89b8e] mb-1">Subtotal</p>
              <div className="text-3xl font-black gold-text italic-font tracking-tighter">
                <Price amount={cartTotal} />
              </div>
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-[40px] border border-[#e5c07b]/20 shadow-sm">
            <div className="w-24 h-24 mb-6 rounded-full bg-[#e5c07b]/10 flex items-center justify-center">
              <ShoppingCart size={40} className="text-[#c28639]" />
            </div>
            <h2 className="text-2xl font-black text-[#1a1612] tracking-tight mb-2">Your cart is empty</h2>
            <p className="text-[#a89b8e] max-w-sm mx-auto mb-8">Ready to embark on an unforgettable journey across Dubai? Start exploring elite experiences.</p>
            <Link href="/" className="btn btn-primary px-8 py-4">Explore Experiences</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => {
                const breakdown = calculateActivityTotal(item.activity, {
                  date: item.date,
                  adults: item.adults,
                  children: item.children,
                  transportationTier: item.transportationTier
                });

                return (
                  <div key={item.id} className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#e5c07b]/30 shadow-sm relative group overflow-hidden flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-6 right-6 text-[#a89b8e] hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-colors z-10"
                      title="Remove experience"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="w-full sm:w-40 h-48 sm:h-auto rounded-2xl overflow-hidden relative shrink-0">
                      <Image 
                        src={item.activity.image || "https://placeholder.com/150"} 
                        alt={item.activity.title} 
                        fill 
                        className="object-cover"

                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col pb-2">
                      <div className="pr-12">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c28639] mb-2">
                          {item.activity.category}
                        </p>
                        <h3 className="text-xl font-bold text-[#1a1612] leading-tight mb-4">
                          {item.activity.title}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-[#645c55] text-xs font-semibold mb-6">
                        {item.date ? (
                          <div className="flex items-center gap-2 bg-[#fdfaf5] px-3 py-1.5 rounded-lg border border-[#e5c07b]/20">
                            <Calendar size={14} className="text-[#c28639]" />
                            {formatDubaiDate(item.date)} {item.timeSlot && `• ${item.timeSlot}`}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-[#fdfaf5]/50 px-3 py-1.5 rounded-lg border border-[#e5c07b]/20 text-[#a89b8e]">
                            <Calendar size={14} className="opacity-50" />
                            Open Date
                          </div>
                        )}
                        {item.transportationTier && (
                          <div className="flex items-center gap-2 bg-[#fdfaf5] px-3 py-1.5 rounded-lg border border-[#e5c07b]/20">
                            {item.transportationTier.type === "Shared" ? <Bus size={14} className="text-[#c28639]" /> : item.transportationTier.type === "Private" ? <Car size={14} className="text-[#c28639]" /> : <Crown size={14} className="text-[#c28639]" />}
                            {item.transportationTier.label}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-[#e5c07b]/10 pt-6">
                        {/* Guests Configuration */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[#a89b8e]">
                            <Users size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Guest Details</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-[#a89b8e]">ADULT</span>
                              <div className="flex items-center bg-[#fdfaf5] border border-[#e5c07b]/30 rounded-xl overflow-hidden p-0.5">
                                <button onClick={() => updateQuantity(item.id, item.adults - 1, item.children)} className="w-7 h-7 flex items-center justify-center text-[#c28639] hover:bg-[#c28639]/10 rounded-lg"><Minus size={12} /></button>
                                <span className="text-sm font-black w-6 text-center text-[#1a1612] bg-white rounded-[6px] h-[28px] leading-[28px] shadow-sm">{item.adults}</span>
                                <button onClick={() => updateQuantity(item.id, item.adults + 1, item.children)} className="w-7 h-7 flex items-center justify-center text-[#c28639] hover:bg-[#c28639]/10 rounded-lg"><Plus size={12} /></button>
                              </div>
                            </div>
                            
                            {((item.activity as any).priceBase?.child || item.children > 0) && (
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[#a89b8e]">CHILD</span>
                                <div className="flex items-center bg-[#fdfaf5] border border-[#e5c07b]/30 rounded-xl overflow-hidden p-0.5">
                                  <button onClick={() => updateQuantity(item.id, item.adults, Math.max(0, item.children - 1))} className="w-7 h-7 flex items-center justify-center text-[#c28639] hover:bg-[#c28639]/10 rounded-lg"><Minus size={12} /></button>
                                  <span className="text-sm font-black w-6 text-center text-[#1a1612] bg-white rounded-[6px] h-[28px] leading-[28px] shadow-sm">{item.children}</span>
                                  <button onClick={() => updateQuantity(item.id, item.adults, item.children + 1)} className="w-7 h-7 flex items-center justify-center text-[#c28639] hover:bg-[#c28639]/10 rounded-lg"><Plus size={12} /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black text-[#a89b8e] uppercase tracking-widest mb-1">Item Total</p>
                          <div className="text-xl font-black text-[#1a1612]">
                            <Price amount={breakdown.total} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Order Summary Layout */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 p-8 bg-white border border-[#e5c07b]/30 rounded-[32px] shadow-xl shadow-black/5">
                <h3 className="text-lg font-black text-[#1a1612] uppercase tracking-[0.1em] mb-6 border-b border-[#e5c07b]/20 pb-4">Order Summary</h3>
                
                <div className="space-y-4 text-sm font-medium text-[#645c55] mb-8">
                  <div className="flex justify-between items-center">
                    <span>Original Value</span>
                    <Price amount={cartTotal * 1.1} strike />
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Bundle Savings</span>
                    <span>-<Price amount={cartTotal * 0.1} /></span>
                  </div>
                  <div className="flex justify-between items-center text-[#1a1612] font-black pt-4 border-t border-dashed border-[#e5c07b]/30 mt-4 text-xl">
                    <span>Total Cost</span>
                    <span className="gold-text italic-font tracking-tighter text-2xl"><Price amount={cartTotal} /></span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutAll}
                  className="w-full relative flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-transform hover:-translate-y-1 group overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #e5c07b 0%, #c28639 100%)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  Proceed to Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 pt-6 border-t border-[#e5c07b]/10 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-bold text-[#a89b8e] uppercase tracking-[0.2em]">Verified Secure System</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ className, ...props }: any) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
