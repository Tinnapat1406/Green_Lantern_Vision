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

let shieldCache: CanvasTexture | null = null;

export function getShieldTexture() {
  if (!shieldCache) {
    shieldCache = makeShieldTexture();
  }
  return shieldCache;
}

export function makeShieldTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0,    "rgba(57, 255, 20, 0.05)");
  g.addColorStop(0.6,  "rgba(57, 255, 20, 0.12)");
  g.addColorStop(0.8,  "rgba(57, 255, 20, 0.35)");
  g.addColorStop(0.86, "rgba(232, 255, 224, 1)");   
  g.addColorStop(0.9,  "rgba(182, 255, 158, 0.5)");
  g.addColorStop(1,    "rgba(57, 255, 20, 0)");


  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}


let panelCache: CanvasTexture | null = null;

export function getPanelTexture() {
  if (!panelCache) {
    panelCache = makePanelTexture();
  }
  return panelCache;
}

// A faint green slab with a glowing white-hot border, used for the hammer head and wall bricks
export function makePanelTexture() {
  const size = 128;
  const inset = 12;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(57, 255, 20, 0.18)";
  ctx.fillRect(inset, inset, size - inset * 2, size - inset * 2);

  ctx.shadowColor = "rgba(57, 255, 20, 1)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(232, 255, 224, 1)";
  ctx.lineWidth = 4;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  return new CanvasTexture(canvas);
}
