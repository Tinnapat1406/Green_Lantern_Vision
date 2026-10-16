"use client";

import { useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type Props = {
  handRef: RefObject<NormalizedLandmark[] | null>;
};

function PalmOrb ({ handRef }: Props) {
    const meshRef = useRef<Mesh>(null);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const palm = handRef.current?.[9];
        if (!palm) {
            mesh.visible = false;
        return;            
        }
        mesh.visible = true;


        const { width, height } = state.size;
        const x = (0.5 - palm.x) * width;
        const y = (0.5 - palm.y) * height;
        mesh.position.set(x, y, 0);

    });

    return(
        <mesh ref={meshRef}>
            <sphereGeometry args={[40, 32, 32]} />        {/* รัศมี 40px */}
            <meshBasicMaterial color="#39ff14" />          {/* เขียว Green Lantern */}
        </mesh>
    );
}

export function RingScene({ handRef }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1 }}>
        <PalmOrb handRef={handRef} />
      </Canvas>
    </div>
  );
}