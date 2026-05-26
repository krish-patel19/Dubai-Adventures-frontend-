import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import LazyGeminiAI from "./components/LazyGeminiAI";
import { LanguageProvider } from "./context/LanguageContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "Dubai Outdoor Adventures | Premium Desert Experiences",
  description: "Book the best desert safari and outdoor experiences in Dubai. ATV rides, dune bashing, balloon rides, luxury yacht cruises and more.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="platinum-mesh min-h-screen selection:bg-[#bb8c4b]/20 selection:text-[#b45309]">
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <CartProvider>
                <div className="relative z-10">
                  {children}
                </div>
                <LazyGeminiAI />
              </CartProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
