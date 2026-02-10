"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const StandingsCharts = dynamic(() => import("@/components/StandingsCharts"), {
    ssr: false,
    loading: () => (
        <div className="glass rounded-2xl p-8 text-center">
            <div className="animate-pulse-slow text-f1-text-muted">Loading charts...</div>
        </div>
    ),
});

export default function StandingsPage() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">CHAMPIONSHIP</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                        Standings
                    </h1>
                    <p className="text-f1-text-muted text-lg max-w-2xl">
                        Track the 2025 FIA Formula One World Championship standings for both
                        Drivers and Constructors.
                    </p>
                </motion.div>

                <StandingsCharts />
            </div>
        </div>
    );
}
