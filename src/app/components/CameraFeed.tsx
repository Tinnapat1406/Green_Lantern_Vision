"use client";

import { useEffect, useRef, useState } from "react";
import { useHandTracking } from "../hooks/useHandTracking";
import { useRingDetection } from "../hooks/useRingDetection";
import { RingScene } from "./RingScene";

export function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState("starting");
    const [aspect, setAspect] = useState(16 / 9);
    const { gesture, handRef } = useHandTracking(videoRef, status === "ready");
    const ringFinger = useRingDetection(videoRef, handRef, status === "ready");

    useEffect(() => {
        let stream: MediaStream | null = null;
        async function start() {
            try { 
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 1280, height: 720 },
                });
                videoRef.current!.srcObject = stream;
                await videoRef.current!.play();
                setAspect(videoRef.current!.videoWidth / videoRef.current!.videoHeight);
                setStatus("ready");
            } catch (err) {
                setStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "error");

            }
        }

        start();

        return() => {
            stream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

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
            <RingScene handRef={handRef} gesture={gesture} />
            <p className="absolute top-4 left-4 font-mono text-green-400">
                {status} · {gesture ?? "no hand"} · ring: {ringFinger?.name ?? "none"}
            </p>
            </div>
        </div>
    );
}
