import type { RefObject } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { type Finger, ringPosition } from "./fingers";
import { toScene } from "./coords";

export type HandRef = RefObject<NormalizedLandmark[] | null>;

export type ConstructProps ={
    handRef: HandRef;
    finger: Finger;
}

export function ringAnchor(
    landmarks: NormalizedLandmark[],
    finger: Finger,
    size: { width: number; height: number },
){
    return toScene(ringPosition(landmarks, finger), size);
}