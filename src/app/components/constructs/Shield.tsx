"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { ringAnchor, type HandRef } from "@/app/lib/anchor";

export function Shield({ handRef }: { handRef: HandRef }) {
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        const group = groupRef.current;
        const landmarks = handRef.current;

        if (!group || !landmarks) {
            group?.visible && (group.visible = false);
            return;
        }
        group.visible = true;
        const pos = ringAnchor(landmarks, state.size);
        group.position.set(pos.x, pos.y, 0);
    });

    return(
        <group ref={groupRef}>
      <mesh>
        <circleGeometry args={[120, 64]} />
        <meshBasicMaterial color="#39ff14" transparent opacity={0.25} />
      </mesh>
      
      <mesh>
        <torusGeometry args={[120, 4, 16, 64]} />
        <meshBasicMaterial color="#39ff14" />
      </mesh>
    </group>
    );
}