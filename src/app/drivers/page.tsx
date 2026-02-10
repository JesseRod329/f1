"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { drivers2025, teams } from "@/data/drivers";

const allTeams = Object.keys(teams);

export default function DriversPage() {
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    const filteredDrivers = selectedTeam
        ? drivers2025.filter((d) => d.teamId === selectedTeam)
        : drivers2025;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">2025 SEASON</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                        The Drivers
                    </h1>
                    <p className="text-f1-text-muted text-lg max-w-2xl">
                        Meet the 20 drivers competing in the 2025 FIA Formula One World Championship —
                        from four-time champion Max Verstappen to exciting rookies making their debut.
                    </p>
                </motion.div>

                {/* Team filter */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 mb-10"
                >
                    <button
                        onClick={() => setSelectedTeam(null)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedTeam
                                ? "bg-f1-red text-white"
                                : "glass text-f1-text-muted hover:text-white"
                            }`}
                    >
                        All Teams
                    </button>
                    {allTeams.map((teamId) => {
                        const team = teams[teamId];
                        return (
                            <button
                                key={teamId}
                                onClick={() => setSelectedTeam(teamId === selectedTeam ? null : teamId)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selectedTeam === teamId
                                        ? "text-white"
                                        : "glass text-f1-text-muted hover:text-white border-transparent"
                                    }`}
                                style={
                                    selectedTeam === teamId
                                        ? { backgroundColor: `${team.color}30`, borderColor: team.color, color: team.color }
                                        : {}
                                }
                            >
                                {team.logo} {teamId.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Driver grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredDrivers.map((driver, i) => {
                        const teamColor = teams[driver.teamId];
                        return (
                            <motion.div
                                key={driver.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                            >
                                {/* Team color top bar */}
                                <div className="h-1.5 w-full" style={{ background: teamColor?.color }} />

                                <div className="p-5">
                                    {/* Number + Flag */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-display font-black text-white"
                                            style={{ background: `${teamColor?.color}25` }}
                                        >
                                            {driver.number}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl">{
                                                driver.countryCode === "GB" ? "🇬🇧" :
                                                    driver.countryCode === "AU" ? "🇦🇺" :
                                                        driver.countryCode === "NL" ? "🇳🇱" :
                                                            driver.countryCode === "JP" ? "🇯🇵" :
                                                                driver.countryCode === "MC" ? "🇲🇨" :
                                                                    driver.countryCode === "IT" ? "🇮🇹" :
                                                                        driver.countryCode === "ES" ? "🇪🇸" :
                                                                            driver.countryCode === "CA" ? "🇨🇦" :
                                                                                driver.countryCode === "FR" ? "🇫🇷" :
                                                                                    driver.countryCode === "DE" ? "🇩🇪" :
                                                                                        driver.countryCode === "TH" ? "🇹🇭" :
                                                                                            driver.countryCode === "NZ" ? "🇳🇿" :
                                                                                                driver.countryCode === "AR" ? "🇦🇷" :
                                                                                                    "🏁"
                                            }</p>
                                            <p className="text-f1-text-muted text-xs">{driver.nationality}</p>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-f1-text-muted text-sm">{driver.firstName}</h3>
                                    <h2 className="font-display text-xl font-bold text-white group-hover:text-f1-cyan transition-colors">
                                        {driver.lastName}
                                    </h2>

                                    {/* Team */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ background: teamColor?.color }}
                                        />
                                        <span className="text-f1-text-muted text-sm">{driver.team}</span>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-f1-text-muted text-xs mt-3 leading-relaxed line-clamp-3">
                                        {driver.bio}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
