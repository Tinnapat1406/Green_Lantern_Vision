"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { ConstructProps, ringAnchor} from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { AdditiveBlending, type MeshBasicMaterial } from "three";
import { handScale } from "@/app/lib/scale";
import { getShieldTexture } from "@/app/lib/glow";


export function Shield({ handRef,finger }: ConstructProps) {
    const groupRef = useRef<Group>(null);
    const summon = useSummon();   
    const fillRef = useRef<MeshBasicMaterial>(null);
    const shieldTex = useMemo(() => getShieldTexture(), []);
    const rippleRef = useRef<Mesh>(null);             
    const rippleMatRef = useRef<MeshBasicMaterial>(null); 



    useFrame((state) => {
        const group = groupRef.current;
        const landmarks = handRef.current;

        if (!group || !landmarks) {
           if (group) group.visible = false;
            return;
        }
        group.visible = true;
        const pos = ringAnchor(landmarks,finger,state.size);
        group.position.set(pos.x, pos.y, 0);
        group.scale.setScalar(easeOut(summon.current) * handScale(landmarks,state.size));


        const t = state.clock.getElapsedTime();
        if (fillRef.current) {
          fillRef.current.opacity = 0.85 + Math.sin(t * 8) * 0.15;

          const wave = (t * 0.8) % 1;
          if (rippleRef.current) {
            rippleRef.current.scale.setScalar(wave);          
          }
          if (rippleMatRef.current) {
            rippleMatRef.current.opacity = 0.5 * (1 - wave);   
          }

        }
    });



    return(
      <group ref={groupRef}>
        <mesh>
          <planeGeometry args={[280, 280]} />
        <meshBasicMaterial ref={fillRef} map={shieldTex} transparent
          blending={AdditiveBlending} depthWrite={false} />
       </mesh>

       <mesh ref={rippleRef} position={[0, 0, 0.5]}>
        <planeGeometry args={[280, 280]} />
        <meshBasicMaterial ref={rippleMatRef} map={shieldTex} transparent
        blending={AdditiveBlending} depthWrite={false} />
      </mesh>

      </group>
    );
}