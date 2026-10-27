"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { isPalmUp } from "@/app/lib/palm";
import type { GestureRecognizer, NormalizedLandmark } from "@mediapipe/tasks-vision";


const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";


export function useHandTracking(
    videoRef: RefObject<HTMLVideoElement | null>,
    enabled: boolean
) {
    const [gesture, setGesture] = useState<string | null>(null);
    const handRef = useRef<NormalizedLandmark[] | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let recognizer: GestureRecognizer | null = null;
    let frameId = 0;
    let lastGesture: string | null = null;
    let cancelled = false;
    let lastVideoTime = -1;
    let candidate: string | null = null;   
    let candidateSince = 0;                 
    const HOLD_MS = 150;
    const SMOOTH = 0.5; 

    function loop(){
        const video = videoRef.current;
        if (recognizer && video && !cancelled && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
            const result = recognizer.recognizeForVideo(video, performance.now());
            const now = performance.now();
            const top = result.gestures[0]?.[0];
            const world = result.worldLandmarks[0];
            const palmUp = world && isPalmUp(world) && top?.categoryName !== "Closed_Fist";
            const name = palmUp ? "Palm_Up" : (top && top.score > 0.6 ? top.categoryName : null); 
            
            if (name !== candidate) {
                candidate = name;
                candidateSince = now;
            } else if (now - candidateSince > HOLD_MS) {
                if (candidate !== lastGesture) {
                    lastGesture = candidate;
                    setGesture(candidate);
                }
            }
            const next = result.landmarks[0];
            const prev = handRef.current;

            if (!next) {
                handRef.current = null;
            } else if (!prev) {
                handRef.current = next;           
            } else {
                handRef.current = next.map((point, index) => ({
                    ...point,
                    x: prev[index].x + (point.x - prev[index].x) * SMOOTH,
                    y: prev[index].y + (point.y - prev[index].y) * SMOOTH,
                }));
            }

        }
        frameId = requestAnimationFrame(loop); 
    }
    async function init(){
      const { FilesetResolver, GestureRecognizer } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      const created = await GestureRecognizer.createFromOptions(vision, { 
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO", 
        numHands: 1});
      
      if (cancelled) {
        created.close();
        return;
      }
      recognizer = created;
      loop();
    }
    init();
    
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      recognizer?.close();
    };
 },[enabled, videoRef]);

  return {gesture, handRef};

}