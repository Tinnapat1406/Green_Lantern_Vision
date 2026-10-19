export type ConstructType = "shield" | "beam" | "orb" | "none";
const GESTURE_TO_CONSTRUCT: Record<string, ConstructType> = {
    Open_Palm: "shield",
    Pointing_Up: "beam",
    Closed_Fist: "orb",
    None: "none",
};

export function gestureToConstruct(gesture: string | null): ConstructType {
  if (!gesture) return "none";
  return GESTURE_TO_CONSTRUCT[gesture] ?? "none";
}
