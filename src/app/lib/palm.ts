import type { Landmark } from "@mediapipe/tasks-vision";

// Palm facing up, not just palm-plane horizontal: the sign of the palm
// normal matters, and (wrist→index) × (wrist→pinky) flips between hands,
// so the handedness label picks the sign. MediaPipe labels hands as if the
// input were mirrored; the raw webcam frame is not, so "Left" is really the
// physical right hand. World-landmark y points down, hence "up" is -y.
export function isPalmUp(world: Landmark[], handedness: string): boolean {
  const wrist = world[0];
  const index = world[5];
  const pinky = world[17];

  const u = { x: index.x - wrist.x, y: index.y - wrist.y, z: index.z - wrist.z };
  const v = { x: pinky.x - wrist.x, y: pinky.y - wrist.y, z: pinky.z - wrist.z };

  const nx = u.y * v.z - u.z * v.y;
  const ny = u.z * v.x - u.x * v.z;
  const nz = u.x * v.y - u.y * v.x;
  const length = Math.hypot(nx, ny, nz);
  if (length === 0) return false;

  const sign = handedness === "Left" ? 1 : -1;
  return (sign * ny) / length > 0.75;
}
