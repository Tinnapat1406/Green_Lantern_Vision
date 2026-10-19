export type constructType = "shield" | "beam" | "orb" | "none";
const GESTURE_TO_CONSTRUCT: Record<string, constructType> = {
    Open_Palm: "shield",
    Pointing_Up: "beam",
    Closed_Fist: "orb",
    None: "none",
};

export function gestureToConstruct(gesture: string): constructType | null {
    return GESTURE_TO_CONSTRUCT[gesture] || null;
}