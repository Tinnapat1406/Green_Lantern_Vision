"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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
    const [modelReady, setModelReady] = useState(false);
    const [modelFailed, setModelFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const handRef = useRef<NormalizedLandmark[] | null>(null);

    const retryModel = useCallback(() => {
        setModelFailed(false);
        setAttempt((n) => n + 1);
    }, []);

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
    const SMOOTH_SPEED = 21; // same feel as the old 0.5-per-frame lerp at 30 fps
    const GRACE_MS = 200;
    let lostSince = 0;

    function loop(){
        const video = videoRef.current;
        if (recognizer && video && !cancelled && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
            const dt = lastVideoTime < 0 ? 0 : Math.min(video.currentTime - lastVideoTime, 0.1);
            const alpha = 1 - Math.exp(-SMOOTH_SPEED * dt);
            lastVideoTime = video.currentTime;
            const result = recognizer.recognizeForVideo(video, performance.now());
            const now = performance.now();
            const top = result.gestures[0]?.[0];
            const world = result.worldLandmarks[0];
            const hand = result.handedness[0]?.[0]?.categoryName;
            const palmUp = world && hand && isPalmUp(world, hand) && top?.categoryName !== "Closed_Fist";
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

            if (next) lostSince = 0;
            if (!next) {
                if (lostSince === 0) lostSince = now;
                if (now - lostSince > GRACE_MS) handRef.current = null;

            } else if (!prev) {
                handRef.current = next;
            } else {
                // Both sides kept: main's time-based alpha (z smoothed too), applied
                // in place so the array identity stays stable and no objects are
                // allocated per video frame (21 landmarks × ~30 fps)
                for (let i = 0; i < next.length; i++) {
                    const p = prev[i];
                    const n = next[i];
                    p.x += (n.x - p.x) * alpha;
                    p.y += (n.y - p.y) * alpha;
                    p.z += (n.z - p.z) * alpha;
                    p.visibility = n.visibility;
                }
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
      setModelReady(true);
      loop();
    }
    init().catch(() => {
      if (!cancelled) setModelFailed(true);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      recognizer?.close();
    };
 },[enabled, videoRef, attempt]);

  return {gesture, handRef, modelReady, modelFailed, retryModel};

}