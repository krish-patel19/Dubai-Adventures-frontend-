"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, Thermometer, Wind, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
    current: {
        temp: number;
        condition: string;
        wind: number;
        humidity: number;
    };
    forecast: Array<{
        date: string;
        maxTemp: number;
        minTemp: number;
        condition: string;
    }>;
}

export function WeatherWidget({ compact = false }: { compact?: boolean }) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Dubai coordinates: 25.2048, 55.2708
                const res = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=25.2048&longitude=55.2708&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto"
                );
                
                if (!res.ok) throw new Error("Weather API Error");
                
                const data = await res.json();

                const interpretCode = (code: number) => {
                    if (code === 0) return "Clear Sky";
                    if (code <= 3) return "Partly Cloudy";
                    if (code <= 48) return "Foggy";
                    if (code <= 67) return "Rainy";
                    if (code <= 77) return "Snowy";
                    return "Stormy";
                };

                const mappedData: WeatherData = {
                    current: {
                        temp: Math.round(data.current.temperature_2m),
                        condition: interpretCode(data.current.weather_code),
                        wind: Math.round(data.current.wind_speed_10m),
                        humidity: data.current.relative_humidity_2m
                    },
                    forecast: data.daily.time.slice(0, 3).map((time: string, i: number) => ({
                        date: new Date(time).toLocaleDateString("en-US", { weekday: "short" }),
                        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                        minTemp: Math.round(data.daily.temperature_2m_min[i]),
                        condition: interpretCode(data.daily.weather_code[i])
                    }))
                };

                setWeather(mappedData);
                setHasError(false);
            } catch (err) {
                console.error("Weather Fetch Error:", err);
                setHasError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [compact]);

    if (loading) return (
        <div className={cn(
            "flex items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-[#e5c07b]/20 animate-pulse",
            compact ? "h-24" : "h-48"
        )}>
            <Thermometer className="text-[#e5c07b] animate-bounce" size={compact ? 20 : 24} />
        </div>
    );

    if (hasError) return (
        <div className={cn(
            "bg-white/60 backdrop-blur-xl border border-red-100 rounded-[32px] shadow-xl shadow-black/[0.03] flex items-center justify-center gap-4",
            compact ? "p-4" : "p-6"
        )}>
            <div className={cn("rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0", compact ? "w-8 h-8" : "w-12 h-12")}>
                <Cloud size={compact ? 16 : 24} className="text-red-300" />
            </div>
            <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-400 mb-0.5">Offline</p>
                <h4 className={cn("font-bold text-[#1a1612]", compact ? "text-[10px]" : "text-sm")}>Weather Unavailable</h4>
            </div>
        </div>
    );

    if (!weather) return null;

    return (
        <div className={cn(
            "bg-white/60 backdrop-blur-xl border border-[#e5c07b]/30 rounded-[32px] shadow-xl shadow-black/[0.03] overflow-hidden group transition-all duration-500",
            compact ? "p-4 max-w-sm mx-auto sm:mx-0" : "p-6"
        )}>
            <div className={cn("flex items-center justify-between", compact ? "mb-4" : "mb-8")}>
                <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#d4a045] block mb-0.5">Dubai Live Forecast</span>
                    <h3 className={cn("font-bold text-[#1a1612]", compact ? "text-sm" : "text-xl")}>Adventure Weather</h3>
                </div>
                {!compact && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimal Conditions</span>
                    </div>
                )}
            </div>

            <div className={cn(
                "grid items-center gap-4",
                compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 mb-8"
            )}>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#e5c07b]/20 blur-2xl rounded-full" />
                        {weather.current.temp > 30 ? (
                            <Sun size={compact ? 40 : 64} className="text-[#e5c07b] relative animate-spin-slow" />
                        ) : (
                            <Cloud size={compact ? 40 : 64} className="text-[#e5c07b] relative" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-start">
                            <span className={cn("font-black text-[#1a1612] tracking-tighter", compact ? "text-3xl" : "text-5xl")}>
                                {weather.current.temp}
                            </span>
                            <span className={cn("font-bold text-[#d4a045] mt-1", compact ? "text-sm" : "text-xl")}>°C</span>
                        </div>
                        <p className={cn("font-bold text-[#645c55] uppercase tracking-widest leading-none", compact ? "text-[8px]" : "text-sm")}>
                            {weather.current.condition}
                        </p>
                    </div>
                </div>

                <div className={cn(
                    "grid grid-cols-2 gap-3",
                    compact ? "mt-2" : ""
                )}>
                    <div className={cn("bg-[#fcfbf7] rounded-xl border border-black/5 flex items-center gap-2", compact ? "p-2" : "p-3")}>
                        <Wind size={compact ? 14 : 18} className="text-[#d4a045]" />
                        <div>
                            <p className="text-[8px] font-black text-[#8c7e73] uppercase tracking-widest leading-none">Wind</p>
                            <p className={cn("font-bold text-[#1a1612]", compact ? "text-[10px]" : "text-xs")}>{weather.current.wind} km/h</p>
                        </div>
                    </div>
                    <div className={cn("bg-[#fcfbf7] rounded-xl border border-black/5 flex items-center gap-2", compact ? "p-2" : "p-3")}>
                        <Droplets size={compact ? 14 : 18} className="text-[#d4a045]" />
                        <div>
                            <p className="text-[8px] font-black text-[#8c7e73] uppercase tracking-widest leading-none">Humid</p>
                            <p className={cn("font-bold text-[#1a1612]", compact ? "text-[10px]" : "text-xs")}>{weather.current.humidity}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {!compact && (
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#e5c07b]/20">
                    {weather.forecast.map((day, i) => (
                        <div key={i} className="text-center p-3 rounded-2xl hover:bg-[#fcf8f2] transition-colors border border-transparent hover:border-[#e5c07b]/20">
                            <p className="text-[9px] font-black text-[#8c7e73] uppercase tracking-widest mb-2">{i === 0 ? "Today" : day.date}</p>
                            {day.condition.includes("Clear") ? (
                                <Sun size={20} className="mx-auto text-[#d4a045] mb-2" />
                            ) : (
                                <Cloud size={20} className="mx-auto text-[#d4a045] mb-2" />
                            )}
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="text-xs font-black text-[#1a1612]">{day.maxTemp}°</span>
                                <span className="text-[10px] font-bold text-[#8c7e73]">{day.minTemp}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
}
