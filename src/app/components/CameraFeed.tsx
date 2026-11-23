"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHandTracking } from "../hooks/useHandTracking";
import { useRingDetection } from "../hooks/useRingDetection";
import { RingScene } from "./RingScene";
import { FINGERS } from "@/app/lib/fingers";
import { GestureGuide } from "./GestureGuide";
import { useDemoHand } from "../hooks/useDemoHand";



export function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState("starting");
    const [aspect, setAspect] = useState(16 / 9);
    const { gesture, handRef, modelReady } = useHandTracking(videoRef, status === "ready");
    const [manualRing, setManualRing] = useState(false);
    const  detectFinger = useRingDetection(videoRef, handRef, status === "ready" && !manualRing);
    const ringFinger = manualRing ? FINGERS[2] : detectFinger
    const loading = status === "starting" || (status === "ready" && !modelReady);
    const cameraFailed = status === "denied" || status === "error";

    // Demo: clicking a gesture in the guide previews its construct.
    // With no hand in view, a ghost hand floats in the middle of the frame instead.
    const [demo, setDemo] = useState<string | null>(null);
    const sceneHandRef = useDemoHand(handRef, demo !== null);
    const sceneGesture = demo ?? gesture;
    const sceneFinger = ringFinger ?? (demo ? FINGERS[2] : null);

    function toggleDemo(next: string) {
        setDemo(demo === next ? null : next);
    }

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" },
            });
            const video = videoRef.current;
            if (!video) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            streamRef.current = stream;
            video.srcObject = stream;
            await video.play();
            setAspect(video.videoWidth / video.videoHeight);
            setStatus("ready");
        } catch (err) {
            setStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "error");
        }
    }, []);

    useEffect(() => {
        startCamera();

        return() => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, [startCamera]);

    return(
         <div className="flex h-screen w-screen items-center justify-center bg-black">
            <div
            className="relative"
            style={{ aspectRatio: aspect, width: `min(100vw, ${aspect * 100}vh)` }}
            >
            <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full -scale-x-100"
            />
            <RingScene handRef={sceneHandRef} gesture={sceneGesture} ringFinger={sceneFinger} />
            <p className="absolute top-4 left-4 font-mono text-green-400">
                {status} · {gesture ?? "no hand"} · ring: {ringFinger?.name ?? "none"}{demo && ` · demo: ${demo}`}
            </p>

            <button onClick ={() => setManualRing((prev)=> !prev)}
                className={`absolute top-4 right-4 rounded-full border px-4 py-2 font-mono text-sm transition ${
                manualRing
                ? "border-green-400 bg-green-400/20 text-green-300 shadow-[0_0_12px_#39ff14]"
                : "border-white/30 bg-black/50 text-white/70"
            }`}>
                {manualRing ? "Ring: On" : "Ring: Auto"}
            </button>

            <GestureGuide active={sceneGesture} demo={demo} onDemo={toggleDemo} />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <p className="animate-pulse font-mono text-xl text-green-400">
                        {status === "starting" && "Starting camera..."}
                        {status === "ready" && !modelReady && "Loading model..."}
                    </p>
                </div>
            )}

            {/* The camera failed, but the click-to-preview demo needs no camera,
                so leave the gesture guide reachable instead of covering everything. */}
            {cameraFailed && !demo && (
                <div className="absolute inset-x-0 top-1/3 flex flex-col items-center gap-4">
                    <p className="font-mono text-xl text-green-400">
                        {status === "denied" ? "Camera access denied." : "Error starting camera."}
                    </p>
                    <button
                        onClick={() => {
                            setStatus("starting");
                            startCamera();
                        }}
                        className="rounded-full border border-green-400 bg-green-400/20 px-4 py-2 font-mono text-sm text-green-300 transition hover:bg-green-400/30"
                    >
                        Try again
                    </button>
                    <p className="font-mono text-sm text-white/40">
                        Or click a gesture in the guide to preview it without a camera
                    </p>
                </div>
            )}
            </div>
        </div>
    );
}
