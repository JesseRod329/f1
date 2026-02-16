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
}

type Point2D = { x: number; y: number };
type Point3D = { x: number; y: number; z: number };

const CURVE_STEPS = 16;
const TRAIL_LENGTH = 30;
const LAP_DURATION_MS = 22_000;

function isCommand(token: string): boolean {
    return /^[MLCZ]$/.test(token);
}

function cubicBezier(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
        x: (mt2 * mt * p0.x) + (3 * mt2 * t * p1.x) + (3 * mt * t2 * p2.x) + (t2 * t * p3.x),
        y: (mt2 * mt * p0.y) + (3 * mt2 * t * p1.y) + (3 * mt * t2 * p2.y) + (t2 * t * p3.y),
    };
}

function parseSvgPath(path: string): Point2D[] {
    const tokens = path.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
    const points: Point2D[] = [];

    let idx = 0;
    let command = "";
    let current: Point2D = { x: 0, y: 0 };
    let start: Point2D | null = null;

    const readNumber = (): number => {
        const token = tokens[idx++];
        return Number(token);
    };

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
                const lx = readNumber();
                const ly = readNumber();
                current = { x: lx, y: ly };
                points.push(current);
            }
            command = "L";
        } else if (command === "L") {
            while (idx < tokens.length && !isCommand(tokens[idx])) {
                const x = readNumber();
                const y = readNumber();
                current = { x, y };
                points.push(current);
            }
        } else if (command === "C") {
            while (idx < tokens.length && !isCommand(tokens[idx])) {
                const c1 = { x: readNumber(), y: readNumber() };
                const c2 = { x: readNumber(), y: readNumber() };
                const end = { x: readNumber(), y: readNumber() };
                for (let step = 1; step <= CURVE_STEPS; step += 1) {
                    const t = step / CURVE_STEPS;
                    points.push(cubicBezier(current, c1, c2, end, t));
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

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const point of points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const span = Math.max(maxX - minX, maxY - minY) || 1;

    return points.map((point, index) => {
        const t = index / Math.max(points.length - 1, 1);
        return {
            x: ((point.x - centerX) / span) * 2.6,
            y: (0.12 * Math.sin(t * Math.PI * 6)) + (0.06 * Math.cos(t * Math.PI * 3)),
            z: ((point.y - centerY) / span) * 2.6,
        };
    });
}

function buildArcLengths(points: Point3D[]): { cumulative: number[]; total: number } {
    if (points.length === 0) return { cumulative: [0], total: 0 };

    const cumulative: number[] = [0];
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const dz = points[i].z - points[i - 1].z;
        total += Math.hypot(dx, dy, dz);
        cumulative.push(total);
    }

    return { cumulative, total };
}

function lerp(a: number, b: number, t: number): number {
    return a + ((b - a) * t);
}

function sampleTrackPoint(points: Point3D[], cumulative: number[], total: number, progress: number): {
    point: Point3D;
    tangent: Point3D;
} {
    if (points.length < 2 || total <= 0) {
        return { point: points[0] ?? { x: 0, y: 0, z: 0 }, tangent: { x: 1, y: 0, z: 0 } };
    }

    const target = progress * total;
    let index = 1;
    while (index < cumulative.length && cumulative[index] < target) index += 1;
    index = Math.min(index, cumulative.length - 1);

    const prev = index - 1;
    const segment = Math.max(cumulative[index] - cumulative[prev], 1e-6);
    const t = (target - cumulative[prev]) / segment;

    const p0 = points[prev];
    const p1 = points[index];

    return {
        point: {
            x: lerp(p0.x, p1.x, t),
            y: lerp(p0.y, p1.y, t),
            z: lerp(p0.z, p1.z, t),
        },
        tangent: {
            x: p1.x - p0.x,
            y: p1.y - p0.y,
            z: p1.z - p0.z,
        },
    };
}

type CameraState = {
    yaw: number;
    pitch: number;
    distance: number;
    target: Point3D;
};

function getCamera(mode: CameraMode, timeMs: number, car: Point3D, tangent: Point3D): CameraState {
    if (mode === "overview") {
        return {
            yaw: -0.55,
            pitch: 1.0,
            distance: 5.2,
            target: { x: 0, y: 0, z: 0 },
        };
    }

    if (mode === "orbit") {
        return {
            yaw: (timeMs / 1000) * 0.28,
            pitch: 0.72,
            distance: 4.2,
            target: { x: 0, y: 0, z: 0 },
        };
    }

    const tangentLen = Math.hypot(tangent.x, tangent.y, tangent.z) || 1;
    const nx = tangent.x / tangentLen;
    const nz = tangent.z / tangentLen;
    const heading = Math.atan2(nx, nz);

    return {
        yaw: heading + Math.PI * 0.78,
        pitch: 0.48,
        distance: 2.8,
        target: { x: car.x + (nx * 0.2), y: car.y - 0.05, z: car.z + (nz * 0.2) },
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
    const xzX = (relX * cosYaw) - (relZ * sinYaw);
    const xzZ = (relX * sinYaw) + (relZ * cosYaw);

    const cosPitch = Math.cos(camera.pitch);
    const sinPitch = Math.sin(camera.pitch);
    const yzY = (relY * cosPitch) - (xzZ * sinPitch);
    const yzZ = (relY * sinPitch) + (xzZ * cosPitch);

    const depth = yzZ + camera.distance;
    if (depth <= 0.1) return null;

    const focal = Math.min(width, height) * 0.9;
    const scale = focal / depth;

    return {
        x: (xzX * scale) + (width / 2),
        y: (-yzY * scale) + (height / 2),
        depth,
    };
}

export default function TrackVisualization3D({
    circuit,
    teamColor,
    isAnimating,
    cameraMode,
    onCameraModeChange,
    onToggleAnimation,
    onProgressChange,
}: TrackVisualization3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef(0);
    const trailRef = useRef<Point3D[]>([]);

    const trackPoints = useMemo(() => normalizeTrack(parseSvgPath(circuit.svgPath)), [circuit.svgPath]);
    const { cumulative, total } = useMemo(() => buildArcLengths(trackPoints), [trackPoints]);

    useEffect(() => {
        progressRef.current = 0;
        trailRef.current = [];
    }, [circuit.id]);

    useAnimationFrame((time, delta) => {
        const canvas = canvasRef.current;
        if (!canvas || trackPoints.length < 2) return;

        if (isAnimating) {
            const telemetryIndex = Math.floor(progressRef.current * circuit.telemetry.length) % circuit.telemetry.length;
            const speedFactor = Math.max(0.32, circuit.telemetry[telemetryIndex].speed / 300);
            const increment = (delta / LAP_DURATION_MS) * speedFactor;
            progressRef.current = (progressRef.current + increment) % 1;
            onProgressChange(progressRef.current);
        }

        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width <= 0 || height <= 0) return;

        const dpr = window.devicePixelRatio || 1;
        const targetWidth = Math.floor(width * dpr);
        const targetHeight = Math.floor(height * dpr);
        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
        }

        const context = canvas.getContext("2d");
        if (!context) return;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);

        const carSample = sampleTrackPoint(trackPoints, cumulative, total, progressRef.current);
        const carPoint = carSample.point;
        const camera = getCamera(cameraMode, time, carPoint, carSample.tangent);

        // Background gradient
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#0a0f1f");
        gradient.addColorStop(1, "#020612");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        // Ground grid
        context.strokeStyle = "rgba(0, 212, 255, 0.12)";
        context.lineWidth = 1;
        for (let i = -6; i <= 6; i += 1) {
            const a = projectPoint({ x: i * 0.35, y: -0.34, z: -2.6 }, camera, width, height);
            const b = projectPoint({ x: i * 0.35, y: -0.34, z: 2.6 }, camera, width, height);
            if (a && b) {
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();
            }
        }
        for (let i = -6; i <= 6; i += 1) {
            const a = projectPoint({ x: -2.6, y: -0.34, z: i * 0.35 }, camera, width, height);
            const b = projectPoint({ x: 2.6, y: -0.34, z: i * 0.35 }, camera, width, height);
            if (a && b) {
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();
            }
        }

        const projectedTrack = trackPoints
            .map((point) => projectPoint(point, camera, width, height))
            .filter((value): value is { x: number; y: number; depth: number } => value !== null);

        if (projectedTrack.length > 1) {
            context.beginPath();
            context.moveTo(projectedTrack[0].x, projectedTrack[0].y);
            for (let i = 1; i < projectedTrack.length; i += 1) {
                context.lineTo(projectedTrack[i].x, projectedTrack[i].y);
            }
            context.strokeStyle = "rgba(255, 255, 255, 0.05)";
            context.lineWidth = 18;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke();

            context.beginPath();
            context.moveTo(projectedTrack[0].x, projectedTrack[0].y);
            for (let i = 1; i < projectedTrack.length; i += 1) {
                context.lineTo(projectedTrack[i].x, projectedTrack[i].y);
            }
            context.strokeStyle = "rgba(225, 6, 0, 0.20)";
            context.lineWidth = 7;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke();

            context.beginPath();
            context.moveTo(projectedTrack[0].x, projectedTrack[0].y);
            for (let i = 1; i < projectedTrack.length; i += 1) {
                context.lineTo(projectedTrack[i].x, projectedTrack[i].y);
            }
            context.strokeStyle = "#00d4ff";
            context.shadowBlur = 18;
            context.shadowColor = "rgba(0, 212, 255, 0.7)";
            context.lineWidth = 2.8;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke();
            context.shadowBlur = 0;
        }

        // Sector markers
        context.font = "700 10px var(--font-display)";
        context.textAlign = "center";
        context.textBaseline = "middle";
        for (let i = 0; i < circuit.sectors.length; i += 1) {
            const sectorSample = sampleTrackPoint(trackPoints, cumulative, total, circuit.sectors[i].startPercent);
            const sectorPoint = projectPoint(sectorSample.point, camera, width, height);
            if (!sectorPoint) continue;

            context.beginPath();
            context.arc(sectorPoint.x, sectorPoint.y, 4.5, 0, Math.PI * 2);
            context.fillStyle = "rgba(0, 212, 255, 0.26)";
            context.fill();
            context.strokeStyle = "rgba(0, 212, 255, 0.72)";
            context.lineWidth = 1;
            context.stroke();

            context.fillStyle = "rgba(215, 242, 255, 0.96)";
            context.fillText(`S${i + 1}`, sectorPoint.x, sectorPoint.y - 12);
        }

        // Start line
        const startSample = sampleTrackPoint(trackPoints, cumulative, total, 0);
        const nearSample = sampleTrackPoint(trackPoints, cumulative, total, 0.005);
        const nx = -(nearSample.point.z - startSample.point.z);
        const nz = nearSample.point.x - startSample.point.x;
        const normalLength = Math.hypot(nx, nz) || 1;
        const normal = { x: (nx / normalLength) * 0.09, z: (nz / normalLength) * 0.09 };
        const lineA = projectPoint(
            { x: startSample.point.x + normal.x, y: startSample.point.y, z: startSample.point.z + normal.z },
            camera,
            width,
            height
        );
        const lineB = projectPoint(
            { x: startSample.point.x - normal.x, y: startSample.point.y, z: startSample.point.z - normal.z },
            camera,
            width,
            height
        );
        if (lineA && lineB) {
            context.setLineDash([4, 4]);
            context.strokeStyle = "rgba(255,255,255,0.82)";
            context.lineWidth = 1.5;
            context.beginPath();
            context.moveTo(lineA.x, lineA.y);
            context.lineTo(lineB.x, lineB.y);
            context.stroke();
            context.setLineDash([]);
        }

        // Car + trail
        if (isAnimating) {
            trailRef.current.unshift(carPoint);
            if (trailRef.current.length > TRAIL_LENGTH) {
                trailRef.current = trailRef.current.slice(0, TRAIL_LENGTH);
            }
        }

        for (let i = trailRef.current.length - 1; i >= 0; i -= 1) {
            const point = projectPoint(trailRef.current[i], camera, width, height);
            if (!point) continue;
            const alpha = 1 - (i / TRAIL_LENGTH);
            const radius = Math.max(1.2, 4.2 * alpha);
            context.beginPath();
            context.arc(point.x, point.y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(0, 212, 255, ${alpha * 0.38})`;
            context.fill();
        }

        const projectedCar = projectPoint(carPoint, camera, width, height);
        if (projectedCar) {
            context.beginPath();
            context.arc(projectedCar.x, projectedCar.y, 15, 0, Math.PI * 2);
            context.fillStyle = "rgba(0, 212, 255, 0.24)";
            context.fill();

            context.beginPath();
            context.arc(projectedCar.x, projectedCar.y, 6, 0, Math.PI * 2);
            context.fillStyle = teamColor;
            context.strokeStyle = "white";
            context.lineWidth = 1.5;
            context.shadowBlur = 24;
            context.shadowColor = teamColor;
            context.fill();
            context.stroke();
            context.shadowBlur = 0;
        }
    });

    return (
        <div className="glass rounded-2xl overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-[420px] md:h-[520px] block" />

            <div className="absolute top-3 left-3 flex gap-2">
                {(["overview", "chase", "orbit"] as CameraMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onCameraModeChange(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                            cameraMode === mode
                                ? "bg-f1-cyan/20 border-f1-cyan/60 text-f1-cyan"
                                : "glass border-f1-border text-f1-text-muted hover:text-white"
                        }`}
                    >
                        {mode.toUpperCase()}
                    </button>
                ))}
            </div>

            <button
                onClick={onToggleAnimation}
                className="absolute top-3 right-3 glass border border-f1-border rounded-lg px-3 py-1.5 text-xs text-white hover:bg-f1-surface-hover transition-colors"
            >
                {isAnimating ? "PAUSE" : "PLAY"}
            </button>

            <div className="absolute bottom-3 left-3 text-[11px] tracking-wider text-f1-text-muted">
                REAL-TIME 3D TRACK RENDER
            </div>
        </div>
    );
}
