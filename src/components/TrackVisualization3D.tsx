"use client";

import { useMemo, useRef, useEffect } from "react";
import { useAnimationFrame } from "framer-motion";
import type { Circuit } from "@/data/circuits";

export type CameraMode = "overview" | "chase" | "orbit";

interface TrackVisualization3DProps {
    circuit: Circuit;
    teamColor: string;
    isAnimating: boolean;
    cameraMode: CameraMode;
    onCameraModeChange: (mode: CameraMode) => void;
    onToggleAnimation: () => void;
    onProgressChange: (progress: number) => void;
    className?: string;
}

type Point2D = { x: number; y: number };
type Point3D = { x: number; y: number; z: number };

const CURVE_STEPS = 16;
const TRAIL_LENGTH = 35;
const LAP_DURATION_MS = 22_000;

const SECTOR_COLORS = [
    { fill: "rgba(225, 6, 0, 0.06)", edge: "rgba(225, 6, 0, 0.45)" },
    { fill: "rgba(0, 212, 255, 0.06)", edge: "rgba(0, 212, 255, 0.45)" },
    { fill: "rgba(255, 215, 0, 0.06)", edge: "rgba(255, 215, 0, 0.45)" },
];

function isCommand(token: string): boolean {
    return /^[MLCZ]$/.test(token);
}

function cubicBezier(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
        x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
        y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
    };
}

function parseSvgPath(path: string): Point2D[] {
    const tokens = path.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
    const points: Point2D[] = [];
    let idx = 0;
    let command = "";
    let current: Point2D = { x: 0, y: 0 };
    let start: Point2D | null = null;

    const readNumber = (): number => Number(tokens[idx++]);

    while (idx < tokens.length) {
        const token = tokens[idx];
        if (isCommand(token)) {
            command = token;
            idx += 1;
        }

        if (command === "M") {
            const x = readNumber();
            const y = readNumber();
            current = { x, y };
            start = { x, y };
            points.push(current);
            while (idx < tokens.length && !isCommand(tokens[idx])) {
                current = { x: readNumber(), y: readNumber() };
                points.push(current);
            }
            command = "L";
        } else if (command === "L") {
            while (idx < tokens.length && !isCommand(tokens[idx])) {
                current = { x: readNumber(), y: readNumber() };
                points.push(current);
            }
        } else if (command === "C") {
            while (idx < tokens.length && !isCommand(tokens[idx])) {
                const c1 = { x: readNumber(), y: readNumber() };
                const c2 = { x: readNumber(), y: readNumber() };
                const end = { x: readNumber(), y: readNumber() };
                for (let step = 1; step <= CURVE_STEPS; step++) {
                    points.push(cubicBezier(current, c1, c2, end, step / CURVE_STEPS));
                }
                current = end;
            }
        } else if (command === "Z" && start) {
            points.push(start);
        } else {
            idx += 1;
        }
    }
    return points;
}

