"use client";

import { useEffect, useRef, useState } from "react";
import { useHandTracking } from "../hooks/useHandTracking";

export function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState("starting");
     const gesture = useHandTracking(videoRef, status === "ready"); 
     
    useEffect(() => {
        let stream: MediaStream | null = null;

        async function start() {

            try { 
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current!.srcObject = stream;
                await videoRef.current!.play();
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
         <div className="relative h-screen w-screen bg-black">
            <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover -scale-x-100"
            />
            <p className="absolute top-4 left-4 font-mono text-green-400">
                {status} · {gesture ?? "no hand"}
            </p>
        </div>
    );

}