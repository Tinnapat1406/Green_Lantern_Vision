import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { toScene } from "./coords";

const REFERENCE = 120;
const MIN = 0.5;
const MAX = 2;
const WIDTH_RATIO = 1.2;   
const SPEED = 6;

let smoothed = 0;
let lastTime = 0;

function dist(lm: NormalizedLandmark[], i: number, j: number, size: { width: number; height: number }) {
  const a = toScene(lm[i], size);
  const b = toScene(lm[j], size);
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function handScale(
  landmarks: NormalizedLandmark[],
  size: { width: number; height: number },
): number {

    const length = dist(landmarks, 0, 9, size);
    const width = dist(landmarks, 5, 17, size) * WIDTH_RATIO;
    const raw = clamp(Math.max(length, width) / REFERENCE, MIN, MAX)

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    
    smoothed += (raw - smoothed) * (1 - Math.exp(-SPEED * dt));
    return smoothed;
}
