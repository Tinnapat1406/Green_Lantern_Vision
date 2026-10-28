"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, Color, type Points } from "three";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { easeOut } from "@/app/hooks/useSummon";
import { makeDotTexture } from "@/app/lib/glow";

const COUNT = 200;
const DURATION = 0.7;
const PALETTE = ["#39ff14", "#b6ff9e", "#e8ffe0", "#ffffff"].map((hex) => new Color(hex));

type Sparks = {
    dx : Float32Array;
    dy : Float32Array;
    positions : Float32Array;
    colors : Float32Array;
}

function makeSparks(): Sparks {
  const s: Sparks = {
    dx: new Float32Array(COUNT),
    dy: new Float32Array(COUNT),
    positions: new Float32Array(COUNT * 3),
    colors: new Float32Array(COUNT * 4),
  };
  for (let i = 0; i < COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 220;
    s.dx[i] = Math.cos(angle) * dist;
    s.dy[i] = Math.sin(angle) * dist;

    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    s.colors[i * 4] = c.r;
    s.colors[i * 4 + 1] = c.g;
    s.colors[i * 4 + 2] = c.b;
  }
  return s;
}

export function SparkleBurst({ handRef, finger }: ConstructProps) {
  const pointsRef = useRef<Points>(null);
  const sparksRef = useRef<Sparks | null>(null);
  const age = useRef(0);
  const dot = useMemo(() => makeDotTexture(), []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    const landmarks = handRef.current;
    if (!points || !landmarks) return;

    
    if (!sparksRef.current) {
      sparksRef.current = makeSparks();
      points.geometry.setAttribute("position", new BufferAttribute(sparksRef.current.positions, 3));
      points.geometry.setAttribute("color", new BufferAttribute(sparksRef.current.colors, 4));
      const pos = ringAnchor(landmarks, finger, state.size);
      points.position.set(pos.x, pos.y, 2);
    }

    age.current += delta;
    const t = Math.min(1, age.current / DURATION);
    if (t >= 1) {
      points.visible = false;
      return;
    }

    const s = sparksRef.current;
    const travel = easeOut(t);

    for(let i = 0; i < COUNT; i++){
        s.positions[i * 3]     = s.dx[i] * travel;
        s.positions[i * 3 + 1] = s.dy[i] * travel;
        s.positions[i * 3 + 2] = 0;

        s.colors[i * 4 + 3]
        s.colors[1-t]
        s.colors[(0.5 + 0.5 * Math.sin(age.current * 40 + i))]


    }
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;

    });

    return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial vertexColors map={dot} size={5} sizeAttenuation={false}
        transparent blending={AdditiveBlending} depthWrite={false} />
    </points>
  );

}
