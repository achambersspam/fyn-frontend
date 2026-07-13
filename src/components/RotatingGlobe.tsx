"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rotating wireframe globe drawn in hollow white lines on a canvas:
 * latitude/longitude graticule plus simplified continent outlines, rendered
 * with an orthographic projection and rotated around the polar axis.
 * No dependencies. Respects prefers-reduced-motion (renders a static frame).
 */

// Continent outlines as [lon, lat] polylines — hand-traced coarse geography
// with enough vertices for recognizable silhouettes at hero size.
const CONTINENTS: number[][][] = [
  // North America (Alaska → arctic Canada → Hudson Bay → east coast →
  // Florida → Gulf of Mexico → Central America → Pacific coast)
  [
    [-166, 61], [-164, 65], [-168, 66], [-161, 69], [-156, 71], [-148, 70],
    [-141, 69], [-133, 69], [-126, 70], [-118, 69], [-110, 68], [-102, 68],
    [-96, 71], [-90, 69], [-85, 66], [-87, 63], [-92, 62], [-94, 59],
    [-90, 57], [-85, 55], [-82, 55], [-80, 58], [-77, 62], [-72, 61],
    [-68, 59], [-64, 60], [-61, 56], [-58, 54], [-55, 52], [-56, 49],
    [-60, 47], [-65, 45], [-67, 44], [-70, 43], [-70, 42], [-74, 40],
    [-75, 38], [-76, 37], [-76, 35], [-79, 33], [-81, 31], [-81, 29],
    [-80, 26], [-81, 25], [-83, 28], [-85, 30], [-88, 30], [-90, 29],
    [-94, 29], [-97, 27], [-97, 24], [-97, 21], [-95, 18], [-94, 17],
    [-91, 16], [-88, 16], [-87, 13], [-85, 12], [-83, 10], [-80, 9],
    [-78, 8], [-80, 8], [-83, 9], [-85, 11], [-87, 13], [-90, 14],
    [-94, 16], [-97, 17], [-102, 18], [-105, 20], [-106, 24], [-110, 24],
    [-113, 27], [-115, 30], [-117, 33], [-120, 34], [-122, 37], [-124, 40],
    [-124, 43], [-124, 47], [-123, 49], [-128, 51], [-132, 54], [-136, 57],
    [-140, 60], [-146, 61], [-151, 60], [-156, 58], [-160, 59], [-163, 60],
    [-166, 61],
  ],
  // South America
  [
    [-78, 8], [-76, 9], [-73, 11], [-71, 12], [-68, 11], [-64, 10],
    [-60, 9], [-57, 6], [-54, 5], [-51, 4], [-50, 0], [-48, -1],
    [-44, -3], [-41, -3], [-38, -4], [-35, -6], [-35, -9], [-37, -11],
    [-39, -14], [-39, -17], [-40, -20], [-42, -23], [-46, -24], [-48, -26],
    [-49, -29], [-52, -32], [-54, -35], [-57, -36], [-58, -39], [-62, -39],
    [-63, -42], [-65, -43], [-65, -46], [-67, -48], [-69, -50], [-69, -52],
    [-68, -54], [-71, -54], [-73, -52], [-74, -49], [-74, -46], [-73, -43],
    [-73, -40], [-72, -37], [-71, -33], [-71, -30], [-70, -26], [-70, -22],
    [-70, -18], [-74, -15], [-76, -12], [-78, -9], [-80, -6], [-81, -4],
    [-80, -2], [-80, 1], [-78, 3], [-77, 6], [-78, 8],
  ],
  // Africa
  [
    [-6, 35], [-2, 35], [3, 37], [8, 37], [11, 37], [11, 33], [15, 32],
    [19, 31], [25, 32], [30, 31], [32, 31], [34, 28], [35, 24], [37, 21],
    [38, 18], [40, 15], [43, 11], [47, 11], [51, 12], [51, 10], [46, 5],
    [42, 0], [41, -3], [40, -7], [39, -10], [37, -13], [36, -16],
    [35, -19], [35, -22], [33, -26], [31, -29], [28, -32], [25, -34],
    [22, -34], [19, -35], [18, -32], [16, -28], [15, -25], [12, -19],
    [12, -15], [13, -11], [12, -6], [9, -2], [9, 2], [7, 4], [4, 6],
    [0, 6], [-4, 5], [-8, 4], [-11, 7], [-14, 8], [-16, 12], [-17, 15],
    [-16, 18], [-17, 21], [-15, 24], [-13, 27], [-10, 29], [-9, 31],
    [-6, 35],
  ],
  // Eurasia — one continuous landmass as on a real map (no artificial
  // Europe/Asia border line): Iberia → Mediterranean (Italy boot, Adriatic,
  // Greece) → Black Sea → Anatolia → Arabia → India → Southeast Asia →
  // China coast → Kamchatka → Bering → Arctic Siberian coast → White Sea →
  // Scandinavian peninsula → Baltic → Denmark → North Sea → Atlantic
  [
    [-9, 43], [-9, 41], [-9, 38], [-7, 37], [-5, 36], [-2, 37], [0, 39],
    [1, 41], [3, 42], [5, 43], [7, 44], [9, 44], [10, 44], [12, 44],
    [13, 43], [14, 42], [15, 41], [17, 40], [18, 40], [17, 39], [16, 38],
    [17, 39], [16, 41], [14, 42], [13, 44], [14, 45], [16, 44], [18, 42],
    [19, 42], [19, 40], [20, 39], [21, 37], [22, 36], [23, 37], [23, 38],
    [24, 38], [23, 39], [23, 40], [25, 40], [26, 40], [28, 41], [29, 41],
    [28, 43], [30, 45], [32, 46], [35, 46], [37, 45], [38, 47], [40, 47],
    [44, 47], [48, 46], [48, 42], [44, 39], [40, 38], [36, 36], [36, 32],
    [36, 28], [35, 24], [38, 21], [40, 18], [42, 15], [44, 13], [48, 14],
    [52, 15], [55, 17], [58, 20], [55, 23], [52, 25], [54, 26], [57, 26],
    [58, 24], [61, 25], [64, 25], [67, 24], [68, 23], [71, 20], [73, 16],
    [75, 11], [77, 8], [78, 9], [80, 13], [82, 16], [84, 18], [86, 20],
    [88, 22], [91, 22], [94, 18], [96, 16], [98, 12], [98, 8], [101, 4],
    [104, 2], [105, 9], [107, 12], [108, 17], [110, 20], [114, 22],
    [118, 25], [121, 28], [122, 31], [126, 35], [129, 36], [132, 40],
    [135, 43], [138, 44], [143, 46], [151, 47], [156, 51], [158, 52],
    [160, 53], [162, 56], [165, 58], [170, 60], [174, 62], [179, 65],
    [176, 66], [170, 68], [162, 70], [154, 71], [146, 72], [138, 72],
    [130, 71], [122, 72], [114, 74], [106, 77], [98, 76], [90, 75],
    [82, 73], [74, 72], [68, 70], [62, 69], [56, 68], [50, 68], [45, 67],
    [40, 66], [37, 66], [33, 66], [31, 63], [30, 60],
    [28, 60], [26, 60], [25, 61], [25, 63], [26, 65], [28, 66], [26, 68],
    [25, 69], [22, 70], [19, 70], [16, 69], [14, 68], [13, 66], [12, 64],
    [10, 63], [8, 61], [6, 60], [5, 59], [7, 58], [8, 57], [10, 57],
    [12, 56], [13, 55], [11, 54], [9, 55], [8, 56], [8, 55], [7, 54],
    [5, 53], [4, 52], [2, 51], [0, 50], [-2, 50], [-4, 48], [-2, 47],
    [-1, 45], [-2, 44], [-9, 43],
  ],
  // Australia
  [
    [114, -22], [113, -25], [114, -29], [116, -32], [118, -35], [122, -34],
    [126, -32], [130, -32], [132, -32], [134, -33], [136, -35], [138, -36],
    [140, -38], [144, -38], [147, -38], [150, -37], [152, -33], [153, -30],
    [153, -27], [152, -24], [149, -21], [147, -19], [146, -18], [145, -15],
    [143, -11], [142, -13], [140, -17], [137, -16], [136, -12], [132, -12],
    [130, -13], [127, -14], [124, -16], [122, -18], [119, -20], [116, -21],
    [114, -22],
  ],
  // Greenland
  [
    [-46, 60], [-43, 60], [-40, 63], [-32, 68], [-25, 70], [-22, 70],
    [-20, 75], [-22, 78], [-30, 79], [-38, 80], [-46, 81], [-56, 80],
    [-62, 78], [-58, 76], [-54, 73], [-55, 70], [-53, 67], [-52, 65],
    [-49, 62], [-46, 60],
  ],
  // British Isles
  [
    [-5, 50], [-3, 51], [0, 51], [1, 52], [0, 53], [-2, 55], [-2, 57],
    [-4, 58], [-5, 58], [-6, 56], [-5, 55], [-4, 54], [-5, 53], [-4, 51],
    [-5, 50],
  ],
  // Ireland
  [
    [-10, 52], [-8, 52], [-6, 52], [-6, 54], [-8, 55], [-10, 54], [-10, 52],
  ],
  // Japan
  [
    [130, 31], [131, 33], [133, 34], [135, 34], [136, 35], [140, 36],
    [141, 39], [141, 41], [142, 43], [145, 44], [142, 45], [140, 42],
    [140, 40], [138, 37], [135, 35], [132, 34], [130, 33], [130, 31],
  ],
  // Madagascar
  [
    [44, -16], [47, -15], [49, -13], [50, -16], [49, -19], [47, -23],
    [45, -25], [44, -23], [43, -20], [44, -16],
  ],
  // New Zealand
  [
    [173, -35], [175, -37], [176, -38], [178, -38], [176, -40], [174, -40],
    [173, -41], [172, -42], [170, -44], [168, -46], [167, -46], [169, -44],
    [171, -42], [173, -40], [173, -35],
  ],
  // Indonesia / Borneo hint
  [
    [95, 5], [98, 3], [101, 1], [104, -2], [106, -6], [110, -7], [114, -8],
    [116, -8],
  ],
  [
    [109, 1], [111, 3], [114, 4], [117, 6], [119, 4], [117, 0], [114, -2],
    [111, -1], [109, 1],
  ],
  // Antarctica — coastline ring around the pole, with the Antarctic
  // Peninsula reaching up toward South America and the Ross Sea indent.
  [
    [-60, -64], [-56, -66], [-52, -69], [-45, -71], [-35, -72], [-25, -71],
    [-15, -70], [-5, -70], [5, -70], [15, -70], [25, -69], [35, -68],
    [45, -67], [55, -66], [65, -67], [75, -68], [85, -66], [95, -66],
    [105, -66], [115, -66], [125, -66], [135, -66], [145, -67], [155, -69],
    [165, -72], [172, -75], [180, -78], [-172, -78], [-164, -77],
    [-155, -76], [-146, -75], [-138, -74], [-130, -74], [-120, -73],
    [-110, -73], [-100, -73], [-90, -73], [-80, -72], [-72, -70],
    [-66, -67], [-62, -65], [-60, -64],
  ],
];

