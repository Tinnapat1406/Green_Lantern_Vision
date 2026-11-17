export type ConstructType = "shield" | "beam" | "orb" | "sand" | "hammer" | "wall" | "chain" | "none";
const GESTURE_TO_CONSTRUCT: Record<string, ConstructType> = {
    Open_Palm: "shield",
    Pointing_Up: "beam",
    Closed_Fist: "orb",
    Palm_Up: "sand",
    Victory: "hammer",
    Thumb_Up: "wall",
    ILoveYou: "chain",
    None: "none",
};

export function gestureToConstruct(gesture: string | null): ConstructType {
  if (!gesture) return "none";
  return GESTURE_TO_CONSTRUCT[gesture] ?? "none";
}
