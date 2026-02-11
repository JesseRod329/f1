"use client";

import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import type { TelemetryPoint } from "@/data/circuits";

interface TelemetryPanelProps {
  telemetry: TelemetryPoint;
  teamColor: string;
  sectorTimes: string[];
  currentSector: number;
  lapTime: string;
  isAnimating: boolean;
}

function SpeedGauge({ speed, teamColor }: { speed: number; teamColor: string }) {
  const motionSpeed = useMotionValue(speed);
  const springSpeed = useSpring(motionSpeed, { stiffness: 100, damping: 20 });
  const displaySpeed = useRef(speed);

  useEffect(() => {
    motionSpeed.set(speed);
  }, [speed, motionSpeed]);

  useEffect(() => {
    const unsubscribe = springSpeed.on("change", (v) => {
      displaySpeed.current = Math.round(v);
    });
    return unsubscribe;
  }, [springSpeed]);

  const maxSpeed = 360;
  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = endAngle - startAngle;
  const currentAngle = startAngle + (speed / maxSpeed) * sweepAngle;

  const radius = 70;
  const cx = 90;
  const cy = 90;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(currentAngle);
  const largeArcFlag = currentAngle - startAngle > 180 ? 1 : 0;

  const bgEnd = polarToCartesian(endAngle);
  const bgLargeArc = sweepAngle > 180 ? 1 : 0;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="140" viewBox="0 0 180 140">
        {/* Background arc */}
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Speed arc */}
        <motion.path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`}
          fill="none"
          stroke={teamColor}
          strokeWidth="8"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${teamColor}80) drop-shadow(0 0 20px ${teamColor}40)`,
          }}
          initial={false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
        {/* Speed ticks */}
        {[0, 60, 120, 180, 240, 300, 360].map((tick) => {
          const tickAngle = startAngle + (tick / maxSpeed) * sweepAngle;
          const inner = polarToCartesian(tickAngle);
          const outerR = radius + 8;
          const outerRad = ((tickAngle - 90) * Math.PI) / 180;
          const outer = { x: cx + outerR * Math.cos(outerRad), y: cy + outerR * Math.sin(outerRad) };
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="absolute top-[50px] left-1/2 -translate-x-1/2 text-center">
        <motion.div
          className="font-display text-3xl font-bold text-white"
          key={Math.round(speed / 10)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {Math.round(speed)}
        </motion.div>
        <div className="text-f1-text-muted text-[10px] tracking-widest">KM/H</div>
      </div>
    </div>
  );
}

function BarGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-f1-text-muted text-[10px] tracking-widest uppercase">{label}</span>
        <span className="text-white text-xs font-display">{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}60, 0 0 20px ${color}30`,
          }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

function GearIndicator({ gear, teamColor }: { gear: number; teamColor: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-f1-text-muted text-[10px] tracking-widest">GEAR</span>
      <AnimatePresence mode="wait">
        <motion.div
          key={gear}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="font-display text-4xl font-bold"
          style={{
            color: teamColor,
            textShadow: `0 0 20px ${teamColor}60`,
          }}
        >
          {gear}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SectorTimesDisplay({
  sectorTimes,
  currentSector,
}: {
  sectorTimes: string[];
  currentSector: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {sectorTimes.map((time, i) => {
        const isActive = i === currentSector;
        const isComplete = time !== "--";
        return (
          <motion.div
            key={i}
            className={`text-center p-2 rounded-lg ${
              isActive ? "bg-f1-cyan/10 border border-f1-cyan/20" : "bg-white/[0.03]"
            }`}
            animate={
              isComplete && isActive
                ? { backgroundColor: ["rgba(0,212,255,0.2)", "rgba(0,212,255,0.05)"] }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <div className="text-[10px] text-f1-text-muted tracking-widest">S{i + 1}</div>
            <div
              className={`font-display text-sm font-bold ${
                isComplete ? "text-green-400" : isActive ? "text-f1-cyan" : "text-f1-text-muted"
              }`}
            >
              {time}
            </div>
          </motion.div>
        );
      })}
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
    <div className="glass rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-[0.2em] text-f1-cyan">TELEMETRY</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isAnimating ? "animate-pulse-slow" : ""}`}
            style={{ backgroundColor: isAnimating ? "#00FF88" : "#666" }}
          />
          <span className="text-[10px] text-f1-text-muted">{isAnimating ? "LIVE" : "PAUSED"}</span>
        </div>
      </div>

      {/* Speed gauge */}
      <SpeedGauge speed={telemetry.speed} teamColor={teamColor} />

      {/* Gear indicator */}
      <GearIndicator gear={telemetry.gear} teamColor={teamColor} />

      {/* Throttle and Brake */}
      <div className="space-y-3">
        <BarGauge value={telemetry.throttle} label="Throttle" color="#00FF88" />
        <BarGauge value={telemetry.brake} label="Brake" color="#E10600" />
      </div>

      {/* Sector times */}
      <div>
        <div className="text-[10px] text-f1-text-muted tracking-widest mb-2">SECTORS</div>
        <SectorTimesDisplay sectorTimes={sectorTimes} currentSector={currentSector} />
      </div>

      {/* Lap time */}
      <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-f1-border/50">
        <div className="text-[10px] text-f1-text-muted tracking-widest mb-1">LAP TIME</div>
        <div className="font-display text-xl font-bold text-white">{lapTime}</div>
      </div>
    </div>
  );
}
