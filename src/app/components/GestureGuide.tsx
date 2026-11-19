const GESTURES = [
  { gesture: "Open_Palm",   emoji: "✋", label: "Shield" },
  { gesture: "Pointing_Up", emoji: "☝️", label: "Beam" },
  { gesture: "Closed_Fist", emoji: "✊", label: "Power Orb" },
  { gesture: "Palm_Up",     emoji: "🤲", label: "Tornado" },
  { gesture: "Victory",     emoji: "✌️", label: "Hammer" },
  { gesture: "Thumb_Up",    emoji: "👍", label: "Wall" },
  { gesture: "ILoveYou",    emoji: "🤟", label: "Chain" },
];

type Props = {
  active: string | null;                 // gesture currently driving the scene
  demo: string | null;                   // gesture being previewed, if any
  onDemo: (gesture: string) => void;     // click an item to preview it, click again to stop
};

export function GestureGuide({ active, demo, onDemo }: Props) {
  return (
    <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 p-3 font-mono text-sm">
      <ul className="space-y-1">
        {GESTURES.map((item) => {
          const isDemo = demo === item.gesture;
          return (
            <li key={item.gesture}>
              <button
                onClick={() => onDemo(item.gesture)}
                className={`flex w-full items-center gap-2 rounded px-1 text-left transition hover:bg-green-400/10 ${
                  active === item.gesture ? "text-green-400" : "text-white/70"
                } ${isDemo ? "bg-green-400/20 shadow-[0_0_8px_#39ff14]" : ""}`}
              >
                {item.emoji} {item.label}
                {isDemo && <span className="ml-auto text-xs text-green-300">demo</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-white/40">
        {demo ? "Click again to stop the demo" : "Click a gesture to preview it"}
      </p>
    </div>
  );
}