// Major cities as [lon, lat] — rendered as gently pulsing royal-blue dots.
const CITIES: number[][] = [
  // United States
  [-74, 40.7], // New York City
  [-118.2, 34.1], // Los Angeles
  [-84.4, 34.0], // Roswell, Georgia
  [-84.39, 33.75], // Atlanta, Georgia
  [-80.8, 35.2], // Charlotte, North Carolina
  // Canada
  [-79.4, 43.7], // Toronto
  [-123.1, 49.3], // Vancouver
  [-73.6, 45.5], // Montreal
  // Latin America
  [-99.1, 19.4], // Mexico City
  [-58.4, -34.6], // Buenos Aires
  [-43.2, -22.9], // Rio de Janeiro
  [-47.9, -15.8], // Brasília
  // Europe
  [-0.1, 51.5], // London
  [2.35, 48.9], // Paris
  [13.4, 52.5], // Berlin
  [21.0, 52.2], // Warsaw
  [12.6, 55.7], // Copenhagen
  [-3.7, 40.4], // Madrid
  [12.5, 41.9], // Rome
  [23.7, 38.0], // Athens
  [28.98, 41.0], // Istanbul
  [37.6, 55.8], // Moscow
  // Africa
  [28.0, -26.2], // Johannesburg
  [18.4, -33.9], // Cape Town
  // Middle East
  [55.3, 25.2], // Dubai
  [46.7, 24.7], // Riyadh
  [51.5, 25.3], // Doha
  [35.2, 31.8], // Jerusalem
  // Asia
  [72.9, 19.1], // Mumbai
  [101.7, 3.1], // Kuala Lumpur
  [103.8, 1.35], // Singapore
  [106.8, -6.2], // Jakarta
  [121.0, 14.6], // Manila
  [114.2, 22.3], // Hong Kong
  [121.5, 31.2], // Shanghai
  [116.4, 39.9], // Beijing
  [127.0, 37.5], // Seoul
  [135.8, 35.0], // Kyoto
  // Oceania
  [151.2, -33.9], // Sydney
  [174.8, -36.8], // Auckland
];

