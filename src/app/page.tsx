import Image from "next/image";
import { CameraFeed } from "@/app/components/CameraFeed";
import { useHandTracking } from "@/app/hooks/useHandTracking";          // บนสุด ใต้ import เดิม


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CameraFeed />

      
    </div>
  );
}
