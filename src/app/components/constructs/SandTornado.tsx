"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, type Points } from "three";
import type { HandRef } from "@/app/lib/anchor";
import { toScene } from "@/app/lib/coords";
import { useSummon, easeOut } from "@/app/hooks/useSummon";

const COUNT = 1500;
const HEIGHT = 320;
const BASE_RADIUS = 15;
const TOP_RADIUS = 110;

type Particles = {
  angle: Float32Array;     
  height: Float32Array;    
  speed: Float32Array;     
  positions: Float32Array; 
}

function makeParticles(): Particles {
  const p: Particles = {
    angle: new Float32Array(COUNT),
    height: new Float32Array(COUNT),
    speed: new Float32Array(COUNT),
    positions: new Float32Array(COUNT * 3),
  };

  for(let i = 0 ; i < COUNT; i++){
    p.angle[i] = Math.random() * Math.PI * 2;
    p.height[i] = Math.random();
    p.speed[i] = 3 + Math.random() * 4;
  }
  return p;

}

export function SandTornado({handRef}:{ handRef: HandRef }){
    const pointsRef = useRef<Points>(null);
    const particlesRef = useRef<Particles | null>(null);
    const summon = useSummon(3);

    useFrame((state, delta) => {
    const points = pointsRef.current;
    if(!points) return;

    const landmarks = handRef.current;
    if(!landmarks){
        points.visible =  false
        return;}

        points.visible =  true

     if (!particlesRef.current) {
      particlesRef.current = makeParticles();
      points.geometry.setAttribute("position", new BufferAttribute(particlesRef.current.positions, 3));
    }

    const p = particlesRef.current;
    const grow = easeOut(summon.current);

    const pos = landmarks[9]
    toScene(pos,state.size);
    points.position.set(pos.x,pos.y,0);

    for (let i = 0; i < COUNT; i++) {
       p.angle[i] += p.speed[i] * delta
       p.height[i] += delta * 0.4
      //         ถ้าเกิน 1 ให้ลบ 1 (วนกลับลงไปที่ฐาน)
      if(p.height[i] > 1){
        p.height[i] -= 1
      }
      const h = p.height[i];
      const r = BASE_RADIUS + (TOP_RADIUS - BASE_RADIUS) * h;
      p.positions[i * 3]     = Math.cos(p.angle[i]) * r;
      p.positions[i * 3 + 1] = h * HEIGHT * grow;
      p.positions[i * 3 + 2] = Math.sin(p.angle[i]) * r;
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial color="#d9b46a" size={3} sizeAttenuation={false} transparent opacity={0.85} depthWrite={false} />
    </points>
  );


}
