"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import type { Circuit } from "@/data/circuits";

interface TrackVisualizationProps {
  circuit: Circuit;
  teamColor: string;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onProgressChange: (progress: number) => void;
}

const TRAIL_LENGTH = 25;
const LAP_DURATION_MS = 20000;

export default function TrackVisualization({
  circuit,
  teamColor,
  isAnimating,
  onToggleAnimation,
  onProgressChange,
}: TrackVisualizationProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const totalLengthRef = useRef(0);
  const progressRef = useRef(0);
  const [carPos, setCarPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [sectorPoints, setSectorPoints] = useState<{ x: number; y: number; label: string }[]>([]);
  const [startLinePoint, setStartLinePoint] = useState<{ x: number; y: number; angle: number } | null>(null);

  // Calculate total path length and sector points on circuit change
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Small delay to ensure SVG is rendered
    const timer = setTimeout(() => {
      const length = path.getTotalLength();
      totalLengthRef.current = length;

      // Calculate sector marker positions
      const sectors = circuit.sectors.map((s) => {
        const pt = path.getPointAtLength(s.startPercent * length);
        return { x: pt.x, y: pt.y, label: s.name.replace("Sector ", "S") };
      });
      setSectorPoints(sectors);

      // Calculate start/finish line position and angle
      const startPt = path.getPointAtLength(0);
      const nearPt = path.getPointAtLength(length * 0.005);
      const angle = Math.atan2(nearPt.y - startPt.y, nearPt.x - startPt.x);
      setStartLinePoint({ x: startPt.x, y: startPt.y, angle });

      // Set initial car position
      setCarPos({ x: startPt.x, y: startPt.y });
      progressRef.current = 0;
    }, 50);

    return () => clearTimeout(timer);
  }, [circuit]);

  // Animation loop
  useAnimationFrame((_, delta) => {
    if (!isAnimating || !pathRef.current || totalLengthRef.current === 0) return;

    const telIdx = Math.floor(progressRef.current * circuit.telemetry.length) % circuit.telemetry.length;
    const speedFactor = Math.max(0.3, circuit.telemetry[telIdx].speed / 280);
    const increment = (delta / LAP_DURATION_MS) * speedFactor;
    progressRef.current = (progressRef.current + increment) % 1;

    const pt = pathRef.current.getPointAtLength(progressRef.current * totalLengthRef.current);
    setCarPos({ x: pt.x, y: pt.y });

    // Update trail
    setTrail((prev) => {
      const next = [{ x: pt.x, y: pt.y }, ...prev];
      return next.slice(0, TRAIL_LENGTH);
    });

    onProgressChange(progressRef.current);
  });

  const getTrailOpacity = useCallback((index: number) => {
    return Math.max(0, 1 - index / TRAIL_LENGTH);
  }, []);

  return (
    <div className="relative">
      {/* Holographic container */}
      <div className="perspective-tilt">
        <div className="perspective-tilt-child">
          <div className="glass rounded-2xl overflow-hidden relative hologram-scanlines">
            <div className="hologram-sweep">
              <div className="hologram-grid p-4 md:p-6">
                {/* SVG Track */}
                <svg
                  viewBox={circuit.svgViewBox}
                  className="w-full h-auto"
                  style={{ maxHeight: "500px" }}
                >
                  <defs>
                    {/* Glow filter for the car dot */}
                    <radialGradient id="carGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={teamColor} stopOpacity="1" />
                      <stop offset="50%" stopColor={teamColor} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={teamColor} stopOpacity="0" />
                    </radialGradient>
                    {/* Glow filter for track */}
                    <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Track ghost (wide, dim road surface) */}
                  <path
                    d={circuit.svgPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track red edge glow */}
                  <path
                    d={circuit.svgPath}
                    fill="none"
                    stroke="rgba(225, 6, 0, 0.15)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track primary cyan outline with glow */}
                  <path
                    ref={pathRef}
                    d={circuit.svgPath}
                    fill="none"
                    stroke="#00D4FF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#trackGlow)"
                    opacity="0.9"
                  />

                  {/* Start/finish line */}
                  {startLinePoint && (
                    <g>
                      <line
                        x1={startLinePoint.x + Math.cos(startLinePoint.angle + Math.PI / 2) * 14}
                        y1={startLinePoint.y + Math.sin(startLinePoint.angle + Math.PI / 2) * 14}
                        x2={startLinePoint.x - Math.cos(startLinePoint.angle + Math.PI / 2) * 14}
                        y2={startLinePoint.y - Math.sin(startLinePoint.angle + Math.PI / 2) * 14}
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.6"
                        strokeDasharray="3 3"
                      />
                    </g>
                  )}

                  {/* Sector markers */}
                  {sectorPoints.map((sp, i) => (
                    <g key={i}>
                      <circle
                        cx={sp.x}
                        cy={sp.y}
                        r="4"
                        fill="none"
                        stroke="rgba(0, 212, 255, 0.5)"
                        strokeWidth="1"
                      />
                      <text
                        x={sp.x}
                        y={sp.y - 12}
                        textAnchor="middle"
                        fill="rgba(0, 212, 255, 0.6)"
                        fontSize="11"
                        fontFamily="var(--font-display)"
                        fontWeight="bold"
                      >
                        {sp.label}
                      </text>
                    </g>
                  ))}

                  {/* Car trail (particle effect) */}
                  {trail.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r={Math.max(1, 3 - (i / TRAIL_LENGTH) * 3)}
                      fill={teamColor}
                      opacity={getTrailOpacity(i) * 0.6}
                    />
                  ))}

                  {/* Car glow (outer) */}
                  <circle
                    cx={carPos.x}
                    cy={carPos.y}
                    r="16"
                    fill="url(#carGlow)"
                    opacity="0.5"
                  />

                  {/* Car dot (main) */}
                  <circle
                    cx={carPos.x}
                    cy={carPos.y}
                    r="5"
                    fill={teamColor}
                    stroke="white"
                    strokeWidth="1.5"
                    style={{
                      filter: `drop-shadow(0 0 6px ${teamColor}) drop-shadow(0 0 12px ${teamColor}80)`,
                    }}
                  />

                  {/* Car pulse ring */}
                  <circle
                    cx={carPos.x}
                    cy={carPos.y}
                    r="5"
                    fill="none"
                    stroke={teamColor}
                    strokeWidth="1"
                    opacity="0.4"
                    style={{ animation: isAnimating ? "car-pulse 1.5s ease-in-out infinite" : "none" }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Play/Pause button */}
      <motion.button
        onClick={onToggleAnimation}
        className="absolute bottom-4 right-4 z-20 glass rounded-xl p-3 hover:bg-f1-surface-hover transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isAnimating ? "Pause animation" : "Play animation"}
      >
        {isAnimating ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <polygon points="3,2 14,8 3,14" />
          </svg>
        )}
      </motion.button>

      {/* Circuit name overlay */}
      <div className="absolute top-4 left-4 z-20">
        <div className="font-display text-[10px] tracking-[0.3em] text-f1-cyan/60">CIRCUIT</div>
        <div className="font-display text-sm font-bold text-white/80">{circuit.name}</div>
      </div>
    </div>
  );
}
