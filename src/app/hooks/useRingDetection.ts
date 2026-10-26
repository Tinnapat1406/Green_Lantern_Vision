"use client";

import { useEffect, useState, type RefObject } from "react";
import { FINGERS, ringPosition, type Finger } from "@/app/lib/fingers";
import { greenScore } from "@/app/lib/color";
import type { HandRef } from "@/app/lib/anchor";

const CHECK_MS = 100; 
const RADIUS = 8;
const MIN_SCORE = 0.25;

export function useRingDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  handRef: HandRef,
  enabled: boolean,
) {
    const [ringFinger, setRingFinger] = useState<Finger | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = document.createElement("canvas"); // ไม่แสดงบนจอ ใช้อ่านสีอย่างเดียว
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    let last: Finger | null = null;

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
            const spot = ringPosition(landmarks, finger);
            const score = greenScore(ctx, spot.x * canvas.width, spot.y * canvas.height, RADIUS);
            if (score > bestScore) {
                bestScore = score;
                best = finger;
            }
        }
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