function normalizeTrack(points: Point2D[]): Point3D[] {
    if (points.length === 0) return [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const span = Math.max(maxX - minX, maxY - minY) || 1;

    return points.map((p, i) => {
        const t = i / Math.max(points.length - 1, 1);
        return {
            x: ((p.x - cx) / span) * 2.6,
            y: 0.12 * Math.sin(t * Math.PI * 6) + 0.06 * Math.cos(t * Math.PI * 3),
            z: ((p.y - cy) / span) * 2.6,
        };
    });
}

function buildArcLengths(points: Point3D[]): { cumulative: number[]; total: number } {
    if (points.length === 0) return { cumulative: [0], total: 0 };
    const cumulative: number[] = [0];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const dz = points[i].z - points[i - 1].z;
        total += Math.hypot(dx, dy, dz);
        cumulative.push(total);
    }
    return { cumulative, total };
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function sampleTrackPoint(
    points: Point3D[],
    cumulative: number[],
    total: number,
    progress: number
): { point: Point3D; tangent: Point3D } {
    if (points.length < 2 || total <= 0) {
        return { point: points[0] ?? { x: 0, y: 0, z: 0 }, tangent: { x: 1, y: 0, z: 0 } };
    }
    const target = progress * total;
    let index = 1;
    while (index < cumulative.length && cumulative[index] < target) index++;
    index = Math.min(index, cumulative.length - 1);
    const prev = index - 1;
    const segment = Math.max(cumulative[index] - cumulative[prev], 1e-6);
    const t = (target - cumulative[prev]) / segment;
    const p0 = points[prev];
    const p1 = points[index];
    return {
        point: { x: lerp(p0.x, p1.x, t), y: lerp(p0.y, p1.y, t), z: lerp(p0.z, p1.z, t) },
        tangent: { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z },
    };
}

type CameraState = { yaw: number; pitch: number; distance: number; target: Point3D };

function getCamera(mode: CameraMode, timeMs: number, car: Point3D, tangent: Point3D): CameraState {
    if (mode === "overview") {
        return { yaw: -0.55, pitch: 1.0, distance: 5.2, target: { x: 0, y: 0, z: 0 } };
    }
    if (mode === "orbit") {
        return { yaw: (timeMs / 1000) * 0.28, pitch: 0.72, distance: 4.2, target: { x: 0, y: 0, z: 0 } };
    }
    const tangentLen = Math.hypot(tangent.x, tangent.y, tangent.z) || 1;
    const nx = tangent.x / tangentLen;
    const nz = tangent.z / tangentLen;
    const heading = Math.atan2(nx, nz);
    return {
        yaw: heading + Math.PI * 0.78,
        pitch: 0.48,
        distance: 2.8,
        target: { x: car.x + nx * 0.2, y: car.y - 0.05, z: car.z + nz * 0.2 },
    };
}

function projectPoint(
    point: Point3D,
    camera: CameraState,
    width: number,
    height: number
): { x: number; y: number; depth: number } | null {
    const relX = point.x - camera.target.x;
    const relY = point.y - camera.target.y;
    const relZ = point.z - camera.target.z;
    const cosYaw = Math.cos(camera.yaw);
    const sinYaw = Math.sin(camera.yaw);
    const xzX = relX * cosYaw - relZ * sinYaw;
    const xzZ = relX * sinYaw + relZ * cosYaw;
    const cosPitch = Math.cos(camera.pitch);
    const sinPitch = Math.sin(camera.pitch);
    const yzY = relY * cosPitch - xzZ * sinPitch;
    const yzZ = relY * sinPitch + xzZ * cosPitch;
    const depth = yzZ + camera.distance;
    if (depth <= 0.1) return null;
    const focal = Math.min(width, height) * 0.9;
    const scale = focal / depth;
    return { x: xzX * scale + width / 2, y: -yzY * scale + height / 2, depth };
}

// Deterministic star positions (computed once)
function generateStars(count: number): { x: number; y: number; brightness: number }[] {
    const stars: { x: number; y: number; brightness: number }[] = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: ((i * 7919 + 1013) % 10007) / 10007,
            y: ((i * 6271 + 2017) % 10007) / 10007 * 0.5,
            brightness: 0.04 + (((i * 3571) % 100) / 100) * 0.08,
        });
    }
    return stars;
}

const STARS = generateStars(80);

