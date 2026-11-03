"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { toScene } from "@/app/lib/coords";
import { useSummon , easeOut } from "@/app/hooks/useSummon";
import { AdditiveBlending, type Mesh, type Group } from "three";
import { handScale } from "@/app/lib/scale";
import { getGlowTexture, getBeamTexture } from "@/app/lib/glow";

 
const LENGTH = 2000; 
const WIDTH = 60;



export function Beam({ handRef, finger }: ConstructProps) {
    
    const summon = useSummon();
    const groupRef = useRef<Group>(null);
    const beamRef = useRef<Mesh>(null);
    const beamTex = useMemo(() => getBeamTexture(), []);
    const glow = useMemo(() => getGlowTexture(), []);
    

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

        const s = easeOut(summon.current) * handScale(landmarks, state.size);
        const length = LENGTH * s;
        group.scale.setScalar(s);
        group.position.set(
            start.x + Math.cos(angle) * length / 2, 
            start.y + Math.sin(angle) * length / 2, 
            0,
        );

        const t = state.clock.getElapsedTime();
        if (beamRef.current) {
                beamRef.current.scale.x = 1 + Math.sin(t * 30) * 0.15;
        }
    });
    return (
   <group ref={groupRef}>
  {/* ลำแสง: แผ่นแบน ยาวตามแกน y */}
  <mesh ref={beamRef}>
    <planeGeometry args={[WIDTH, LENGTH]} />
    <meshBasicMaterial map={beamTex} transparent blending={AdditiveBlending} depthWrite={false} />
  </mesh>

  {/* แสงวาบที่ต้นลำ */}
  <sprite position={[0, -LENGTH / 2, 1]} scale={[140, 140, 1]}>
    <spriteMaterial map={glow} transparent blending={AdditiveBlending} depthWrite={false} />
  </sprite>
</group>


  );
}