"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "AED" | "USD" | "EUR" | "GBP" | "INR";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (curr: Currency) => void;
    rates: Record<string, number>;
    convert: (amount: number) => number;
    symbol: string;
    formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    AED: "AED",
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("AED");
    const [rates, setRates] = useState<Record<string, number>>({
        AED: 1,
        USD: 0.27,
        EUR: 0.25,
        GBP: 0.21,
        INR: 22.5,
    });

    useEffect(() => {
        // Load preference
        const saved = localStorage.getItem("preferred-currency") as Currency;
        if (saved && ["AED", "USD", "EUR", "GBP", "INR"].includes(saved)) {
            setCurrencyState(saved);
        }

        // Fetch live rates
        const fetchRates = async () => {
            try {
                const res = await fetch("https://open.er-api.com/v6/latest/AED");
                const data = await res.json();
                if (data && data.rates) {
                    setRates({
                        AED: 1,
                        USD: data.rates.USD || 0.27,
                        EUR: data.rates.EUR || 0.25,
                        GBP: data.rates.GBP || 0.21,
                        INR: data.rates.INR || 22.5,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch exchange rates:", err);
            }
        };

        fetchRates();
        
        // Refresh rates every 1 hour
        const interval = setInterval(fetchRates, 3600000);
        return () => clearInterval(interval);
    }, []);

    const setCurrency = (curr: Currency) => {
        setCurrencyState(curr);
        localStorage.setItem("preferred-currency", curr);
    };

    const convert = (amount: number) => {
        const rate = rates[currency] || 1;
        return amount * rate;
    };

    const symbol = CURRENCY_SYMBOLS[currency];

    const formatPrice = (amount: number) => {
        const convertedAmount = convert(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'narrowSymbol'
        }).format(convertedAmount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, symbol, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
    return context;
}
