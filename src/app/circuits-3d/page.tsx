"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { circuits, countryFlags } from "@/data/circuits";
import type { TelemetryPoint } from "@/data/circuits";
import { drivers2025, teams } from "@/data/drivers";
import TelemetryPanel from "@/components/TelemetryPanel";
import TrackVisualization3D from "@/components/TrackVisualization3D";
import type { CameraMode } from "@/components/TrackVisualization3D";

export default function Circuits3DPage() {
    const [selectedCircuitId, setSelectedCircuitId] = useState("monaco");
    const [selectedDriverId, setSelectedDriverId] = useState("verstappen");
    const [isAnimating, setIsAnimating] = useState(true);
    const [cameraMode, setCameraMode] = useState<CameraMode>("overview");
    const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);
    const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryPoint>({
        speed: 0,
        throttle: 0,
        brake: 0,
        gear: 1,
    });
    const [currentSector, setCurrentSector] = useState(0);
    const [sectorTimes, setSectorTimes] = useState<string[]>(["--", "--", "--"]);
    const [lapTime, setLapTime] = useState("0:00.000");

    const lapStartRef = useRef<number>(0);
    const lastSectorRef = useRef(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCircuit = circuits.find((c) => c.id === selectedCircuitId)!;
    const selectedDriver = drivers2025.find((d) => d.id === selectedDriverId)!;
    const teamColor = teams[selectedDriver.teamId]?.color || "#00D4FF";

    useEffect(() => {
        lapStartRef.current = Date.now();
        lastSectorRef.current = 0;
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDriverDropdownOpen(false);
            }
        }
        if (driverDropdownOpen) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [driverDropdownOpen]);

    const handleCircuitChange = useCallback((circuitId: string) => {
        setSelectedCircuitId(circuitId);
        setSectorTimes(["--", "--", "--"]);
        setCurrentSector(0);
        setLapTime("0:00.000");
        lapStartRef.current = Date.now();
        lastSectorRef.current = 0;
    }, []);

    const handleProgressChange = useCallback(
        (progress: number) => {
            const circuit = circuits.find((c) => c.id === selectedCircuitId)!;
            const telIdx = Math.floor(progress * circuit.telemetry.length) % circuit.telemetry.length;
            setCurrentTelemetry(circuit.telemetry[telIdx]);

            const sectorIdx = circuit.sectors.findIndex(
                (s) => progress >= s.startPercent && progress < s.endPercent
            );

            if (sectorIdx >= 0 && sectorIdx !== lastSectorRef.current) {
                if (sectorIdx === 0 && lastSectorRef.current === circuit.sectors.length - 1) {
                    setSectorTimes((prev) => {
                        const updated = [...prev];
                        updated[lastSectorRef.current] = circuit.sectors[lastSectorRef.current].bestTime;
                        return updated;
                    });
                    setTimeout(() => {
                        setSectorTimes(["--", "--", "--"]);
                        lapStartRef.current = Date.now();
                    }, 500);
                } else if (sectorIdx > lastSectorRef.current) {
                    setSectorTimes((prev) => {
                        const updated = [...prev];
                        updated[lastSectorRef.current] = circuit.sectors[lastSectorRef.current].bestTime;
                        return updated;
                    });
                }
                lastSectorRef.current = sectorIdx;
                setCurrentSector(sectorIdx);
            }

            const elapsed = (Date.now() - lapStartRef.current) / 1000;
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            setLapTime(`${minutes}:${seconds.toFixed(3).padStart(6, "0")}`);
        },
        [selectedCircuitId]
    );

    // Group drivers by team for dropdown
    const teamGroups = Object.entries(teams).map(([teamId, team]) => ({
        teamId,
        team,
        drivers: drivers2025.filter((d) => d.teamId === teamId),
    }));

    return (
        <div className="h-screen w-screen overflow-hidden relative bg-f1-dark">
            {/* Full-viewport 3D canvas */}
            <TrackVisualization3D
                key={selectedCircuit.id}
                circuit={selectedCircuit}
                teamColor={teamColor}
                isAnimating={isAnimating}
                cameraMode={cameraMode}
                onCameraModeChange={setCameraMode}
                onToggleAnimation={() => setIsAnimating((v) => !v)}
                onProgressChange={handleProgressChange}
                className="w-full h-full"
            />

            {/* === OVERLAY: Circuit Selector (top-left) === */}
            <div className="absolute top-[4.5rem] left-3 md:left-5 z-10 flex flex-col gap-1.5">
                <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-180px)] scrollbar-none">
                    {circuits.map((circuit) => {
                        const isSelected = circuit.id === selectedCircuitId;
                        return (
                            <button
                                key={circuit.id}
                                onClick={() => handleCircuitChange(circuit.id)}
                                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-display tracking-wider transition-all whitespace-nowrap ${
                                    isSelected
                                        ? "glass-hud border border-white/15 text-white"
                                        : "text-white/25 hover:text-white/50"
                                }`}
                            >
                                <span className="mr-1">{countryFlags[circuit.countryCode]}</span>
                                {circuit.location}
                            </button>
                        );
                    })}
                </div>

                {/* Circuit info line */}
                <motion.div
                    key={selectedCircuit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] text-white/20 font-display tracking-wider pl-1"
                >
                    {selectedCircuit.lengthKm} km &middot; {selectedCircuit.turns} turns &middot;{" "}
                    {selectedCircuit.lapRecord}
                </motion.div>
            </div>

            {/* === OVERLAY: Driver Selector (top-right) === */}
            <div className="absolute top-[4.5rem] right-3 md:right-5 z-20" ref={dropdownRef}>
                <button
                    onClick={() => setDriverDropdownOpen((v) => !v)}
                    className="glass-hud rounded-lg px-3 py-1.5 flex items-center gap-2 transition-all hover:border-white/15 border border-transparent"
                >
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: teamColor }}
                    />
                    <span className="font-display text-[11px] text-white tracking-wider">
                        {selectedDriver.lastName}
                    </span>
                    <span className="text-[9px] text-white/20 font-display">#{selectedDriver.number}</span>
                    <svg
                        className={`w-3 h-3 text-white/30 transition-transform ${driverDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <AnimatePresence>
                    {driverDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-1.5 glass-hud rounded-xl py-2 min-w-[180px] max-h-[60vh] overflow-y-auto"
                        >
                            {teamGroups.map(({ teamId, team, drivers: teamDrivers }) => (
                                <div key={teamId}>
                                    <div
                                        className="text-[8px] tracking-[0.2em] px-3 py-1 font-display"
                                        style={{ color: team.color + "60" }}
                                    >
                                        {teamId.replace(/-/g, " ").toUpperCase()}
                                    </div>
                                    {teamDrivers.map((driver) => (
                                        <button
                                            key={driver.id}
                                            onClick={() => {
                                                setSelectedDriverId(driver.id);
                                                setDriverDropdownOpen(false);
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors ${
                                                driver.id === selectedDriverId
                                                    ? "bg-white/[0.06]"
                                                    : "hover:bg-white/[0.03]"
                                            }`}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ background: team.color }}
                                            />
                                            <span className="text-[11px] text-white/70 font-display tracking-wider">
                                                {driver.lastName}
                                            </span>
                                            <span className="text-[9px] text-white/15 ml-auto font-display">
                                                {driver.number}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* === OVERLAY: Telemetry HUD (bottom) === */}
            <div className="absolute bottom-4 left-3 right-3 md:bottom-6 md:left-6 md:right-auto z-10">
                <TelemetryPanel
                    telemetry={currentTelemetry}
                    teamColor={teamColor}
                    sectorTimes={sectorTimes}
                    currentSector={currentSector}
                    lapTime={lapTime}
                    isAnimating={isAnimating}
                />
            </div>

            {/* === OVERLAY: 2D View link (bottom-right) === */}
            <Link
                href="/circuits"
                className="absolute bottom-5 right-4 md:bottom-7 md:right-6 z-10 text-[9px] text-white/15 hover:text-white/40 tracking-[0.2em] font-display transition-colors"
            >
                2D VIEW
            </Link>
        </div>
    );
}
