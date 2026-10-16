"use client";

import { useEffect, useRef, useState } from "react";

export function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState("starting");

    useEffect(() => {
        let stream: MediaStream | null = null;

        async function start() {

            try { 
                const s = await navigator.mediaDevices.getUserMedia({ video: true });
                await videoRef.current!.srcObject.play();
                videoRef.current!.srcObject = s;
                setStatus("ready");
            } catch (err) {
                err.name === "NotAllowedError" ? setStatus("denied") : setStatus("error");
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
      <p className="absolute top-4 left-4 font-mono text-green-400">{status}</p>
    </div>
    );

}