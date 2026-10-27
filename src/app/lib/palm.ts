import type { Landmark } from "@mediapipe/tasks-vision";

export function isPalmUp(world: Landmark[]): boolean {
  const wrist = world[0];
  const index = world[5];
  const pinky = world[17];

  const u = { x: index.x - wrist.x, y: index.y - wrist.y, z: index.z - wrist.z };
  const v = { x: pinky.x - wrist.x, y: pinky.y - wrist.y, z: pinky.z - wrist.z };


  const nx = u.y * v.z - u.z * v.y;
  const ny = u.z * v.x - u.x * v.z;
  const nz = u.x * v.y - u.y * v.x;
  const length = Math.hypot(nx, ny, nz);

  if (Math.abs(ny) / length > 0.75) {
    return true;
   } else {
    return false;
   }
}
