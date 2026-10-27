"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { toScene } from "@/app/lib/coords";
import { useSummon , easeOut } from "@/app/hooks/useSummon";
import { AdditiveBlending, type Group } from "three";


const LENGTH = 2000; 

export function Beam({ handRef, finger }: ConstructProps) {
    
    const summon = useSummon();
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        const group = groupRef.current;
        const landmarks = handRef.current;
        
        
        

        if (!group || !landmarks) {
            if (group) group.visible = false;  
            return;
        }
        group.visible = true;
        const start = ringAnchor(landmarks,finger,state.size);   
        const tip = toScene(landmarks[8], state.size); 
         

        const angle = Math.atan2(tip.y - start.y, tip.x - start.x);

        
        group.rotation.z = angle - Math.PI / 2;

        const length = LENGTH * easeOut(summon.current); 
        group.scale.setScalar(easeOut(summon.current));
        group.position.set(
            start.x + Math.cos(angle) * length / 2, 
            start.y + Math.sin(angle) * length / 2, 
            0,
        );
    });
    return (
   <group ref={groupRef}>
  
        <mesh>
            <cylinderGeometry args={[8, 8, LENGTH, 16]} />
            <meshBasicMaterial color="#e8ffe0" blending={AdditiveBlending} />
        </mesh>
  
        <mesh>
            <cylinderGeometry args={[30, 30, LENGTH, 16]} />
            <meshBasicMaterial color="#39ff14" transparent opacity={0.25}
            blending={AdditiveBlending} depthWrite={false} />
        </mesh>
</group>

  );
}