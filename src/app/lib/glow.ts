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

export function makeDotTexture(){
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0,"rgba(255,255,255,1)");
  g.addColorStop(1,"rgba(255,255,255,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);

}

let glowCache: CanvasTexture | null = null;
let dotCache: CanvasTexture | null = null;

export function getGlowTexture() {
  if (!glowCache) {
    glowCache = makeGlowTexture();
  }
  return glowCache;
}

export function getDotTexture() {
  if (!dotCache) {
    dotCache = makeDotTexture();
  }
  return dotCache;
}

let beamCache: CanvasTexture | null = null;

export function getBeamTexture() {
  if (!beamCache) {
    beamCache = makeBeamTexture();
  }
  return beamCache;
}

export function makeBeamTexture() {
  const width = 64;
  const height = 4;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, width, 0);
  g.addColorStop(0,    "rgba(57, 255, 20, 0)");
  g.addColorStop(0.3,  "rgba(57, 255, 20, 0.3)");
  g.addColorStop(0.45, "rgba(182, 255, 158, 0.9)");
  g.addColorStop(0.5,  "rgba(255, 255, 255, 1)");
  g.addColorStop(0.55, "rgba(182, 255, 158, 0.9)");
  g.addColorStop(0.7,  "rgba(57, 255, 20, 0.3)");
  g.addColorStop(1,    "rgba(57, 255, 20, 0)");


  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  return new CanvasTexture(canvas);
}