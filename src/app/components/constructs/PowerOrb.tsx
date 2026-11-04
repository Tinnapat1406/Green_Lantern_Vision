"use client";

import { useRef,useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group , AdditiveBlending,type Sprite} from "three";
import { ringAnchor, type ConstructProps } from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";
import { getGlowTexture } from "@/app/lib/glow";
import { handScale } from "@/app/lib/scale";



export function PowerOrb({ handRef, finger }: ConstructProps) {
    const groupRef = useRef<Group>(null);
    const summon = useSummon();  
    const glow = useMemo(() => getGlowTexture(), []); 
    const coreRef = useRef<Sprite>(null);
    const midRef = useRef<Sprite>(null);
    const outerRef = useRef<Sprite>(null);


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
        group.scale.setScalar(easeOut(summon.current) * handScale(landmarks, state.size));

        if (coreRef.current) {
            coreRef.current.scale.setScalar(120 * (1 + Math.sin(t * 20) * 0.05)); 
        }
        if (midRef.current) {
            midRef.current.scale.setScalar(260 * (1 + Math.sin(t * 8) * 0.15)); 
        }
        if (outerRef.current) {
            outerRef.current.scale.setScalar(450 * (1 + Math.sin(t * 3) * 0.25)); 
        }

    });

    return(
        <group ref={groupRef}>
            <sprite ref={outerRef}>
                <spriteMaterial map={glow} transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} />
            </sprite>
            <sprite ref={midRef}>
                <spriteMaterial map={glow} transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} />
            </sprite>
            <sprite ref={coreRef}>
                <spriteMaterial map={glow} color="#ffffff" transparent blending={AdditiveBlending} depthWrite={false} />
            </sprite>
        </group>

    );
}
