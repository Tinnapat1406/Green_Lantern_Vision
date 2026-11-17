"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group, type Sprite } from "three";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { handScale } from "@/app/lib/scale";
import { getGlowTexture } from "@/app/lib/glow";

const LINKS = 12;
const LINK_LENGTH = 24;    // distance between link centers (px at scale 1)
const GRAVITY = 1800;      // px/s², pulls the chain down the screen
const DAMPING = 0.985;     // 1 = swings forever, lower = settles faster
const ITERATIONS = 10;     // more = stiffer links
const MAX_DT = 1 / 30;     // a long frame would make the simulation explode
const BALL_SIZE = 110;
const LINK_STRETCH = 1.6;  // oval links, long enough to overlap their neighbours

type Rope = { x: Float32Array; y: Float32Array; px: Float32Array; py: Float32Array };

function makeRope(x: number, y: number): Rope {
  const rope: Rope = {
    x: new Float32Array(LINKS + 1),
    y: new Float32Array(LINKS + 1),
    px: new Float32Array(LINKS + 1),
    py: new Float32Array(LINKS + 1),
  };
  rope.x.fill(x);
  rope.px.fill(x);
  // Start as a short vertical line so the links know which way to unfold
  for (let i = 0; i <= LINKS; i++) {
    rope.y[i] = y - i;
    rope.py[i] = y - i;
  }
  return rope;
}

export function Chain({ handRef, finger, leaving }: ConstructProps) {
  const linksRef = useRef<Group>(null);
  const ballRef = useRef<Sprite>(null);
  const ropeRef = useRef<Rope | null>(null);
  const summon = useSummon(4, leaving);
  const glow = useMemo(() => getGlowTexture(), []);

  useFrame((state, delta) => {
    const links = linksRef.current;
    const ball = ballRef.current;
    const landmarks = handRef.current;

    if (!links || !ball || !landmarks) {
      if (links) links.visible = false;
      if (ball) ball.visible = false;
      return;
    }
    links.visible = true;
    ball.visible = true;

    const anchor = ringAnchor(landmarks, finger, state.size);
    const k = handScale(landmarks, state.size);
    const grow = easeOut(summon.current);
    const segment = LINK_LENGTH * k * grow;

    if (!ropeRef.current) ropeRef.current = makeRope(anchor.x, anchor.y);
    const rope = ropeRef.current;
    const dt = Math.min(delta, MAX_DT);

    // Verlet: each point keeps its own velocity (pos - prev) and falls under gravity
    for (let i = 1; i <= LINKS; i++) {
      const vx = (rope.x[i] - rope.px[i]) * DAMPING;
      const vy = (rope.y[i] - rope.py[i]) * DAMPING;
      rope.px[i] = rope.x[i];
      rope.py[i] = rope.y[i];
      rope.x[i] += vx;
      rope.y[i] += vy - GRAVITY * dt * dt;
    }

    // Constraints: pin the first point to the ring, keep every link the same length
    for (let n = 0; n < ITERATIONS; n++) {
      rope.x[0] = anchor.x;
      rope.y[0] = anchor.y;
      for (let i = 0; i < LINKS; i++) {
        const dx = rope.x[i + 1] - rope.x[i];
        const dy = rope.y[i + 1] - rope.y[i];
        const dist = Math.hypot(dx, dy) || 0.0001;
        const diff = (dist - segment) / dist;
        if (i === 0) {
          rope.x[1] -= dx * diff;
          rope.y[1] -= dy * diff;
        } else {
          rope.x[i] += dx * diff * 0.5;
          rope.y[i] += dy * diff * 0.5;
          rope.x[i + 1] -= dx * diff * 0.5;
          rope.y[i + 1] -= dy * diff * 0.5;
        }
      }
    }

    // Place each link between its two points; every other link is turned edge-on
    links.children.forEach((link, i) => {
      const dx = rope.x[i + 1] - rope.x[i];
      const dy = rope.y[i + 1] - rope.y[i];
      link.position.set((rope.x[i] + rope.x[i + 1]) / 2, (rope.y[i] + rope.y[i + 1]) / 2, i % 2);
      // ZYX = turn edge-on first, then point along the chain
      link.rotation.set(0, i % 2 === 1 ? Math.PI / 2 : 0, Math.atan2(dy, dx) - Math.PI / 2, "ZYX");
      const s = k * grow;
      link.scale.set(s, s * LINK_STRETCH, s);
    });

    // Glowing weight at the end, beating like the orb
    const t = state.clock.getElapsedTime();
    ball.position.set(rope.x[LINKS], rope.y[LINKS], 2);
    ball.scale.setScalar(BALL_SIZE * k * grow * (1 + Math.sin(t * 6) * 0.1));
  });

  return (
    <>
      <group ref={linksRef}>
        {Array.from({ length: LINKS }, (_, i) => (
          <mesh key={i} scale={0}>
            {/* A torus, stretched into an oval link each frame */}
            <torusGeometry args={[9, 2.5, 8, 24]} />
            <meshBasicMaterial color="#7dff5a" transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <sprite ref={ballRef} scale={0}>
        <spriteMaterial map={glow} transparent blending={AdditiveBlending} depthWrite={false} />
      </sprite>
    </>
  );
}
