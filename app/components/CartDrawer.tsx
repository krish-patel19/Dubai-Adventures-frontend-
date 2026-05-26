"use client";

import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { calculateActivityTotal } from "../lib/pricing";
import { X, Trash2, ShoppingBag, ArrowRight, Users, Calendar, Bus, Car, Crown, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Price from "./Price";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, clearCart, formatDubaiDate } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  if (!isCartOpen) return null;

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
    // Transform Cart data to pending_bundle checkout flow
    const bundleData = {
      id: "bundle_" + Date.now(),
      title: "Custom Premium Bundle",
      subtitle: "Your Curated Experience Collection",
      image: cart[0]?.activity.image || "",
      originalPrice: cartTotal * 1.1, // Show 10% value savings explicitly
      price: cartTotal, 
      items: cart.map(item => item.activity)
    };
    
    localStorage.setItem("pending_bundle", JSON.stringify(bundleData));
    setIsCartOpen(false);
    clearCart(); // Empties cart upon transitioning to gateway
    router.push("/book/bundle");
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 cursor-pointer"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md h-full bg-[#fdfaf5] shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5c07b]/30 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e5c07b]/20 to-[#c28639]/10 text-[#c28639] flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1a1612] tracking-tight">Your Cart</h2>
              <p className="text-[10px] uppercase font-bold text-[#a89b8e] tracking-widest">{cart.length} Experiences</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-[#645c55] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-24 h-24 mb-6 rounded-full bg-[#e5c07b]/10 flex items-center justify-center">
                <ShoppingBag size={40} className="text-[#c28639]" />
              </div>
              <p className="text-xl font-bold text-[#1a1612] mb-2">Your cart is empty</p>
              <p className="text-sm text-[#a89b8e] max-w-[250px]">Embark on unforgettable journeys across Dubai.</p>
            </div>
          ) : (
            cart.map((item) => {
              const breakdown = calculateActivityTotal(item.activity, {
                date: item.date,
                adults: item.adults,
                children: item.children,
                transportationTier: item.transportationTier
              });

              return (
                <div key={item.id} className="p-4 rounded-3xl bg-white border border-[#e5c07b]/30 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e5c07b]/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-4 right-4 text-red-400/50 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors z-10"
                    title="Remove experience"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden relative shrink-0">
                      <Image 
                        src={item.activity.image || "https://placeholder.com/150"} 
                        alt={item.activity.title} 
                        fill 
                        className="object-cover"

                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#c28639] mb-1 truncate">
                        {item.activity.category}
                      </p>
                      <h3 className="font-bold text-[#1a1612] leading-tight text-sm line-clamp-2">
                        {item.activity.title}
                      </h3>
                      
                      <div className="mt-2 text-[#645c55] text-[11px] font-medium space-y-1">
                        {item.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#c28639]/70" />
                            {formatDubaiDate(item.date)} {item.timeSlot && `• ${item.timeSlot}`}
                          </div>
                        )}
                        {item.transportationTier && (
                          <div className="flex items-center gap-1.5">
                            {item.transportationTier.type === "Shared" ? <Bus size={12} className="text-[#c28639]/70" /> : item.transportationTier.type === "Private" ? <Car size={12} className="text-[#c28639]/70" /> : <Crown size={12} className="text-[#c28639]/70" />}
                            <span className="text-[#a89b8e]">{item.transportationTier.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-3 border-t border-black/5">
                    {/* PAX Modifiers */}
                    <div className="flex justify-between items-center bg-[#fdfaf5] p-2 px-3 rounded-xl border border-[#e5c07b]/20">
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-[#a89b8e]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#645c55]">Guests</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-[#a89b8e] w-8">ADULTS</span>
                          <button onClick={() => updateQuantity(item.id, item.adults - 1, item.children)} className="w-5 h-5 flex items-center justify-center rounded-md border border-[#e5c07b]/40 text-[#c28639] hover:bg-[#c28639]/10"><Minus size={10} /></button>
                          <span className="text-xs font-bold w-3 text-center text-[#1a1612]">{item.adults}</span>
                          <button onClick={() => updateQuantity(item.id, item.adults + 1, item.children)} className="w-5 h-5 flex items-center justify-center rounded-md border border-[#e5c07b]/40 text-[#c28639] hover:bg-[#c28639]/10"><Plus size={10} /></button>
                        </div>
                        
                        {((item.activity as any).priceBase?.child || item.children > 0) && (
                          <div className="flex items-center gap-2 opacity-80">
                            <span className="text-[9px] font-black text-[#a89b8e] w-8">CHILD</span>
                            <button onClick={() => updateQuantity(item.id, item.adults, Math.max(0, item.children - 1))} className="w-5 h-5 flex items-center justify-center rounded-md border border-[#e5c07b]/40 text-[#c28639] hover:bg-[#c28639]/10"><Minus size={10} /></button>
                            <span className="text-xs font-bold w-3 text-center text-[#1a1612]">{item.children}</span>
                            <button onClick={() => updateQuantity(item.id, item.adults, item.children + 1)} className="w-5 h-5 flex items-center justify-center rounded-md border border-[#e5c07b]/40 text-[#c28639] hover:bg-[#c28639]/10"><Plus size={10} /></button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-[#a89b8e] tracking-widest">Pricing</span>
                      <span className="font-black text-lg text-[#1a1612]">
                        <Price amount={breakdown.total} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Global Footer CTA */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#e5c07b]/30 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[11px] font-black text-[#a89b8e] uppercase tracking-[0.2em]">Calculated Total</span>
              <span className="text-3xl font-black gold-text italic-font tracking-tighter">
                <Price amount={cartTotal} className="text-3xl" />
              </span>
            </div>
            
            <button
              onClick={handleCheckoutAll}
              className="w-full relative flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-transform active:scale-95 group overflow-hidden"
              style={{ background: "linear-gradient(135deg, #e5c07b 0%, #c28639 100%)" }}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Checkout Experience <ArrowRight size={16} />
            </button>
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.25em] text-[#a89b8e] mt-4 opacity-60">
              Verified Encrypted Transaction
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
