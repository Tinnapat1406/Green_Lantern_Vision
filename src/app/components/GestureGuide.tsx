const GESTURES = [
  { gesture: "Open_Palm",   emoji: "✋", label: "Shield" },
  { gesture: "Pointing_Up", emoji: "☝️", label: "Beam" },
  { gesture: "Closed_Fist", emoji: "✊", label: "Power Orb" },
  { gesture: "Palm_Up",     emoji: "🤲", label: "Tornado" },
];

export function GestureGuide({ active }: { active: string | null }) {
  return (
    <ul className="absolute bottom-4 left-4 space-y-1 rounded-lg bg-black/50 p-3 font-mono text-sm">
      {GESTURES.map((item) => (
        <li
          key={item.gesture}
          className={`flex items-center gap-2 transition ${active === item.gesture ? "text-green-400" : "text-white/70"}`}>
          {item.emoji} {item.label}
        </li>
      ))}
    </ul>
  );
}
