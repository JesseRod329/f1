"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { watchOptions } from "@/data/watch";

const typeColors = {
    tv: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", icon: "📡" },
    streaming: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", icon: "📱" },
    free: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", icon: "🆓" },
};

const countryFlags: Record<string, string> = {
    US: "🇺🇸", GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦", IN: "🇮🇳", GLOBAL: "🌍",
};

export default function WatchPage() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    const filteredOptions = selectedCountry
        ? watchOptions.filter((o) => o.countryCode === selectedCountry)
        : watchOptions;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">TUNE IN</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                        Where to Watch
                    </h1>
                    <p className="text-f1-text-muted text-lg max-w-2xl">
                        Find the best way to watch Formula 1 in your country — from live broadcasts to
                        streaming options. Never miss a race.
                    </p>
                </motion.div>

                {/* 2026 Apple TV+ Alert */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 mb-10 border border-f1-gold/20"
                >
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">🍎</span>
                        <div>
                            <h3 className="font-display text-lg font-bold text-f1-gold mb-1">
                                Big Change Coming in 2026
                            </h3>
                            <p className="text-f1-text-muted text-sm leading-relaxed">
                                Starting in 2026, <span className="text-white font-medium">Apple TV+</span> becomes the exclusive
                                home of F1 in the United States (2026–2030). All 24 races, practice, qualifying,
                                and sprint sessions will be available to Apple TV+ subscribers. Select races and
                                all practice sessions will also be free on the Apple TV app.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Country filter */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 mb-10"
                >
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!selectedCountry
                                ? "bg-f1-red text-white"
                                : "glass text-f1-text-muted hover:text-white"
                            }`}
                    >
                        🌍 All Countries
                    </button>
                    {watchOptions.map((option) => (
                        <button
                            key={option.countryCode}
                            onClick={() =>
                                setSelectedCountry(
                                    option.countryCode === selectedCountry ? null : option.countryCode
                                )
                            }
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCountry === option.countryCode
                                    ? "bg-f1-cyan/20 text-f1-cyan border border-f1-cyan/30"
                                    : "glass text-f1-text-muted hover:text-white"
                                }`}
                        >
                            {countryFlags[option.countryCode] || "🏁"} {option.country}
                        </button>
                    ))}
                </motion.div>

                {/* Watch options */}
                <div className="space-y-8">
                    {filteredOptions.map((option, i) => (
                        <motion.div
                            key={option.countryCode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">{countryFlags[option.countryCode] || "🏁"}</span>
                                <h2 className="font-display text-xl font-bold text-white">{option.country}</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {option.platforms.map((platform) => {
                                    const style = typeColors[platform.type];
                                    return (
                                        <a
                                            key={platform.name}
                                            href={platform.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${style.bg} border ${style.border} rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 block group`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span>{style.icon}</span>
                                                <span className={`text-xs font-display tracking-wider uppercase ${style.text}`}>
                                                    {platform.type}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-bold text-lg group-hover:text-f1-cyan transition-colors">
                                                {platform.name}
                                            </h3>
                                            <p className="text-f1-text-muted text-sm mt-1 leading-relaxed">
                                                {platform.notes}
                                            </p>
                                        </a>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* F1 TV Pro highlight */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 glass rounded-2xl p-8 text-center border border-f1-red/20 glow-red"
                >
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                        F1 TV Pro — The Ultimate Experience
                    </h3>
                    <p className="text-f1-text-muted text-lg max-w-2xl mx-auto mb-6">
                        Available in 180+ countries. Get onboard cameras for every driver, team radio,
                        live timing, full race replays, and exclusive F1 documentaries.
                    </p>
                    <a
                        href="https://f1tv.formula1.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-3.5 rounded-xl bg-f1-red hover:bg-red-700 text-white font-display font-bold tracking-wider hover:scale-105 hover:glow-red transition-all duration-300"
                    >
                        GET F1 TV PRO →
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
