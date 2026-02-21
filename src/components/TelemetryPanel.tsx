"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TelemetryPoint } from "@/data/circuits";

interface TelemetryPanelProps {
    telemetry: TelemetryPoint;
    teamColor: string;
    sectorTimes: string[];
    currentSector: number;
    lapTime: string;
    isAnimating: boolean;
}

function CompactBar({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <div className="w-2.5 h-8 md:h-10 rounded-full bg-white/[0.06] relative overflow-hidden">
                <motion.div
                    className="absolute bottom-0 w-full rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{ height: `${value}%` }}
                    transition={{ type: "spring", stiffness: 140, damping: 22 }}
                />
            </div>
            <span className="text-[7px] text-white/30 tracking-wider font-display">{label}</span>
        </div>
    );
}

export default function TelemetryPanel({
    telemetry,
    teamColor,
    sectorTimes,
    currentSector,
    lapTime,
    isAnimating,
}: TelemetryPanelProps) {
    return (
        <motion.div
            className="glass-hud rounded-xl px-3 py-2 md:px-5 md:py-3 flex flex-wrap items-center gap-3 md:gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
        >
            {/* Speed */}
            <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl md:text-3xl font-bold text-white tabular-nums leading-none">
                    {Math.round(telemetry.speed)}
                </span>
                <span className="text-[8px] text-white/25 tracking-widest font-display">KM/H</span>
            </div>

            {/* Gear */}
            <div className="flex flex-col items-center -mt-0.5">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={telemetry.gear}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.08 }}
                        className="font-display text-xl md:text-2xl font-bold leading-none"
                        style={{ color: teamColor }}
                    >
                        {telemetry.gear}
                    </motion.span>
                </AnimatePresence>
                <span className="text-[7px] text-white/25 tracking-widest font-display">GEAR</span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 md:h-8 bg-white/[0.06]" />

            {/* Throttle / Brake */}
            <div className="flex gap-2">
                <CompactBar value={telemetry.throttle} label="THR" color="#00FF88" />
                <CompactBar value={telemetry.brake} label="BRK" color="#E10600" />
            </div>

            {/* Divider */}
            <div className="w-px h-6 md:h-8 bg-white/[0.06] hidden md:block" />

            {/* Sector times */}
            <div className="flex gap-2 md:gap-3">
                {sectorTimes.map((time, i) => {
                    const isActive = i === currentSector;
                    const isComplete = time !== "--";
                    return (
                        <div key={i} className="text-center min-w-[28px]">
                            <div className="text-[7px] text-white/25 tracking-widest font-display">S{i + 1}</div>
                            <div
                                className={`font-display text-[11px] md:text-xs font-bold tabular-nums leading-tight ${
                                    isComplete
                                        ? "text-green-400"
                                        : isActive
                                        ? "text-f1-cyan"
                                        : "text-white/15"
                                }`}
                            >
                                {time}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Divider */}
            <div className="w-px h-6 md:h-8 bg-white/[0.06] hidden sm:block" />

            {/* Lap time */}
            <div className="text-right">
                <div className="text-[7px] text-white/25 tracking-widest font-display">LAP</div>
                <div className="font-display text-xs md:text-sm font-bold text-white tabular-nums leading-tight">
                    {lapTime}
                </div>
            </div>

            {/* LIVE indicator */}
            <div className="flex items-center gap-1 ml-auto">
                <div
                    className={`w-1.5 h-1.5 rounded-full ${
                        isAnimating ? "bg-green-400 animate-pulse-slow" : "bg-white/20"
                    }`}
                />
                <span className="text-[7px] text-white/25 tracking-widest font-display">
                    {isAnimating ? "LIVE" : "PAUSED"}
                </span>
            </div>
        </motion.div>
    );
}