const DEG = Math.PI / 180;

type Vec3 = [number, number, number];

const toSphere = (lonDeg: number, latDeg: number): Vec3 => {
  const lon = lonDeg * DEG;
  const lat = latDeg * DEG;
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
};

export default function RotatingGlobe({
  size,
  maxSize = 420,
}: {
  size?: number;
  maxSize?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // When no explicit size is passed, fill the container (a hero half-column)
  // between a floor and maxSize so the globe always fits its half and stays a
  // perfect circle at every breakpoint instead of overflowing on narrow views.
  const [measured, setMeasured] = useState<number>(size ?? maxSize);
  // Ink follows the theme: white lines on dark backgrounds, slate ink on
  // light. Tracked via the `dark` class ThemeProvider toggles on <html>.
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (size) {
      setMeasured(size);
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () =>
      setMeasured(Math.max(200, Math.min(maxSize, Math.round(wrap.clientWidth))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [size, maxSize]);

  useEffect(() => {
    const size = measured;
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
    for (let lon = 0; lon < 360; lon += 15) {
      const line: Vec3[] = [];
      for (let lat = -90; lat <= 90; lat += 3) line.push(toSphere(lon, lat));
      meridians.push(line);
    }
    const parallels: Vec3[][] = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      const line: Vec3[] = [];
      for (let lon = 0; lon <= 360; lon += 3) line.push(toSphere(lon, lat));
      parallels.push(line);
    }
    const continents: Vec3[][] = CONTINENTS.map((outline) =>
      outline.map(([lon, lat]) => toSphere(lon, lat))
    );
    const cities: Vec3[] = CITIES.map(([lon, lat]) => toSphere(lon, lat));

    const drawCities = (rotation: number, timeSeconds: number) => {
      for (let i = 0; i < cities.length; i += 1) {
        const { x, y, visible } = project(cities[i], rotation);
        if (!visible) continue;
        // Gentle asynchronous pulse per city.
        const pulse = 0.55 + 0.45 * Math.sin(timeSeconds * 2 + i * 1.7);
        const r = 1.8 + 1.2 * pulse;
        // Soft glow halo
        ctx.beginPath();
        ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(65,105,225,${0.18 * pulse})`;
        ctx.fill();
        // Core dot — royal blue
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(65,105,225,${0.55 + 0.45 * pulse})`;
        ctx.fill();
      }
    };

    // Theme ink: white lines on dark, slate-900 ink on light.
    const ink = isDark ? "255,255,255" : "15,23,42";
    const silhouetteAlpha = isDark ? 0.85 : 0.7;
    const graticuleAlpha = isDark ? 0.28 : 0.2;
    const continentAlpha = isDark ? 0.95 : 0.85;

    const drawFrame = (rotation: number, timeSeconds: number) => {
      ctx.clearRect(0, 0, size, size);
      // Sphere silhouette
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ink},${silhouetteAlpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Graticule — faint hollow lines
      for (const line of meridians) strokePolyline(line, rotation, `rgba(${ink},${graticuleAlpha})`, 0.8);
      for (const line of parallels) strokePolyline(line, rotation, `rgba(${ink},${graticuleAlpha})`, 0.8);
      // Continents — brighter outlines
      for (const outline of continents) strokePolyline(outline, rotation, `rgba(${ink},${continentAlpha})`, 1.6);
      // Major cities — pulsing royal-blue markers
      drawCities(rotation, timeSeconds);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      drawFrame(0.6, 0);
      return;
    }

    let frameId = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      const rotation = elapsed * 0.35; // ~18s per revolution
      drawFrame(rotation, elapsed);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [measured, isDark]);

  return (
    <div ref={wrapRef} className="mx-auto aspect-square w-full max-w-[420px] overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ width: measured, height: measured }}
        className="mx-auto"
        role="img"
        aria-label="Rotating wireframe globe with continent outlines"
      />
    </div>
  );
}
