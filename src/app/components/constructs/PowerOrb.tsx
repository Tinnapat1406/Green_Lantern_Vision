"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { ringAnchor, type HandRef } from "@/app/lib/anchor";
import { useSummon, easeOut } from "@/app/hooks/useSummon";

export function PowerOrb({ handRef }: { handRef: HandRef }) {
    const groupRef = useRef<Group>(null);
    const summon = useSummon();  

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
        const pulse = 1 + Math.sin(t * 8) * 0.15;
        group.scale.setScalar(pulse * easeOut(summon.current));


    });

    return(
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[45, 32, 32]} />
                <meshBasicMaterial color="#b6ff9e" />                     {/* แกนกลางสว่าง */}
            </mesh>
            <mesh>
                <sphereGeometry args={[70, 32, 32]} />
                <meshBasicMaterial color="#39ff14" transparent opacity={0.3} />   {/* แสงเรืองรอบนอก */}
            </mesh>
        </group>
    );
}
