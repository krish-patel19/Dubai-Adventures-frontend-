"use client";

import { useCurrency } from "../context/CurrencyContext";
import { cn } from "@/lib/utils";

interface PriceProps {
    amount: number;
    className?: string;
    showSymbol?: boolean;
    precision?: number;
    strike?: boolean;
    strikeColor?: string;
}

export default function Price({ 
    amount, 
    className, 
    showSymbol = true, 
    precision = 2, 
    strike = false,
    strikeColor = "#9a9187"
}: PriceProps) {
    const { currency, convert, symbol } = useCurrency();

    // Always calculate from AED base to prevent double-conversion rounding issues
    const converted = convert(amount);

    // Format options
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: currency === 'AED' ? 0 : 2,
        maximumFractionDigits: currency === 'AED' ? 0 : 2,
    }).format(converted);

    return (
        <span className={cn(
            "inline-flex items-center gap-1", 
            className
        )}>
            {showSymbol && (
                <span className={cn(
                    "font-bold text-[#1a1612]",
                    currency === 'AED' ? "text-[0.75em] uppercase tracking-wide mt-0.5" : "text-[0.9em]",
                    strike && "line-through decoration-[1.5px]"
                )} style={strike ? { color: strikeColor, textDecorationColor: strikeColor } : {}}>
                    {symbol}
                </span>
            )}
            <span className={cn(
                "tabular-nums", 
                strike && "line-through decoration-[1.5px]"
            )} style={strike ? { color: strikeColor, textDecorationColor: strikeColor } : {}}>
                {formatted}
            </span>
        </span>
    );
}
