"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { ringAnchor, type HandRef } from "@/app/lib/anchor";
import { toScene } from "@/app/lib/coords";
import { useSummon , easeOut } from "@/app/hooks/useSummon";
import { group } from "console";


const LENGTH = 2000; 

export function Beam({ handRef }: { handRef: HandRef }) {
    const meshRef = useRef<Mesh>(null);
    const summon = useSummon();  

    useFrame((state) => {
        const mesh = meshRef.current;
        const landmarks = handRef.current;

        if (!mesh || !landmarks) {
            if (group) group.visible = false;   
            return;
        }
        mesh.visible = true;
        const start = ringAnchor(landmarks, state.size);   
        const tip = toScene(landmarks[8], state.size);  

        const angle = Math.atan2(tip.y - start.y, tip.x - start.x);

        mesh?.position.set(
            start.x + Math.cos(angle) * LENGTH / 2, 
            start.y + Math.sin(angle) * LENGTH / 2, 
            0,
        );
        mesh.rotation.z = angle - Math.PI / 2;

        const length = LENGTH * easeOut(summon.current); 
        mesh.scale.setScalar(easeOut(summon.current));
        mesh.position.set(
            start.x + Math.cos(angle) * length / 2, 
            start.y + Math.sin(angle) * length / 2, 
            0,
        );
    });
    return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[10, 10, LENGTH, 16]} />
      <meshBasicMaterial color="#39ff14" transparent opacity={0.8} />
    </mesh>
  );
}