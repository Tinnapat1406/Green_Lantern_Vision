"use client";

import { useEffect, useRef, useState } from "react";
import { useHandTracking } from "../hooks/useHandTracking";
import { useRingDetection } from "../hooks/useRingDetection";
import { RingScene } from "./RingScene";
import { FINGERS } from "@/app/lib/fingers";



export function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState("starting");
    const [aspect, setAspect] = useState(16 / 9);
    const { gesture, handRef } = useHandTracking(videoRef, status === "ready");
    const [manualRing, setManualRing] = useState(false);
    const  detectFinger = useRingDetection(videoRef, handRef, status === "ready" && !manualRing);
    const ringFinger = manualRing ? FINGERS[2] : detectFinger

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
            <RingScene handRef={handRef} gesture={gesture} ringFinger={ringFinger} />
            <p className="absolute top-4 left-4 font-mono text-green-400">
                {status} · {gesture ?? "no hand"} · ring: {ringFinger?.name ?? "none"}
            </p>

            <button onClick ={() => setManualRing((prev)=> !prev)}
                className={`absolute top-4 right-4 rounded-full border px-4 py-2 font-mono text-sm transition ${
                manualRing
                ? "border-green-400 bg-green-400/20 text-green-300 shadow-[0_0_12px_#39ff14]"
                : "border-white/30 bg-black/50 text-white/70"
            }`}>
                {manualRing ? "Ring : On" :"Ring :Auto"}
            </button>
            </div>
        </div>
    );
}
