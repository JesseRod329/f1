"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { circuits, countryFlags } from "@/data/circuits";
import type { TelemetryPoint } from "@/data/circuits";
import { drivers2025, teams } from "@/data/drivers";
import TrackVisualization from "@/components/TrackVisualization";
import TelemetryPanel from "@/components/TelemetryPanel";

export default function CircuitsPage() {
  const [selectedCircuitId, setSelectedCircuitId] = useState("monaco");
  const [selectedDriverId, setSelectedDriverId] = useState("verstappen");
  const [isAnimating, setIsAnimating] = useState(true);
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

  const selectedCircuit = circuits.find((c) => c.id === selectedCircuitId)!;
  const selectedDriver = drivers2025.find((d) => d.id === selectedDriverId)!;
  const teamColor = teams[selectedDriver.teamId]?.color || "#00D4FF";

  useEffect(() => {
    lapStartRef.current = Date.now();
    lastSectorRef.current = 0;
  }, []);

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

      // Determine current sector
      const sectorIdx = circuit.sectors.findIndex(
        (s) => progress >= s.startPercent && progress < s.endPercent
      );

      if (sectorIdx >= 0 && sectorIdx !== lastSectorRef.current) {
        // Sector changed — record simulated sector time
        if (sectorIdx === 0 && lastSectorRef.current === circuit.sectors.length - 1) {
          // Completed a lap
          setSectorTimes((prev) => {
            const updated = [...prev];
            updated[lastSectorRef.current] = circuit.sectors[lastSectorRef.current].bestTime;
            return updated;
          });

          // Reset for new lap
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

      // Update lap time
      const elapsed = (Date.now() - lapStartRef.current) / 1000;
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setLapTime(`${minutes}:${seconds.toFixed(3).padStart(6, "0")}`);
    },
    [selectedCircuitId]
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <p className="text-f1-red font-display text-sm tracking-[0.3em]">
              HOLOGRAPHIC VIEW
            </p>
            <Link
              href="/circuits-3d"
              className="glass px-3 py-1.5 rounded-lg text-xs text-f1-cyan border border-f1-cyan/30 hover:bg-f1-cyan/10 transition-colors"
            >
              Switch to 3D View
            </Link>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
            Circuit Explorer
          </h1>
          <p className="text-f1-text-muted text-lg max-w-2xl">
            Watch a simulated lap unfold in real time. Select a circuit and driver to see telemetry
            data come alive on the holographic track map.
          </p>
        </motion.div>

        {/* Driver selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-f1-text-muted text-xs tracking-widest uppercase mb-3">Select Driver</p>
          <div className="flex flex-wrap gap-2">
            {drivers2025.map((driver) => {
              const driverTeamColor = teams[driver.teamId]?.color || "#888";
              const isSelected = driver.id === selectedDriverId;
              return (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriverId(driver.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    isSelected
                      ? "text-white"
                      : "glass text-f1-text-muted hover:text-white border-transparent"
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${driverTeamColor}20`,
                          borderColor: driverTeamColor,
                          color: driverTeamColor,
                        }
                      : {}
                  }
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: driverTeamColor }}
                    />
                    {driver.lastName}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Circuit selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-f1-text-muted text-xs tracking-widest uppercase mb-3">Select Circuit</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {circuits.map((circuit, i) => {
              const isSelected = circuit.id === selectedCircuitId;
              return (
                <motion.button
                  key={circuit.id}
                  onClick={() => handleCircuitChange(circuit.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`text-left p-3 rounded-xl transition-all ${
                    isSelected
                      ? "glass border border-f1-cyan/40 glow-cyan"
                      : "glass border border-transparent hover:border-f1-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{countryFlags[circuit.countryCode] || ""}</span>
                    <span
                      className={`font-display text-xs font-bold truncate ${
                        isSelected ? "text-f1-cyan" : "text-white"
                      }`}
                    >
                      {circuit.name.length > 20
                        ? circuit.location
                        : circuit.name.split(" ").slice(-1)[0]}
                    </span>
                  </div>
                  <div className="text-f1-text-muted text-[10px] space-y-0.5">
                    <div>{circuit.turns} turns &middot; {circuit.lengthKm} km</div>
                    <div>{circuit.lapRecord}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Main visualization area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Track visualization */}
          <div className="flex-1 lg:w-[65%]">
            <TrackVisualization
              key={selectedCircuit.id}
              circuit={selectedCircuit}
              teamColor={teamColor}
              isAnimating={isAnimating}
              onToggleAnimation={() => setIsAnimating(!isAnimating)}
              onProgressChange={handleProgressChange}
            />
          </div>

          {/* Telemetry panel */}
          <div className="lg:w-[35%]">
            <TelemetryPanel
              telemetry={currentTelemetry}
              teamColor={teamColor}
              sectorTimes={sectorTimes}
              currentSector={currentSector}
              lapTime={lapTime}
              isAnimating={isAnimating}
            />
          </div>
        </motion.div>

        {/* Circuit info bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "TRACK LENGTH", value: `${selectedCircuit.lengthKm} km` },
            { label: "CORNERS", value: String(selectedCircuit.turns) },
            { label: "LAP RECORD", value: selectedCircuit.lapRecord },
            {
              label: "RECORD HOLDER",
              value: `${selectedCircuit.lapRecordHolder} (${selectedCircuit.lapRecordYear})`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 text-center"
            >
              <div className="text-[10px] text-f1-text-muted tracking-widest mb-1">{stat.label}</div>
              <div className="font-display text-sm font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
