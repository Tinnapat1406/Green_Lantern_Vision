"use client";


import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Sprite } from "three";
import { ringAnchor, type ConstructProps} from "@/app/lib/anchor";
import { makeGlowTexture } from "@/app/lib/glow";


const DURATION = 0.4;

export function RingFlash({ handRef,finger }: ConstructProps) {
    const spriteRef = useRef<Sprite>(null);
    const glow = useMemo(() => makeGlowTexture(), []);
    const age = useRef(0);

    useFrame ((state, delta) => {
        const sprite = spriteRef.current;
        const landmarks = handRef.current;

        if(!sprite || !landmarks) return;

            age.current += delta;
            const t = Math.min(1, age.current / DURATION);

            const pos = ringAnchor(landmarks,finger,state.size);
            sprite.position.set(pos.x, pos.y, 1);

            sprite.scale.setScalar(40 + t * 260); 
            sprite.material.opacity = 1 - t;
            
        
    });

    return(
        <sprite ref={spriteRef}>
            <spriteMaterial map={glow} blending={AdditiveBlending} transparent depthWrite={false} />
        </sprite>
    )

}