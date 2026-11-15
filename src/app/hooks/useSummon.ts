"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";


const EXIT_SPEED = 5; // 1 / 5 = 0.2s, must match EXIT_MS in RingScene


export function useSummon(speed = 6,leaving = false) {
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (leaving) {
      progress.current = Math.max(0, progress.current - delta * EXIT_SPEED);
    } else {
      progress.current = Math.min(1, progress.current + delta * speed);
    }
  });
  return progress
}

export function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutBack(t: number) {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

