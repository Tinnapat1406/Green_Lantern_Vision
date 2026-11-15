"use client";

import { useEffect, useState, type RefObject } from "react";
import { FINGERS, type Finger } from "@/app/lib/fingers";
import { greenScore } from "@/app/lib/color";
import type { HandRef } from "@/app/lib/anchor";

const CHECK_MS = 100; 
const MIN_SCORE = 0.25;
const SAMPLES = [0.25, 0.5, 0.75];   // points along the finger segment: 0 = base, 1 = joint
const MISS_LIMIT = 5;                 // 5 × 100ms = keep the ring for 0.5s after losing it

export function useRingDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  handRef: HandRef,
  enabled: boolean,
) {
    const [ringFinger, setRingFinger] = useState<Finger | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = document.createElement("canvas"); 
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    let last: Finger | null = null;
    let misses = 0; 


    const id = setInterval(() => {
      const video = videoRef.current;
      const landmarks = handRef.current;
      let best: Finger | null = null;

      if (video && landmarks) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        let bestScore = MIN_SCORE;

        for (const finger of FINGERS) {
          const a = landmarks[finger.base];
          const b = landmarks[finger.joint];
          const len = Math.hypot((b.x - a.x) * canvas.width, (b.y - a.y) * canvas.height);
          const radius = Math.min(Math.max(Math.round(len * 0.35), 4), 20);

          let score = 0;
          for (const t of SAMPLES) {
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            score = Math.max(score, greenScore(ctx, x * canvas.width, y * canvas.height, radius));
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