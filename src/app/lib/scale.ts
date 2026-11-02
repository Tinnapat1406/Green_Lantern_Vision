import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { toScene } from "./coords";

const REFERENCE = 120;  // ขนาดมือ (px) ที่ถือว่า scale = 1
const MIN = 0.5;
const MAX = 2;

export function handScale(
  landmarks: NormalizedLandmark[],
  size: { width: number; height: number },
): number {
    const a = toScene(landmarks[0], size);
    const b = toScene(landmarks[9], size);
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    const scale = distance / REFERENCE
    
    return Math.min(Math.max(scale, MIN), MAX);
}
