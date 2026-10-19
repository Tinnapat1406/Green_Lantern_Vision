"use client";

import { useRef,useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group , AdditiveBlending, CanvasTexture,} from "three";
import { ringAnchor, type HandRef } from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1)");     
  g.addColorStop(0.2, "rgba(182, 255, 158, 0.9)"); 
  g.addColorStop(0.5, "rgba(57, 255, 20, 0.35)");  
  g.addColorStop(1, "rgba(57, 255, 20, 0)");       

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}


export function PowerOrb({ handRef }: { handRef: HandRef }) {
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
        const pos = ringAnchor(landmarks, state.size);
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
