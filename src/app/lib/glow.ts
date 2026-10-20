import { CanvasTexture } from "three";

export function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1)");     
  g.addColorStop(0.2, "rgba(182, 255, 158, 0.9)"); 
  g.addColorStop(0.5, "rgba(57, 255, 20, 0.35)");  
  g.addColorStop(1, "rgba(57, 255, 20, 0)");       

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}
