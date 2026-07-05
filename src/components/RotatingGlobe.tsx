"use client";

import { useEffect, useRef } from "react";

/**
 * Rotating wireframe globe drawn in hollow white lines on a canvas:
 * latitude/longitude graticule plus simplified continent outlines, rendered
 * with an orthographic projection and rotated around the polar axis.
 * No dependencies. Respects prefers-reduced-motion (renders a static frame).
 */

// Coarse continent outlines as [lon, lat] polylines — intentionally stylized,
// enough for the silhouettes to read at hero size.
const CONTINENTS: number[][][] = [
  // North America
  [
    [-168, 66], [-158, 71], [-140, 70], [-125, 70], [-110, 68], [-95, 69],
    [-82, 62], [-75, 60], [-68, 58], [-65, 50], [-70, 44], [-75, 38],
    [-80, 32], [-81, 26], [-84, 30], [-90, 29], [-97, 26], [-97, 20],
    [-95, 16], [-90, 14], [-83, 9], [-79, 8], [-83, 12], [-88, 16],
    [-92, 18], [-97, 22], [-105, 23], [-110, 28], [-117, 33], [-122, 38],
    [-124, 44], [-124, 48], [-130, 54], [-140, 60], [-152, 60], [-165, 60],
    [-168, 66],
  ],
  // South America
  [
    [-79, 8], [-75, 10], [-70, 12], [-63, 10], [-55, 5], [-50, 0],
    [-44, -3], [-38, -6], [-35, -9], [-39, -14], [-40, -20], [-48, -26],
    [-53, -33], [-58, -38], [-62, -41], [-65, -46], [-68, -52], [-70, -54],
    [-73, -50], [-73, -44], [-72, -37], [-71, -30], [-70, -22], [-75, -15],
    [-80, -8], [-81, -3], [-79, 2], [-79, 8],
  ],
  // Africa
  [
    [-6, 35], [3, 37], [10, 37], [20, 32], [30, 31], [34, 28], [37, 22],
    [43, 12], [51, 12], [48, 5], [42, -1], [40, -8], [36, -15], [35, -22],
    [32, -29], [26, -34], [20, -35], [17, -30], [14, -22], [12, -15],
    [13, -8], [9, -1], [8, 4], [4, 6], [-4, 5], [-8, 4], [-13, 9],
    [-17, 15], [-17, 21], [-13, 27], [-9, 31], [-6, 35],
  ],
  // Europe
  [
    [-9, 43], [-8, 37], [-1, 36], [3, 42], [8, 44], [12, 45], [16, 41],
    [19, 40], [23, 36], [26, 38], [29, 41], [33, 45], [39, 47], [48, 46],
    [50, 52], [44, 56], [37, 60], [30, 60], [28, 66], [22, 69], [15, 68],
    [11, 64], [8, 58], [5, 58], [1, 51], [-4, 50], [-9, 43],
  ],
  // Asia
  [
    [48, 46], [55, 45], [62, 44], [72, 42], [80, 44], [90, 46], [100, 50],
    [110, 52], [120, 53], [130, 52], [140, 54], [150, 60], [160, 62],
    [170, 66], [178, 65], [170, 60], [162, 56], [156, 51], [143, 46],
    [135, 43], [129, 35], [122, 30], [117, 23], [109, 18], [105, 10],
    [104, 2], [98, 8], [95, 16], [88, 22], [80, 15], [77, 8], [73, 16],
    [68, 24], [60, 25], [57, 27], [52, 30], [48, 30], [44, 38], [48, 46],
  ],
  // Australia
  [
    [114, -22], [118, -20], [125, -14], [132, -12], [137, -14], [141, -13],
    [143, -11], [146, -18], [149, -21], [153, -27], [151, -33], [146, -39],
    [140, -38], [135, -35], [129, -32], [124, -33], [117, -35], [114, -30],
    [114, -22],
  ],
  // Greenland
  [
    [-46, 60], [-42, 62], [-32, 68], [-25, 71], [-20, 75], [-30, 79],
    [-45, 80], [-58, 76], [-55, 70], [-52, 65], [-46, 60],
  ],
];

const DEG = Math.PI / 180;

type Vec3 = [number, number, number];

const toSphere = (lonDeg: number, latDeg: number): Vec3 => {
  const lon = lonDeg * DEG;
  const lat = latDeg * DEG;
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
};

export default function RotatingGlobe({ size = 380 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = size * 0.42;
    const cx = size / 2;
    const cy = size / 2;
    // Slight axial tilt so the rotation reads as a globe, not a spinning disc.
    const tilt = 18 * DEG;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    const project = (point: Vec3, rotation: number) => {
      const [x0, y0, z0] = point;
      // Rotate around Y (polar axis)
      const x1 = x0 * Math.cos(rotation) + z0 * Math.sin(rotation);
      const z1 = -x0 * Math.sin(rotation) + z0 * Math.cos(rotation);
      // Apply axial tilt around X
      const y2 = y0 * cosT - z1 * sinT;
      const z2 = y0 * sinT + z1 * cosT;
      return { x: cx + x1 * radius, y: cy - y2 * radius, visible: z2 > 0 };
    };

    const strokePolyline = (
      points: Vec3[],
      rotation: number,
      color: string,
      width: number
    ) => {
      ctx.beginPath();
      let penDown = false;
      for (const p of points) {
        const { x, y, visible } = project(p, rotation);
        if (!visible) {
          penDown = false;
          continue;
        }
        if (penDown) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        penDown = true;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    // Precompute geometry as unit vectors.
    const meridians: Vec3[][] = [];
    for (let lon = 0; lon < 360; lon += 30) {
      const line: Vec3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) line.push(toSphere(lon, lat));
      meridians.push(line);
    }
    const parallels: Vec3[][] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const line: Vec3[] = [];
      for (let lon = 0; lon <= 360; lon += 5) line.push(toSphere(lon, lat));
      parallels.push(line);
    }
    const continents: Vec3[][] = CONTINENTS.map((outline) =>
      outline.map(([lon, lat]) => toSphere(lon, lat))
    );

    const drawFrame = (rotation: number) => {
      ctx.clearRect(0, 0, size, size);
      // Sphere silhouette
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Graticule — faint hollow white lines
      for (const line of meridians) strokePolyline(line, rotation, "rgba(255,255,255,0.28)", 0.8);
      for (const line of parallels) strokePolyline(line, rotation, "rgba(255,255,255,0.28)", 0.8);
      // Continents — brighter white outlines
      for (const outline of continents) strokePolyline(outline, rotation, "rgba(255,255,255,0.95)", 1.6);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      drawFrame(0.6);
      return;
    }

    let frameId = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const rotation = ((now - start) / 1000) * 0.35; // ~18s per revolution
      drawFrame(rotation);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="mx-auto"
      role="img"
      aria-label="Rotating wireframe globe with continent outlines"
    />
  );
}
