"use client";

import { useEffect, useRef, useState } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { HandRef } from "@/app/lib/anchor";

// An upright open hand in the middle of the frame, in MediaPipe's 0–1 coordinates
const POSE: [number, number][] = [
  [0.5, 0.85],                                                   // 0 wrist
  [0.455, 0.8], [0.425, 0.75], [0.405, 0.7], [0.39, 0.66],       // 1–4 thumb
  [0.465, 0.66], [0.46, 0.58], [0.457, 0.52], [0.455, 0.47],     // 5–8 index
  [0.495, 0.65], [0.495, 0.56], [0.495, 0.5], [0.495, 0.45],     // 9–12 middle
  [0.525, 0.66], [0.528, 0.58], [0.53, 0.53], [0.532, 0.49],     // 13–16 ring
  [0.555, 0.68], [0.56, 0.62], [0.563, 0.58], [0.566, 0.55],     // 17–20 pinky
];

// The ghost hand drifts gently, so constructs that trail behind the hand still move
function ghostHand(seconds: number): NormalizedLandmark[] {
  const dx = Math.sin(seconds * 0.9) * 0.05;
  const dy = Math.sin(seconds * 1.3) * 0.015;
  return POSE.map(([x, y]) => ({ x: x + dx, y: y + dy, z: 0, visibility: 1 }));
}

// A hand ref for the scene: the live hand when there is one,
// otherwise the ghost hand while a demo is on
export function useDemoHand(live: HandRef, demo: boolean): HandRef {
  const demoOn = useRef(demo);
  useEffect(() => {
    demoOn.current = demo;
  }, [demo]);

  // Created once; the getter is only read inside useFrame, never during render
  const [ref] = useState<HandRef>(() => ({
    get current() {
      if (live.current) return live.current;
      return demoOn.current ? ghostHand(performance.now() / 1000) : null;
    },
  }));
  return ref;
}
