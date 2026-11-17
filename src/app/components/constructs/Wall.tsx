"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { useSummon, easeOutBack } from "@/app/hooks/useSummon";
import { handScale } from "@/app/lib/scale";
import { getPanelTexture } from "@/app/lib/glow";

const COLS = 4;
const ROWS = 4;
const BRICK_W = 80;
const BRICK_H = 44;
const ROW_DELAY = 0.18;   // each row starts this much later in the summon
const COL_DELAY = 0.05;   // and each brick in a row a little later still
const LAST_DELAY = (ROWS - 1) * ROW_DELAY + (COLS - 1) * COL_DELAY;

// Brick layout: rows build from the bottom up, odd rows shifted half a brick
const BRICKS = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  const shift = row % 2 === 1 ? BRICK_W / 2 : 0;
  return {
    x: (col - (COLS - 1) / 2) * BRICK_W + shift - BRICK_W / 4,
    y: row * BRICK_H,
    delay: row * ROW_DELAY + col * COL_DELAY,
  };
});

export function Wall({ handRef, finger, leaving }: ConstructProps) {
  const groupRef = useRef<Group>(null);
  const summon = useSummon(2.5, leaving);
  const panel = useMemo(() => getPanelTexture(), []);

  useFrame((state) => {
    const group = groupRef.current;
    const landmarks = handRef.current;

    if (!group || !landmarks) {
      if (group) group.visible = false;
      return;
    }
    group.visible = true;

    const pos = ringAnchor(landmarks, finger, state.size);
    group.position.set(pos.x, pos.y, 0);
    group.scale.setScalar(handScale(landmarks, state.size));

    // Stretch overall progress so the last brick still finishes at 1
    const p = summon.current * (1 + LAST_DELAY);
    const t = state.clock.getElapsedTime();

    group.children.forEach((child, i) => {
      const brick = BRICKS[i];
      const local = Math.min(1, Math.max(0, p - brick.delay));
      child.scale.setScalar(local > 0 ? easeOutBack(local) : 0);

      // Shimmer ripples upward through the wall
      const mat = (child as Mesh).material as MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t * 4 - brick.y * 0.05) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {BRICKS.map((brick, i) => (
        <mesh key={i} position={[brick.x, brick.y, 0]}>
          <planeGeometry args={[BRICK_W - 4, BRICK_H - 4]} />
          <meshBasicMaterial map={panel} transparent blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
