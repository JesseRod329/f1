"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { teams as teamColors } from "@/data/drivers";

// Sample projected standings data for visualization
const driverStandingsData = [
    { name: "NOR", fullName: "Lando Norris", team: "mclaren", points: 195 },
    { name: "PIA", fullName: "Oscar Piastri", team: "mclaren", points: 180 },
    { name: "VER", fullName: "Max Verstappen", team: "red-bull", points: 160 },
    { name: "LEC", fullName: "Charles Leclerc", team: "ferrari", points: 148 },
    { name: "HAM", fullName: "Lewis Hamilton", team: "ferrari", points: 135 },
    { name: "RUS", fullName: "George Russell", team: "mercedes", points: 120 },
    { name: "ANT", fullName: "Kimi Antonelli", team: "mercedes", points: 78 },
    { name: "TSU", fullName: "Yuki Tsunoda", team: "red-bull", points: 72 },
    { name: "ALO", fullName: "Fernando Alonso", team: "aston-martin", points: 55 },
    { name: "SAI", fullName: "Carlos Sainz Jr.", team: "williams", points: 48 },
];

const constructorStandingsData = [
    { name: "McLaren", id: "mclaren", points: 375 },
    { name: "Ferrari", id: "ferrari", points: 283 },
    { name: "Red Bull", id: "red-bull", points: 232 },
    { name: "Mercedes", id: "mercedes", points: 198 },
    { name: "Aston Martin", id: "aston-martin", points: 78 },
    { name: "Williams", id: "williams", points: 62 },
    { name: "Haas", id: "haas", points: 38 },
    { name: "Racing Bulls", id: "racing-bulls", points: 35 },
    { name: "Alpine", id: "alpine", points: 28 },
    { name: "Sauber", id: "sauber", points: 5 },
];

type Tab = "drivers" | "constructors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass-strong rounded-xl p-3 border border-f1-border">
                <p className="font-display text-sm font-bold text-white">{data.fullName || data.name}</p>
                <p className="text-f1-text-muted text-xs">{data.points} points</p>
            </div>
        );
    }
    return null;
}

export default function StandingsCharts() {
    const [tab, setTab] = useState<Tab>("drivers");

    return (
        <div>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-8">
                {(["drivers", "constructors"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-6 py-3 rounded-xl font-display text-sm tracking-wider transition-all ${tab === t
                                ? "bg-f1-red text-white"
                                : "glass text-f1-text-muted hover:text-white"
                            }`}
                    >
                        {t === "drivers" ? "🏎️ DRIVERS" : "🔧 CONSTRUCTORS"}
                    </button>
                ))}
            </div>

            {/* Note */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-f1-text-muted text-xs mb-6 glass rounded-lg inline-block px-3 py-1.5"
            >
                📊 Projected standings data for visualization purposes
            </motion.p>

            {tab === "drivers" ? (
                <motion.div
                    key="drivers"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Chart */}
                    <div className="glass rounded-2xl p-4 md:p-6 mb-8">
                        <h3 className="font-display text-lg font-bold text-white mb-6">
                            Drivers&apos; Championship Points
                        </h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={driverStandingsData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D4A" horizontal={false} />
                                <XAxis type="number" stroke="#8892A4" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#8892A4"
                                    fontSize={12}
                                    width={45}
                                    tick={{ fontFamily: "'Orbitron', sans-serif", fill: "#E2E8F0" }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                                <Bar dataKey="points" radius={[0, 6, 6, 0]} barSize={24}>
                                    {driverStandingsData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={teamColors[entry.team]?.color || "#E10600"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-f1-border">
                                        <th className="text-left p-4 text-f1-text-muted text-xs font-display tracking-wider">POS</th>
                                        <th className="text-left p-4 text-f1-text-muted text-xs font-display tracking-wider">DRIVER</th>
                                        <th className="text-left p-4 text-f1-text-muted text-xs font-display tracking-wider hidden sm:table-cell">TEAM</th>
                                        <th className="text-right p-4 text-f1-text-muted text-xs font-display tracking-wider">PTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {driverStandingsData.map((driver, i) => (
                                        <tr
                                            key={driver.name}
                                            className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className={`font-display font-bold ${i === 0 ? "text-f1-gold" : i === 1 ? "text-f1-silver" : i === 2 ? "text-orange-400" : "text-white"
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-1 h-8 rounded-full"
                                                        style={{ background: teamColors[driver.team]?.color }}
                                                    />
                                                    <span className="text-white font-medium">{driver.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-f1-text-muted text-sm hidden sm:table-cell">
                                                {driver.team.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-display font-bold text-white">{driver.points}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="constructors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Chart */}
                    <div className="glass rounded-2xl p-4 md:p-6 mb-8">
                        <h3 className="font-display text-lg font-bold text-white mb-6">
                            Constructors&apos; Championship Points
                        </h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={constructorStandingsData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D4A" horizontal={false} />
                                <XAxis type="number" stroke="#8892A4" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#8892A4"
                                    fontSize={11}
                                    width={100}
                                    tick={{ fill: "#E2E8F0" }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                                <Bar dataKey="points" radius={[0, 6, 6, 0]} barSize={28}>
                                    {constructorStandingsData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={teamColors[entry.id]?.color || "#E10600"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-f1-border">
                                        <th className="text-left p-4 text-f1-text-muted text-xs font-display tracking-wider">POS</th>
                                        <th className="text-left p-4 text-f1-text-muted text-xs font-display tracking-wider">TEAM</th>
                                        <th className="text-right p-4 text-f1-text-muted text-xs font-display tracking-wider">PTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {constructorStandingsData.map((team, i) => (
                                        <tr
                                            key={team.name}
                                            className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className={`font-display font-bold ${i === 0 ? "text-f1-gold" : i === 1 ? "text-f1-silver" : i === 2 ? "text-orange-400" : "text-white"
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ background: teamColors[team.id]?.color }}
                                                    />
                                                    <span className="text-white font-medium">{team.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-display font-bold text-white">{team.points}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
