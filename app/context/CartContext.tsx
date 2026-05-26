"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Activity, TransportTier } from "../types";

export interface CartItem {
  id: string; // generated unique id
  activity: Activity;
  date: Date | null;
  timeSlot?: string;
  adults: number;
  children: number;
  transportationTier: TransportTier | null;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "id">, e?: React.MouseEvent) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, adults: number, children: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  formatDubaiDate: (date: Date) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get a unique storage key based on user session
  const getCartKey = () => {
    if (status === "authenticated" && session?.user?.email) {
      // Use email or user id as a unique identifier for the cart key
      return `dubai_cart_${session.user.email}`;
    }
    return "dubai_cart_guest";
  };

  const cartKey = getCartKey();

  // Load cart whenever the cartKey changes (e.g., login/logout)
  useEffect(() => {
    // We only want to load if the session is either authenticated or unauthenticated (not loading)
    if (status === "loading") return;

    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = parsed.map((item: any) => ({
          ...item,
          date: item.date ? new Date(item.date) : null
        }));
        setCart(hydrated);
      } catch (e) {
        console.error("Failed to parse cart", e);
        setCart([]);
      }
    } else {
      setCart([]);
    }
    setIsLoaded(true);
  }, [cartKey, status]);

  // Save cart whenever it changes or when the key changes
  useEffect(() => {
    if (isLoaded && status !== "loading") {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, cartKey, isLoaded, status]);

  // Dubai Timezone Date Formatter (UTC +4)
  const formatDubaiDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-AE", {
      timeZone: "Asia/Dubai",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  const addToCart = (newItem: Omit<CartItem, "id">, e?: React.MouseEvent) => {
    // 1. Fly to Cart Animation
    if (e && typeof document !== "undefined") {
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const target = document.getElementById("nav-cart-icon");
      
      if (target) {
        const destRect = target.getBoundingClientRect();
        
        const flyer = document.createElement("div");
        flyer.style.position = "fixed";
        flyer.style.left = `${rect.left}px`;
        flyer.style.top = `${rect.top}px`;
        flyer.style.width = `${Math.max(rect.width, 40)}px`;
        flyer.style.height = `${Math.max(rect.height, 40)}px`;
        flyer.style.backgroundColor = "#c28639"; // Luxury Gold
        flyer.style.borderRadius = "30px";
        flyer.style.opacity = "0.8";
        flyer.style.zIndex = "9999";
        flyer.style.pointerEvents = "none";
        flyer.style.boxShadow = "0 10px 30px rgba(194, 134, 57, 0.4)";
        flyer.style.transition = "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
        
        document.body.appendChild(flyer);

        // trigger repaint
        flyer.getBoundingClientRect();

        setTimeout(() => {
          flyer.style.left = `${destRect.left + destRect.width / 2 - 10}px`;
          flyer.style.top = `${destRect.top + destRect.height / 2 - 10}px`;
          flyer.style.width = "20px";
          flyer.style.height = "20px";
          flyer.style.opacity = "0";
          flyer.style.transform = "scale(0.2) rotate(45deg)";
        }, 10);
        
        setTimeout(() => {
          flyer.remove();
        }, 650);
      }
    }

    // 2. Logic and Validation
    setCart(prev => {
      // Validation: Same Date, Time, Transport means it's a duplicate, we should merge quantities
      // If none, we add a new line item.
      const existingIndex = prev.findIndex(item => {
        return (item.activity.id || (item.activity as any)._id) === (newItem.activity.id || (newItem.activity as any)._id);
      });

      if (existingIndex >= 0) {
        const updated = [...prev];
        // If it's already in the cart, we just update it with the new configuration but keep id and adults/children if they are adding the exact same. 
        // Or if they explicitly clicked Add To Cart with a new config, override it.
        updated[existingIndex] = {
          ...updated[existingIndex],
          date: newItem.date || updated[existingIndex].date,
          timeSlot: newItem.timeSlot || updated[existingIndex].timeSlot,
          transportationTier: newItem.transportationTier || updated[existingIndex].transportationTier,
          adults: newItem.adults,
          children: newItem.children
        };
        return updated;
      }

      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      return [...prev, { ...newItem, id }];
    });
    
    // Automatically open drawer if user clicks without event or specific criteria...
    // But since they want an "Added" button state with increments inline, we won't force open the drawer!
    // setIsCartOpen(true); 
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, adults: number, children: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, adults: Math.max(1, adults), children: Math.max(0, children) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.length; // Count the number of unique items

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      formatDubaiDate
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
