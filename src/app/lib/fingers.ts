import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type Finger = {
  name: string;
  base: number;   
  joint: number;  
};

export const FINGERS: Finger[] = [
  { name: "thumb",  base: 2,  joint: 3 },
  { name: "index",  base: 5,  joint: 6 },
  { name: "middle", base: 9,  joint: 10 },
  { name: "ring",   base: 13, joint: 14 },
  { name: "pinky",  base: 17, joint: 18 },
]

export function ringPosition(landmarks: NormalizedLandmark[], finger: Finger){
  const a = landmarks[finger.base];
  const b = landmarks[finger.joint];

  return { x: (a.x + b.x) / 2, y: a.y + (b.y - a.y) / 2 };
}