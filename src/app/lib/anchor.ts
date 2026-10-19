import type { RefObject } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { FINGERS, ringPosition } from "./fingers";
import { toScene } from "./coords";

export type HandRef = RefObject<NormalizedLandmark[] | null>;
const RING_FINGER = FINGERS[2];

export function ringAnchor(
    landmarks: NormalizedLandmark[],
    size: { width: number; height: number },
){
    return toScene(ringPosition(landmarks, RING_FINGER), size);
}