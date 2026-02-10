"use client";

import { motion } from "framer-motion";
import { calendar2025, getNextRace, getTimeUntilRace } from "@/data/calendar";
import { useEffect, useState } from "react";

const countryFlags: Record<string, string> = {
    AU: "🇦🇺", CN: "🇨🇳", JP: "🇯🇵", BH: "🇧🇭", SA: "🇸🇦", US: "🇺🇸",
    IT: "🇮🇹", MC: "🇲🇨", ES: "🇪🇸", CA: "🇨🇦", AT: "🇦🇹", GB: "🇬🇧",
    BE: "🇧🇪", HU: "🇭🇺", NL: "🇳🇱", AZ: "🇦🇿", SG: "🇸🇬", MX: "🇲🇽",
    BR: "🇧🇷", QA: "🇶🇦", AE: "🇦🇪",
};

export default function CalendarPage() {
    const nextRace = getNextRace(calendar2025);
    const [time, setTime] = useState(getTimeUntilRace(nextRace!));
    const now = new Date();

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getTimeUntilRace(nextRace!));
        }, 1000);
        return () => clearInterval(interval);
    }, [nextRace]);

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">24 RACES</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                        Race Calendar
                    </h1>
                    <p className="text-f1-text-muted text-lg max-w-2xl">
                        The 2025 FIA Formula One World Championship — 24 rounds spanning 5 continents,
                        celebrating 75 years of the pinnacle of motorsport.
                    </p>
                </motion.div>

                {/* Next race highlight */}
                {nextRace && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-6 md:p-8 mb-12 glow-red relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-f1-red/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-f1-red/20 text-f1-red text-xs font-display tracking-widest animate-pulse-slow">
                                    ● NEXT RACE
                                </span>
                                {nextRace.hasSprint && (
                                    <span className="px-3 py-1 rounded-full bg-f1-cyan/20 text-f1-cyan text-xs font-display tracking-widest">
                                        SPRINT
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <p className="text-4xl mb-2">{countryFlags[nextRace.countryCode] || "🏁"}</p>
                                    <h2 className="font-display text-2xl md:text-4xl font-bold text-white">
                                        {nextRace.officialName}
                                    </h2>
                                    <p className="text-f1-text-muted text-sm mt-2">{nextRace.circuit}</p>
                                    <p className="text-f1-text-muted text-sm">
                                        {nextRace.location}, {nextRace.country} • Round {nextRace.round}
                                    </p>
                                    <p className="text-white font-medium mt-2">
                                        {new Date(nextRace.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    {[
                                        { v: time.days, l: "D" },
                                        { v: time.hours, l: "H" },
                                        { v: time.minutes, l: "M" },
                                        { v: time.seconds, l: "S" },
                                    ].map((b) => (
                                        <div key={b.l} className="bg-f1-dark/60 rounded-xl p-3 min-w-[56px] text-center">
                                            <div className="font-display text-2xl font-bold text-white">
                                                {String(b.v).padStart(2, "0")}
                                            </div>
                                            <div className="text-f1-text-muted text-xs">{b.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Calendar timeline */}
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-f1-red via-f1-border to-f1-cyan" />

                    <div className="space-y-4">
                        {calendar2025.map((race, i) => {
                            const raceDate = new Date(race.date);
                            const isPast = raceDate < now;
                            const isNext = race.round === nextRace?.round;

                            return (
                                <motion.div
                                    key={race.round}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="relative pl-16 md:pl-20"
                                >
                                    {/* Timeline dot */}
                                    <div
                                        className={`absolute left-4 md:left-6 w-5 h-5 rounded-full border-2 top-6 ${isNext
                                                ? "bg-f1-red border-f1-red animate-pulse-slow"
                                                : isPast
                                                    ? "bg-f1-text-muted/30 border-f1-text-muted/30"
                                                    : "bg-f1-carbon border-f1-border"
                                            }`}
                                    >
                                        {isNext && (
                                            <div className="absolute inset-0 rounded-full bg-f1-red animate-ping opacity-30" />
                                        )}
                                    </div>

                                    <div
                                        className={`glass rounded-2xl p-5 transition-all duration-300 ${isNext ? "border-f1-red/30 glow-red" : isPast ? "opacity-60" : "hover:bg-f1-surface-hover"
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{countryFlags[race.countryCode] || "🏁"}</span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-f1-text-muted text-xs font-display">R{String(race.round).padStart(2, "0")}</span>
                                                        {race.hasSprint && (
                                                            <span className="px-2 py-0.5 rounded-full bg-f1-cyan/15 text-f1-cyan text-[10px] font-display tracking-wider">
                                                                SPRINT
                                                            </span>
                                                        )}
                                                        {isPast && (
                                                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-f1-text-muted text-[10px] font-display tracking-wider">
                                                                COMPLETED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-display text-lg font-bold text-white">
                                                        {race.officialName}
                                                    </h3>
                                                    <p className="text-f1-text-muted text-sm">{race.circuit}</p>
                                                </div>
                                            </div>

                                            <div className="text-right sm:min-w-[140px]">
                                                <p className="text-white font-medium text-sm">
                                                    {raceDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </p>
                                                <p className="text-f1-text-muted text-xs">
                                                    {race.location}, {race.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
