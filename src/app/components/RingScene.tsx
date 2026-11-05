"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, Group } from "three";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { ringPosition, type Finger } from "@/app/lib/fingers";
import { toScene } from "@/app/lib/coords";
import { gestureToConstruct } from "@/app/lib/constructs";
import { Shield } from "./constructs/Shield";
import { Beam } from "./constructs/Beam";
import { PowerOrb } from "./constructs/PowerOrb";
import { RingFlash } from "./constructs/RingFlash";
import { SandTornado } from "./constructs/SandTornado";
import { SparkleBurst } from "./constructs/SparkleBurst";
import { getGlowTexture } from "../lib/glow";
import { handScale } from "../lib/scale";


type Props = {
  handRef: RefObject<NormalizedLandmark[] | null>;
};
type MarkerProps = Props & { finger: Finger }; 



function RingMarker({ handRef, finger }: MarkerProps) {
  const groupRef = useRef<Group>(null);
  const glow = useMemo(() => getGlowTexture(), []);

  

  useFrame((state) => {
    const group = groupRef.current;
    const t = state.clock.getElapsedTime();
    if (!group) return;

    const landmarks = handRef.current;
    
    if (!landmarks) {
        group.visible = false;
        return;
        }
        group.visible = true;

        const pos = ringPosition(landmarks, finger);
        const scenePos = toScene(pos, state.size);   // ← ใช้ state.size ได้เลย
        group.position.set(scenePos.x, scenePos.y, 0);
        group.scale.setScalar((1 + Math.sin(t * 2) * 0.08)*handScale(landmarks, state.size)); 

  });

   return (
    <group ref={groupRef}>
  {/* glow ด้านหลังแหวน */}
      <sprite scale={[60, 60, 1]}>
        <spriteMaterial map={glow} transparent opacity={0.6}
          blending={AdditiveBlending} depthWrite={false} />
      </sprite>
  {/* ตัวแหวน: ห่วงทึบ บาง สีสว่าง */}
      <mesh position={[0, 0, 1]}>
        <torusGeometry args={[12, 2, 12, 48]} />
        <meshBasicMaterial color="#b6ff9e" blending={AdditiveBlending} />
      </mesh>
    </group>

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
            {construct === "sand" && <SandTornado handRef={handRef} />}
            {construct !== "none" && <RingFlash key={construct} handRef={handRef} finger={ringFinger} />}
            <SparkleBurst key={`burst-${construct}`} handRef={handRef} finger={ringFinger} />

          </>
        )}
      </Canvas>
      
    </div>
  );
}