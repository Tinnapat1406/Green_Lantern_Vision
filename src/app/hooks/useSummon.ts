"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function useSummon(speed = 6) {
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta * speed);  
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

