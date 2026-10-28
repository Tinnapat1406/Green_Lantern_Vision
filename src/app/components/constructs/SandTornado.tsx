"use client";

import { useRef, useMemo} from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, type Points ,Color} from "three";
import type { HandRef } from "@/app/lib/anchor";
import { toScene } from "@/app/lib/coords";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { makeDotTexture } from "@/app/lib/glow";



const COUNT = 3000;
const HEIGHT = 320;
const BASE_RADIUS = 20;
const TOP_RADIUS = 110;
const PALETTE = ["#39ff14", "#b6ff9e", "#298d17", "#447e5c", "#e8ffe0"].map((hex) => new Color(hex));
const LAG = 4; 

type Particles = {
  angle: Float32Array;     
  height: Float32Array;    
  speed: Float32Array;   
  spread : Float32Array  
  positions: Float32Array; 
  colors: Float32Array;
  tint: Float32Array;

}

function makeParticles(): Particles {
  const p: Particles = {
    angle: new Float32Array(COUNT),
    height: new Float32Array(COUNT),
    speed: new Float32Array(COUNT),
    spread : new Float32Array(COUNT),
    positions: new Float32Array(COUNT * 3),
    colors: new Float32Array(COUNT * 4),
    tint: new Float32Array(COUNT * 3),

  };

  for(let i = 0 ; i < COUNT; i++){
    p.angle[i] = Math.random() * Math.PI * 2;
    p.height[i] = Math.random();
    p.speed[i] = 3 + Math.random() * 4;
    p.spread[i] = 0.4 + Math.random() * 0.6;
    
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    p.tint[i * 3]     = c.r;
    p.tint[i * 3 + 1] = c.g;
    p.tint[i * 3 + 2] = c.b;

  }
  return p;

}

export function SandTornado({handRef}:{ handRef: HandRef }){
    const pointsRef = useRef<Points>(null);
    const particlesRef = useRef<Particles | null>(null);
    const lagRef = useRef<{ x: number; y: number } | null>(null);
    const summon = useSummon(3);
    const dot = useMemo(() => makeDotTexture(), []);


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
      points.geometry.setAttribute("color", new BufferAttribute(particlesRef.current.colors, 4));

    }

    const p = particlesRef.current;
    const grow = easeOut(summon.current);

    const pos = toScene(landmarks[9],state.size);
    points.position.set(pos.x,pos.y,0);

    if (!lagRef.current) {
      lagRef.current = { x: pos.x, y: pos.y };
    }
    const lag = lagRef.current;
    const follow = Math.min(1, delta * LAG);

    lag.x += (pos.x - lag.x) * follow;
    lag.y += (pos.y - lag.y) * follow;

    const dx = lag.x - pos.x;   
    const dy = lag.y - pos.y;
    
    for (let i = 0; i < COUNT; i++) {
       p.angle[i] += p.speed[i] * delta
       p.height[i] += delta * 0.4

      p.colors[i * 4]     = p.tint[i * 3];
      p.colors[i * 4 + 1] = p.tint[i * 3 + 1];
      p.colors[i * 4 + 2] = p.tint[i * 3 + 2];


      if(p.height[i] > 1){
        p.height[i] -= 1
      }
      const h = p.height[i];
      const r = (BASE_RADIUS + (TOP_RADIUS - BASE_RADIUS) * h) * p.spread[i];
      const bend = h * h;
      p.positions[i * 3]     = Math.cos(p.angle[i]) * r + dx * bend;
      p.positions[i * 3 + 1] = h * HEIGHT * grow     + dy * bend;

      p.positions[i * 3 + 2] = Math.sin(p.angle[i]) * r;
      
      const fade = Math.min(h / 0.15, (1 - h) / 0.3, 1);  
      p.colors[i * 4 + 3] = fade;  

    }
    
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;

  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial vertexColors color="#ffffff" map={dot} size={6} sizeAttenuation={false} transparent opacity={0.85} depthWrite={false} />
    </points>
  );


}