export default function TrackVisualization3D({
    circuit,
    teamColor,
    isAnimating,
    cameraMode,
    onCameraModeChange,
    onToggleAnimation,
    onProgressChange,
    className,
}: TrackVisualization3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef(0);
    const trailRef = useRef<Point3D[]>([]);
    const smoothCameraRef = useRef<CameraState | null>(null);
    const lastCameraModeRef = useRef(cameraMode);

    const trackPoints = useMemo(() => normalizeTrack(parseSvgPath(circuit.svgPath)), [circuit.svgPath]);
    const { cumulative, total } = useMemo(() => buildArcLengths(trackPoints), [trackPoints]);

    useEffect(() => {
        progressRef.current = 0;
        trailRef.current = [];
        smoothCameraRef.current = null;
    }, [circuit.id]);

    // Reset camera smoothing on mode change
    useEffect(() => {
        if (cameraMode !== lastCameraModeRef.current) {
            lastCameraModeRef.current = cameraMode;
            // Don't reset — let it interpolate smoothly
        }
    }, [cameraMode]);

    useAnimationFrame((time, delta) => {
        const canvas = canvasRef.current;
        if (!canvas || trackPoints.length < 2) return;

        // Progress
        let currentSpeed = 0;
        if (isAnimating) {
            const telIdx = Math.floor(progressRef.current * circuit.telemetry.length) % circuit.telemetry.length;
            currentSpeed = circuit.telemetry[telIdx].speed;
            const speedFactor = Math.max(0.32, currentSpeed / 300);
            progressRef.current = (progressRef.current + (delta / LAP_DURATION_MS) * speedFactor) % 1;
            onProgressChange(progressRef.current);
        } else {
            const telIdx = Math.floor(progressRef.current * circuit.telemetry.length) % circuit.telemetry.length;
            currentSpeed = circuit.telemetry[telIdx].speed;
        }

        // Canvas sizing
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width <= 0 || height <= 0) return;
        const dpr = window.devicePixelRatio || 1;
        const tw = Math.floor(width * dpr);
        const th = Math.floor(height * dpr);
        if (canvas.width !== tw || canvas.height !== th) {
            canvas.width = tw;
            canvas.height = th;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        // Car sample
        const carSample = sampleTrackPoint(trackPoints, cumulative, total, progressRef.current);
        const carPoint = carSample.point;

        // Camera with smoothing
        const rawCamera = getCamera(cameraMode, time, carPoint, carSample.tangent);
        if (!smoothCameraRef.current) {
            smoothCameraRef.current = { ...rawCamera, target: { ...rawCamera.target } };
        } else {
            const lf = cameraMode === "orbit" ? 0.03 : 0.06;
            const sc = smoothCameraRef.current;
            sc.yaw = cameraMode === "orbit" ? rawCamera.yaw : lerp(sc.yaw, rawCamera.yaw, lf);
            sc.pitch = lerp(sc.pitch, rawCamera.pitch, lf);
            sc.distance = lerp(sc.distance, rawCamera.distance, lf);
            sc.target.x = lerp(sc.target.x, rawCamera.target.x, lf);
            sc.target.y = lerp(sc.target.y, rawCamera.target.y, lf);
            sc.target.z = lerp(sc.target.z, rawCamera.target.z, lf);
        }
        const camera = smoothCameraRef.current;

        // === BACKGROUND ===
        const bgGrad = ctx.createRadialGradient(
            width / 2, height * 0.35, 0,
            width / 2, height * 0.35, Math.max(width, height) * 0.85
        );
        bgGrad.addColorStop(0, "#0f1528");
        bgGrad.addColorStop(0.4, "#0a0f1f");
        bgGrad.addColorStop(1, "#020408");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Stars
        for (const star of STARS) {
            ctx.beginPath();
            ctx.arc(star.x * width, star.y * height, 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
            ctx.fill();
        }

        // Subtle ground plane glow (centered under the track)
        const groundGlow = ctx.createRadialGradient(
            width / 2, height * 0.55, 0,
            width / 2, height * 0.55, Math.min(width, height) * 0.5
        );
        groundGlow.addColorStop(0, "rgba(0, 212, 255, 0.015)");
        groundGlow.addColorStop(1, "rgba(0, 212, 255, 0)");
        ctx.fillStyle = groundGlow;
        ctx.fillRect(0, 0, width, height);

        // === TRACK RENDERING ===
        const projectedTrack = trackPoints
            .map((p) => projectPoint(p, camera, width, height))
            .filter((v): v is { x: number; y: number; depth: number } => v !== null);

        if (projectedTrack.length > 1) {
            // Pass 1: Wide road surface (asphalt)
            ctx.beginPath();
            ctx.moveTo(projectedTrack[0].x, projectedTrack[0].y);
            for (let i = 1; i < projectedTrack.length; i++) {
                ctx.lineTo(projectedTrack[i].x, projectedTrack[i].y);
            }
            ctx.strokeStyle = "rgba(30, 32, 48, 0.7)";
            ctx.lineWidth = 26;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.stroke();

            // Pass 2: Sector-colored overlays on road surface
            for (let s = 0; s < circuit.sectors.length; s++) {
                const sector = circuit.sectors[s];
                const startIdx = Math.floor(sector.startPercent * projectedTrack.length);
                const endIdx = Math.min(Math.floor(sector.endPercent * projectedTrack.length), projectedTrack.length - 1);
                if (endIdx <= startIdx) continue;

                ctx.beginPath();
                ctx.moveTo(projectedTrack[startIdx].x, projectedTrack[startIdx].y);
                for (let i = startIdx + 1; i <= endIdx; i++) {
                    ctx.lineTo(projectedTrack[i].x, projectedTrack[i].y);
                }
                ctx.strokeStyle = SECTOR_COLORS[s % SECTOR_COLORS.length].fill;
                ctx.lineWidth = 22;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.stroke();
            }

            // Pass 3: Track edge lines (curb simulation)
            // Compute screen-space normals for edge offset
            for (let pass = 0; pass < 2; pass++) {
                const sign = pass === 0 ? 1 : -1;
                const halfWidth = 12;
                ctx.beginPath();
                let started = false;
                for (let i = 0; i < projectedTrack.length; i++) {
                    const next = i < projectedTrack.length - 1 ? i + 1 : 0;
                    const dx = projectedTrack[next].x - projectedTrack[i].x;
                    const dy = projectedTrack[next].y - projectedTrack[i].y;
                    const len = Math.hypot(dx, dy) || 1;
                    const nx = (-dy / len) * halfWidth * sign;
                    const ny = (dx / len) * halfWidth * sign;
                    const ex = projectedTrack[i].x + nx;
                    const ey = projectedTrack[i].y + ny;
                    if (!started) {
                        ctx.moveTo(ex, ey);
                        started = true;
                    } else {
                        ctx.lineTo(ex, ey);
                    }
                }
                ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";
                ctx.stroke();
            }

            // Pass 4: Thin centerline (subtle racing line hint)
            ctx.beginPath();
            ctx.moveTo(projectedTrack[0].x, projectedTrack[0].y);
            for (let i = 1; i < projectedTrack.length; i++) {
                ctx.lineTo(projectedTrack[i].x, projectedTrack[i].y);
            }
            ctx.setLineDash([8, 16]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
            ctx.lineWidth = 1;
            ctx.lineJoin = "round";
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // === SECTOR MARKERS ===
        for (let i = 0; i < circuit.sectors.length; i++) {
            const sectorSample = sampleTrackPoint(trackPoints, cumulative, total, circuit.sectors[i].startPercent);
            const nearSample = sampleTrackPoint(trackPoints, cumulative, total, Math.min(circuit.sectors[i].startPercent + 0.005, 0.999));

            const dx = nearSample.point.x - sectorSample.point.x;
            const dz = nearSample.point.z - sectorSample.point.z;
            const len = Math.hypot(dx, dz) || 1;
            const perpX = (-dz / len) * 0.14;
            const perpZ = (dx / len) * 0.14;

            const leftPt = projectPoint(
                { x: sectorSample.point.x + perpX, y: sectorSample.point.y, z: sectorSample.point.z + perpZ },
                camera, width, height
            );
            const rightPt = projectPoint(
                { x: sectorSample.point.x - perpX, y: sectorSample.point.y, z: sectorSample.point.z - perpZ },
                camera, width, height
            );

            if (leftPt && rightPt) {
                ctx.beginPath();
                ctx.moveTo(leftPt.x, leftPt.y);
                ctx.lineTo(rightPt.x, rightPt.y);
                ctx.strokeStyle = SECTOR_COLORS[i % SECTOR_COLORS.length].edge;
                ctx.lineWidth = 2;
                ctx.stroke();

                const midX = (leftPt.x + rightPt.x) / 2;
                const midY = Math.min(leftPt.y, rightPt.y) - 12;
                ctx.font = "600 9px var(--font-display)";
                ctx.textAlign = "center";
                ctx.fillStyle = SECTOR_COLORS[i % SECTOR_COLORS.length].edge;
                ctx.fillText(`S${i + 1}`, midX, midY);
            }
        }

        // === START LINE ===
        const startSample = sampleTrackPoint(trackPoints, cumulative, total, 0);
        const nearStart = sampleTrackPoint(trackPoints, cumulative, total, 0.005);
        const snx = -(nearStart.point.z - startSample.point.z);
        const snz = nearStart.point.x - startSample.point.x;
        const snLen = Math.hypot(snx, snz) || 1;
        const sNormal = { x: (snx / snLen) * 0.1, z: (snz / snLen) * 0.1 };
        const lineA = projectPoint(
            { x: startSample.point.x + sNormal.x, y: startSample.point.y, z: startSample.point.z + sNormal.z },
            camera, width, height
        );
        const lineB = projectPoint(
            { x: startSample.point.x - sNormal.x, y: startSample.point.y, z: startSample.point.z - sNormal.z },
            camera, width, height
        );
        if (lineA && lineB) {
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(lineA.x, lineA.y);
            ctx.lineTo(lineB.x, lineB.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // === TRAIL ===
        if (isAnimating) {
            trailRef.current.unshift(carPoint);
            if (trailRef.current.length > TRAIL_LENGTH) {
                trailRef.current = trailRef.current.slice(0, TRAIL_LENGTH);
            }
        }

        for (let i = trailRef.current.length - 1; i >= 0; i--) {
            const pt = projectPoint(trailRef.current[i], camera, width, height);
            if (!pt) continue;
            const alpha = 1 - i / TRAIL_LENGTH;
            const radius = Math.max(0.5, (4 + (currentSpeed / 360) * 4) * alpha);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            ctx.globalAlpha = alpha * 0.45;
            ctx.fillStyle = teamColor;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // === CAR MARKER (directional chevron) ===
        const projectedCar = projectPoint(carPoint, camera, width, height);
        const aheadSample = sampleTrackPoint(trackPoints, cumulative, total, (progressRef.current + 0.01) % 1);
        const projectedAhead = projectPoint(aheadSample.point, camera, width, height);

        if (projectedCar) {
            // Speed-based glow
            const glowRadius = 14 + (currentSpeed / 360) * 20;
            const glowGrad = ctx.createRadialGradient(
                projectedCar.x, projectedCar.y, 0,
                projectedCar.x, projectedCar.y, glowRadius
            );
            glowGrad.addColorStop(0, teamColor + "35");
            glowGrad.addColorStop(0.4, teamColor + "15");
            glowGrad.addColorStop(1, teamColor + "00");
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(projectedCar.x, projectedCar.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Directional chevron
            let headingAngle = 0;
            if (projectedAhead) {
                headingAngle = Math.atan2(
                    projectedAhead.y - projectedCar.y,
                    projectedAhead.x - projectedCar.x
                );
            }

            ctx.save();
            ctx.translate(projectedCar.x, projectedCar.y);
            ctx.rotate(headingAngle);

            const size = 9;
            ctx.beginPath();
            ctx.moveTo(size, 0);
            ctx.lineTo(-size * 0.6, -size * 0.55);
            ctx.lineTo(-size * 0.25, 0);
            ctx.lineTo(-size * 0.6, size * 0.55);
            ctx.closePath();
            ctx.fillStyle = teamColor;
            ctx.shadowBlur = 22;
            ctx.shadowColor = teamColor;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        // === VIGNETTE (final pass) ===
        const vignetteGrad = ctx.createRadialGradient(
            width / 2, height / 2, Math.min(width, height) * 0.35,
            width / 2, height / 2, Math.max(width, height) * 0.7
        );
        vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
        vignetteGrad.addColorStop(1, "rgba(0,0,0,0.35)");
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);
    });

    return (
        <div className={className || "w-full h-full relative"}>
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Camera mode buttons */}
            <div className="absolute bottom-16 left-4 md:bottom-20 md:left-6 flex gap-1.5 z-10">
                {(["overview", "chase", "orbit"] as CameraMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onCameraModeChange(mode)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-display tracking-wider border transition-all ${
                            cameraMode === mode
                                ? "bg-white/10 border-white/20 text-white"
                                : "border-transparent text-white/30 hover:text-white/60"
                        }`}
                    >
                        {mode === "overview" ? "OVR" : mode === "chase" ? "CHS" : "ORB"}
                    </button>
                ))}
            </div>

            {/* Play/Pause */}
            <button
                onClick={onToggleAnimation}
                className="absolute bottom-16 right-4 md:bottom-20 md:right-6 z-10 rounded-lg px-2.5 py-1 text-[10px] font-display tracking-wider text-white/30 hover:text-white/60 border border-transparent hover:border-white/10 transition-all"
            >
                {isAnimating ? "PAUSE" : "PLAY"}
            </button>
        </div>
    );
}
