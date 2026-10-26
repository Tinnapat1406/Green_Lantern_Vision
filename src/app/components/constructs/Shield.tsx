"use client";

import { useRef,useMemo} from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { ConstructProps, ringAnchor} from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { makeGlowTexture } from "@/app/lib/glow";
import { AdditiveBlending, type MeshBasicMaterial } from "three";


export function Shield({ handRef,finger }: ConstructProps) {
    const groupRef = useRef<Group>(null);
    const summon = useSummon();   
    const fillRef = useRef<MeshBasicMaterial>(null);
    const glow = useMemo(() => makeGlowTexture(), []);

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
        group.scale.setScalar(easeOut(summon.current))

        const t = state.clock.getElapsedTime();
        if (fillRef.current) {
          fillRef.current.opacity = 0.25 + Math.sin(t * 8) * 0.05;
        }
    });



    return(
    <group ref={groupRef}>
      <mesh>
        <circleGeometry args={[120, 64]} />
        <meshBasicMaterial ref={fillRef} color="#3b842e" transparent opacity={0.2}
          blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[120, 4, 16, 64]} />
        <meshBasicMaterial color="#b6ff9e" blending={AdditiveBlending} />   {/* ขอบสว่างกว่าเนื้อ */}
      </mesh>
    </group>
    );
}