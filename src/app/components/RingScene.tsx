"use client";

import { useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { ringPosition, type Finger } from "@/app/lib/fingers";
import { toScene } from "@/app/lib/coords";
import { gestureToConstruct } from "@/app/lib/constructs";
import { Shield } from "./constructs/Shield";
import { Beam } from "./constructs/Beam";
import { PowerOrb } from "./constructs/PowerOrb";
import { RingFlash } from "./constructs/RingFlash";


type Props = {
  handRef: RefObject<NormalizedLandmark[] | null>;
};
type MarkerProps = Props & { finger: Finger }; 



function RingMarker({ handRef, finger }: MarkerProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const landmarks = handRef.current;
    
    if (!landmarks) {
        mesh.visible = false;
        return;
        }
        mesh.visible = true;

        const pos = ringPosition(landmarks, finger);
        const scenePos = toScene(pos, state.size);   // ← ใช้ state.size ได้เลย
        mesh.position.set(scenePos.x, scenePos.y, 0);

  });

   return (
    <mesh ref={meshRef}>
      <torusGeometry args={[14, 3, 12, 32]} />   {/* ห่วงรัศมี 14px หนา 3px */}
      <meshBasicMaterial color="#298d17" wireframe />
    </mesh>
  );
}

type SceneProps = Props & {
  gesture: string | null;
  ringFinger: Finger | null;
};

export function RingScene({ handRef, gesture, ringFinger }: SceneProps) {
  const construct = gestureToConstruct(gesture);
  
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1 }}>
        
        {ringFinger && (
          <>
            <RingMarker handRef={handRef} finger={ringFinger} />
            {construct === "shield" && <Shield handRef={handRef} finger={ringFinger} />}
            {construct === "beam" && <Beam handRef={handRef} finger={ringFinger} />}
            {construct === "orb" && <PowerOrb handRef={handRef} finger={ringFinger} />}
            {construct !== "none" && <RingFlash key={construct} handRef={handRef} finger={ringFinger} />}
          </>
        )}
      </Canvas>
    </div>
  );
}