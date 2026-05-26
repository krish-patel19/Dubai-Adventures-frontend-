import { Activity, PricingRule } from "../types";
import { format } from "date-fns";

export interface PriceBreakdown {
  basePrice: number;
  guestTotal: number;
  surcharges: number;
  transportationFee: number;
  total: number;
  discountPercentage: number;
  isWeekend: boolean;
}

export const calculateActivityTotal = (
  activity: Activity,
  options: {
    date: Date | null;
    adults: number;
    children: number;
    transportationTier?: any | null; // TransportTier type not imported here to avoid circularity if any
  }
): PriceBreakdown => {
  const { date, adults, children, transportationTier } = options;

  // 1. Determine Base Rate (Handle Date Overrides)
  // ... (lines 24-33 stay same)
  let baseRate = activity.price;
  if (date && activity.dateOverrides) {
    const dateStr = format(date, "yyyy-MM-dd");
    const override = activity.dateOverrides.find(o => o.date === dateStr);
    if (override) baseRate = override.price;
  }

  // 2. Guest Calculation (Use specific childPrice if available)
  const childRate = activity.childPrice ?? (baseRate * 0.5);
  const guestTotal = (baseRate * adults) + (childRate * children);

  // 3. Surcharges (Pricing Rules)
  let surcharges = 0;
  let isWeekend = false;
  if (date) {
    const day = date.getDay();
    // Modern UAE weekend is Sat/Sun, but Fri is often included in hospitality surcharges
    isWeekend = day === 0 || day === 5 || day === 6; 

    if (activity.pricingRules) {
      activity.pricingRules.forEach(rule => {
        if (!rule.isActive) return;

        let applies = false;
        if (rule.conditionType === "Weekend" && isWeekend) applies = true;
        // Add DateRange or other conditions here if needed

        if (applies) {
          if (rule.adjustmentType === "Percentage") {
            surcharges += guestTotal * (rule.value / 100);
          } else {
            surcharges += rule.value;
          }
        }
      });
    }
  }

  // 4. Transportation Fee
  let transportationFee = 0;
  if (transportationTier) {
    if (transportationTier.type === "Shared") {
      transportationFee = (transportationTier.basePrice || 0) * (adults + children);
    } else {
      transportationFee = (transportationTier.basePrice || 0);
    }
  }

  const total = guestTotal + surcharges + transportationFee;

  // 5. Discount calculation (from original price)
  const discountPercentage = activity.originalPrice 
    ? Math.round(((activity.originalPrice - activity.price) / activity.originalPrice) * 100)
    : 0;

  return {
    basePrice: baseRate,
    guestTotal,
    surcharges,
    transportationFee,
    total,
    discountPercentage,
    isWeekend
  };
};
