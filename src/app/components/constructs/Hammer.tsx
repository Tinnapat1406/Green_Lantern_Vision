"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group, type MeshBasicMaterial, type Sprite } from "three";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { toScene } from "@/app/lib/coords";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { handScale } from "@/app/lib/scale";
import { getBeamTexture, getGlowTexture, getPanelTexture } from "@/app/lib/glow";

const HANDLE = 220;        // handle length (px at scale 1)
const HEAD_W = 170;
const HEAD_H = 95;
const SWING_PERIOD = 1.6;  // seconds per wind-up → smash → recover
const WINDUP = 0.45;       // radians, leaning back
const SMASH = -0.35;       // radians, past upright on impact
const IMPACT = 0.15;       // fraction of the period the shockwave lasts

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Swing angle and impact strength (1 → 0) for a point in the swing cycle
function swing(phase: number) {
  if (phase < 0.6) return { angle: WINDUP * easeInOut(phase / 0.6), impact: 0 };
  if (phase < 0.7) {
    const t = (phase - 0.6) / 0.1;
    return { angle: WINDUP + (SMASH - WINDUP) * t * t, impact: 0 };
  }
  const t = (phase - 0.7) / 0.3;
  return {
    angle: SMASH * (1 - easeOut(t)),
    impact: Math.max(0, 1 - (phase - 0.7) / IMPACT),
  };
}

export function Hammer({ handRef, finger, leaving }: ConstructProps) {
  const groupRef = useRef<Group>(null);
  const swingRef = useRef<Group>(null);
  const headMatRef = useRef<MeshBasicMaterial>(null);
  const shockRef = useRef<Sprite>(null);
  const summon = useSummon(6, leaving);
  const beamTex = useMemo(() => getBeamTexture(), []);
  const panel = useMemo(() => getPanelTexture(), []);
  const glow = useMemo(() => getGlowTexture(), []);

  useFrame((state) => {
    const group = groupRef.current;
    const landmarks = handRef.current;

    if (!group || !landmarks) {
      if (group) group.visible = false;
      return;
    }
    group.visible = true;

    // Point the handle the same way as the hand (wrist → base of middle finger)
    const start = ringAnchor(landmarks, finger, state.size);
    const wrist = toScene(landmarks[0], state.size);
    const knuckle = toScene(landmarks[9], state.size);
    const angle = Math.atan2(knuckle.y - wrist.y, knuckle.x - wrist.x);

    group.position.set(start.x, start.y, 0);
    group.rotation.z = angle - Math.PI / 2;
    group.scale.setScalar(easeOut(summon.current) * handScale(landmarks, state.size));

    const t = state.clock.getElapsedTime();
    const { angle: lean, impact } = swing((t / SWING_PERIOD) % 1);
    if (swingRef.current) swingRef.current.rotation.z = lean;

    if (headMatRef.current) headMatRef.current.opacity = 0.75 + impact * 0.25;
    if (shockRef.current) {
      shockRef.current.visible = impact > 0;
      shockRef.current.scale.setScalar(160 + (1 - impact) * 260);
      shockRef.current.material.opacity = impact;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pivots at the ring, so the whole hammer swings around your hand */}
      <group ref={swingRef}>
        {/* Handle */}
        <mesh position={[0, HANDLE / 2, 0]}>
          <planeGeometry args={[22, HANDLE]} />
          <meshBasicMaterial map={beamTex} transparent blending={AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Head */}
        <mesh position={[0, HANDLE, 1]}>
          <planeGeometry args={[HEAD_W, HEAD_H]} />
          <meshBasicMaterial ref={headMatRef} map={panel} transparent blending={AdditiveBlending} depthWrite={false} />
        </mesh>
        <sprite position={[0, HANDLE, 0.5]} scale={[HEAD_W * 1.6, HEAD_W * 1.6, 1]}>
          <spriteMaterial map={glow} transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} />
        </sprite>

        {/* Shockwave on impact */}
        <sprite ref={shockRef} position={[0, HANDLE, 2]}>
          <spriteMaterial map={glow} transparent blending={AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>
    </group>
  );
}
