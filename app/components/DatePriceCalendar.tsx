"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay, addDays, isAfter } from "date-fns";
import { ChevronLeft, ChevronRight, Calculator } from "lucide-react";
import Price from "./Price";
import { cn } from "@/lib/utils";

interface DatePriceCalendarProps {
  activityId: string;
  selected: Date | null;
  onSelect: (d: Date) => void;
  dateOverrides?: { date: string; price: number }[];
  basePrice: number;
  timeSlot?: string;
  totalDays?: number;
  checkAvailability?: boolean;
}

export default function DatePriceCalendar({ activityId, selected, onSelect, dateOverrides = [], basePrice, timeSlot = "09:00 - 11:00", totalDays = 1, checkAvailability = true }: DatePriceCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loadingAv, setLoadingAv] = useState(false);
  const today = startOfDay(new Date());

  useEffect(() => {
    if (!checkAvailability) return;
    const fetchAv = async () => {
      setLoadingAv(true);
      try {
        const monthStr = format(viewDate, "yyyy-MM");
        const res = await fetch(`/api/activities/${activityId}/availability?month=${monthStr}&timeSlot=${timeSlot}`);
        
        if (!res.ok) {
            console.warn(`Availability fetch failed with status ${res.status}`);
            return;
        }
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setAvailability(data);
        } else {
            console.warn("Received non-JSON response for availability");
        }
      } catch (e) {
        console.error("Failed to fetch availability", e);
      } finally {
        setLoadingAv(false);
      }
    };
    fetchAv();
  }, [viewDate, activityId, timeSlot, checkAvailability]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => setViewDate(addMonths(viewDate, 1));
  const prevMonth = () => setViewDate(subMonths(viewDate, 1));

  const getPriceForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const override = dateOverrides.find((o) => o.date === dateStr);
    return override ? override.price : basePrice;
  };

  return (
    <div className="rounded-2xl border border-[#e5c07b]/30 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1612]">
          {format(viewDate, "MMMM yyyy")}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-[#645c55]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-[#645c55]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-[#9a9187] py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isSelected = selected && isSameDay(day, selected);
          const endDate = selected ? addDays(selected, totalDays - 1) : null;
          const isMidRange = selected && endDate && totalDays > 1 && isAfter(day, selected) && isBefore(day, endDate);
          const isEndRange = selected && endDate && totalDays > 1 && isSameDay(day, endDate);
          const inRange = isSelected || isMidRange || isEndRange;

          const isCurrentMonth = isSameMonth(day, monthStart);
          const isPast = isBefore(day, today);
          const price = getPriceForDate(day);
          const isPriceOverride = price !== basePrice;
          const dateStr = format(day, "yyyy-MM-dd");
          const avCount = checkAvailability ? (availability[dateStr] ?? 1) : 1; // Default to 1 if not checking or not loaded yet
          const isSoldOut = avCount === 0;

          return (
            <button
              key={i}
              disabled={isPast || !isCurrentMonth || isSoldOut}
              onClick={() => onSelect(day)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-xl border border-transparent transition-all h-14",
                !isCurrentMonth && "opacity-0 pointer-events-none",
                (isPast || isSoldOut) && "opacity-20 cursor-not-allowed",
                isSelected
                  ? "bg-[#c28639] border-[#c28639] shadow-lg scale-105 z-10"
                  : isCurrentMonth && !isPast && !isSoldOut && "bg-white hover:border-[#e5c07b]/50 hover:bg-[#fcfbf7]",
                isSoldOut && "bg-red-50/10 grayscale-[0.5]",
                inRange && !isSelected ? "bg-[#c28639]/10 border-[#c28639]/30 border-dashed" : ""
              )}
            >
              <span className={cn(
                "text-xs font-bold",
                isSelected ? "text-white" : isSoldOut ? "text-red-400" : inRange ? "text-[#c28639]" : "text-[#1a1612]"
              )}>
                {format(day, "d")}
              </span>
              <span className={cn(
                "text-[9px] font-medium leading-tight mt-1",
                isSelected ? "text-white/90" : isSoldOut ? "text-red-400/60" : isPriceOverride ? "text-[#c28639] font-bold" : "text-[#9a9187]"
              )}>
                {isSoldOut ? "SOLD OUT" : <Price amount={price} />}
              </span>
              {isPriceOverride && !isSelected && (
                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#c28639]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4 py-3 px-4 rounded-xl bg-[#fcfbf7] border border-[#e5c07b]/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c28639]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#645c55]">Special Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-[#c28639]">
            <Calculator size={10} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dynamic Rates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
