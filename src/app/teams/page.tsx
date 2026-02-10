"use client";

import { motion } from "framer-motion";
import { teams2025, newTeams2026 } from "@/data/teams";

export default function TeamsPage() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">CONSTRUCTORS</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                        The Teams
                    </h1>
                    <p className="text-f1-text-muted text-lg max-w-2xl">
                        The 10 teams competing for the Constructors&apos; Championship in 2025 — plus a sneak peek
                        at the newcomers joining in 2026.
                    </p>
                </motion.div>

                {/* 2025 Teams */}
                <div className="grid gap-6">
                    {teams2025.map((team, i) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass rounded-2xl overflow-hidden hover:bg-f1-surface-hover transition-all duration-300 group"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Team color sidebar */}
                                <div
                                    className="w-full md:w-2 h-2 md:h-auto shrink-0"
                                    style={{ background: `linear-gradient(180deg, ${team.color}, ${team.secondaryColor})` }}
                                />

                                <div className="p-6 flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            {/* Team name */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                                                    style={{ background: `${team.color}25`, color: team.color }}
                                                >
                                                    {team.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="font-display text-xl font-bold text-white group-hover:text-f1-cyan transition-colors">
                                                        {team.name}
                                                    </h2>
                                                    <p className="text-f1-text-muted text-xs">{team.fullName}</p>
                                                </div>
                                            </div>

                                            <p className="text-f1-text-muted text-sm leading-relaxed mb-4">{team.bio}</p>

                                            {/* Drivers */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {team.drivers.map((driver) => (
                                                    <span
                                                        key={driver}
                                                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                                                        style={{ background: `${team.color}30`, border: `1px solid ${team.color}50` }}
                                                    >
                                                        {driver}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats sidebar */}
                                        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:min-w-[180px]">
                                            <div className="bg-f1-dark/50 rounded-xl p-3 text-center">
                                                <p className="text-f1-text-muted text-xs uppercase tracking-wide">Base</p>
                                                <p className="text-white text-sm font-medium mt-1">{team.base.split(",")[0]}</p>
                                            </div>
                                            <div className="bg-f1-dark/50 rounded-xl p-3 text-center">
                                                <p className="text-f1-text-muted text-xs uppercase tracking-wide">Power Unit</p>
                                                <p className="text-white text-sm font-medium mt-1">{team.powerUnit}</p>
                                            </div>
                                            <div className="bg-f1-dark/50 rounded-xl p-3 text-center">
                                                <p className="text-f1-text-muted text-xs uppercase tracking-wide">Championships</p>
                                                <p className="text-white text-2xl font-display font-bold mt-1">{team.championships}</p>
                                            </div>
                                            <div className="bg-f1-dark/50 rounded-xl p-3 text-center">
                                                <p className="text-f1-text-muted text-xs uppercase tracking-wide">First Entry</p>
                                                <p className="text-white text-sm font-medium mt-1">{team.firstEntry}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 2026 New Entrants */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="text-center mb-10">
                        <span className="inline-block px-4 py-1.5 rounded-full glass text-f1-gold font-display text-xs tracking-[0.3em] mb-4">
                            COMING IN 2026
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                            New Teams Joining F1
                        </h2>
                        <p className="text-f1-text-muted mt-3 max-w-xl mx-auto">
                            The 2026 season brings massive regulation changes and two brand-new teams to the grid.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {newTeams2026.map((team, i) => (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="glass rounded-2xl p-6 relative overflow-hidden"
                                style={{ borderTop: `3px solid ${team.color}` }}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"
                                    style={{ background: team.color }}
                                />
                                <div className="relative z-10">
                                    <h3 className="font-display text-2xl font-bold text-white mb-2">{team.name}</h3>
                                    <p className="text-f1-text-muted text-xs mb-3">{team.fullName}</p>
                                    <p className="text-f1-text-muted text-sm leading-relaxed mb-4">{team.bio}</p>
                                    <div className="flex gap-2">
                                        {team.drivers.map((driver) => (
                                            <span
                                                key={driver}
                                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                                                style={{ background: `${team.color}30`, border: `1px solid ${team.color}50` }}
                                            >
                                                {driver}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
