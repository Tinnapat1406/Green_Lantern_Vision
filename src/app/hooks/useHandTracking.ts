"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
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

    function loop(){
        const video = videoRef.current;
        if (recognizer && video && !cancelled && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
            const result = recognizer.recognizeForVideo(video, performance.now());
            const name = result.gestures[0]?.[0]?.categoryName ?? null;
            handRef.current = result.landmarks[0] ?? null;

            if (name !== lastGesture) {
                lastGesture = name;
                setGesture(name);
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