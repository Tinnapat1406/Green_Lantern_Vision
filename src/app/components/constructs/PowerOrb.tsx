"use client";

import { useRef,useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group , AdditiveBlending} from "three";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { makeGlowTexture } from "@/app/lib/glow";



export function PowerOrb({ handRef, finger }: ConstructProps) {
    const groupRef = useRef<Group>(null);
    const summon = useSummon();  
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

        const t = state.clock.getElapsedTime();
        const pulse = 1 + Math.sin(t * 8) * 0.50;
        group.scale.setScalar(pulse * easeOut(summon.current));


    });

    return(
        <group ref={groupRef}>
            <sprite scale={[450, 450, 1]}>
                <spriteMaterial map={glow} blending={AdditiveBlending} transparent depthWrite={false} />
            </sprite>
        </group>
    );
}
