"use client";

import { useEffect, useState, type RefObject } from "react";
import { FINGERS, type Finger } from "@/app/lib/fingers";
import { greenScore } from "@/app/lib/color";
import type { HandRef } from "@/app/lib/anchor";

const CHECK_MS = 100;
const MIN_SCORE = 0.25;
const SAMPLES = [0.25, 0.5, 0.75];   // points along the finger segment: 0 = base, 1 = joint
const MISS_LIMIT = 5;                 // 5 × 100ms = keep the ring for 0.5s after losing it
const MAX_RADIUS = 20;                // biggest sample patch is MAX_RADIUS * 2 square

export function useRingDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  handRef: HandRef,
  enabled: boolean,
) {
    const [ringFinger, setRingFinger] = useState<Finger | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Each check only looks at ~15 small patches around the finger segments, so only
    // those patches are copied out of the video — never the whole 1280×720 frame.
    // The canvas is allocated once at the largest patch size and reused every tick.
    const canvas = document.createElement("canvas");
    canvas.width = MAX_RADIUS * 2;
    canvas.height = MAX_RADIUS * 2;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    let last: Finger | null = null;
    let misses = 0;

    // Copy one patch of the video around (cx, cy) and score how green it is
    function scorePatch(video: HTMLVideoElement, cx: number, cy: number, radius: number) {
      const size = radius * 2;
      const sx = Math.round(cx - radius);
      const sy = Math.round(cy - radius);
      if (sx < 0 || sy < 0 || sx + size > video.videoWidth || sy + size > video.videoHeight) {
        return 0;
      }
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      return greenScore(ctx, radius, radius, radius);
    }

    const id = setInterval(() => {
      const video = videoRef.current;
      const landmarks = handRef.current;
      let best: Finger | null = null;

      if (video && landmarks && video.videoWidth > 0) {
        const width = video.videoWidth;
        const height = video.videoHeight;
        let bestScore = MIN_SCORE;

        for (const finger of FINGERS) {
          const a = landmarks[finger.base];
          const b = landmarks[finger.joint];
          const len = Math.hypot((b.x - a.x) * width, (b.y - a.y) * height);
          const radius = Math.min(Math.max(Math.round(len * 0.35), 4), MAX_RADIUS);

          let score = 0;
          for (const t of SAMPLES) {
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            score = Math.max(score, scorePatch(video, x * width, y * height, radius));
          }

          if (score > bestScore) {
            bestScore = score;
            best = finger;
          }
        }

      }

      if (best) {
        misses = 0;
      } else if (last) {
        misses++;
        if (misses < MISS_LIMIT) best = last;
      }

      if (best !== last) {
        last = best;
        setRingFinger(best);
      }
    }, CHECK_MS);

    return () => clearInterval(id);
  }, [videoRef, handRef, enabled]);

return ringFinger;
}
