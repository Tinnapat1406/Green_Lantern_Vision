# Green Lantern Vision 

> *"In brightest day, in blackest night,
No evil shall escape my sight.
Let those who worship evil's might,
Beware my power, Green Lantern's light!"*

A browser-based Green Lantern power ring. Put a green ring on any finger, hold your hand up to the webcam, make a gesture, and a glowing green construct is summoned from the ring — all running in real time, entirely in the browser.

No backend, no Python, no install: the hand-tracking model runs client-side with MediaPipe, and the constructs are rendered with Three.js on top of the live camera feed.

## The ring

The app looks for a real, physical green ring. Ten times a second it checks three spots along the base of each finger and picks the finger with the most green. The spots grow and shrink with your finger on screen, and green is judged by hue rather than brightness, so the ring is still found when your hand is tilted, turned palm-forward, in shadow or catching a highlight. If the ring slips out of view for a moment, the app keeps it for half a second before giving up. Wear the ring on any finger and the power comes out of that finger. Move the ring and the power moves with it. Take it off and you're powerless.

No ring at hand? Click **Ring: Auto** in the top-right corner to switch to **Ring: On**. The ring is then placed on your middle finger and every construct works without one. Any bright green band also works for testing, such as green tape, a sticker or a hair tie.

Once the ring is found, a glowing green band appears around that finger and slowly pulses, so you always know where the power will come from.

## Gestures

| Gesture | Construct | Effect |
|---|---|---|
| ✋ Open palm | **Shield** | An energy bubble that is see-through in the middle with a blazing rim, and ripples of light keep rolling out from its center |
| ☝️ Pointing up | **Beam** | A soft-edged energy beam with a white-hot core that flickers as it shoots out along your index finger, with a burst of light where it leaves the ring |
| ✊ Closed fist | **Power Orb** | Three layers of light (a white-hot core, a fast-beating aura and a slow-breathing outer halo) that pulse out of sync, so the orb never looks the same twice |
| 🤲 Palm up | **Sand Tornado** | 3,000 grains of green energy spiral up from your palm in a widening funnel. The top trails behind your hand when you move, so the tornado bends like a real one |
| ✌️ Victory | **Hammer** | An energy hammer that winds up, smashes and recovers on a loop, with a shockwave on every impact |
| 👍 Thumb up | **Wall** | A wall of glowing bricks that builds itself row by row from the bottom up, each brick landing a beat after the last |
| 🤟 I love you | **Chain** | A wrecking ball on a chain of 12 links, simulated with real rope physics, swinging and settling under gravity as you move your hand |

A guide in the bottom-left corner lists every gesture and lights up the one you're making.

Every summon starts with a flash of light at the ring. When you switch gestures, the old construct shrinks back into the ring for 0.2 seconds before the new one grows out. At the same moment, a burst of twinkling sparks breaks off the ring and fades away.

Constructs scale with your hand's distance from the camera. Bring your hand closer and the shield, beam, orb and tornado all grow with it. The size comes from two measurements of the rigid palm: its length (wrist to the base of the middle finger) and its width (base of the index finger to base of the pinky). The app uses whichever is longer. Tilting your hand forward makes the length look shorter, and turning it sideways makes the width look shorter, but rarely both at once, so the size stays steady while you move. Making a fist doesn't change it either.

MediaPipe has no built-in "palm up" gesture, so the app detects it itself. It takes two vectors across the palm in 3D (wrist → index knuckle, wrist → pinky knuckle). Their cross product is the direction the palm faces, and when that points mostly straight up, the gesture counts as palm up.

## How it works

```
Webcam ──► <video> ──► MediaPipe GestureRecognizer (WASM + GPU, ~30 fps)
   │                          │
   │           ┌──────────────┴──────────────┐
   │           ▼                             ▼
   │  21 hand landmarks                gesture name
   │  (useRef, every frame)      (useState, only when it changes)
   │           │                             │
   ▼           ▼                             │
 Ring detection (10×/s)                      │
 green pixels around each finger             │
   │                                         │
   ▼                                         ▼
 ring finger ──────────► React Three Fiber scene
 (useState)              useFrame() moves meshes without re-rendering React
```

A few details that make it feel smooth:

- **Landmark smoothing.** Raw landmarks jitter a little every frame, so each point is eased toward its new position (a simple lerp) before anything reads it.
- **Gesture debouncing.** A new gesture must be held for 150 ms with more than 60% confidence before it counts. This stops constructs from flickering when the model briefly misreads a frame.
- **Grace period.** If the model loses your hand for a frame or two, the last known position is kept for 200 ms instead of hiding everything at once. Constructs no longer blink when your hand moves fast or the light changes.
- **Summon and exit animations.** Every construct grows out of the ring with an easing curve, and a flash of light plays at the ring each time. On a gesture change, the old construct stays mounted for 200 ms and runs the same progress value backwards, so it shrinks back into the ring. If you switch back mid-shrink, it simply grows again. Both are driven by frame `delta`, so they run at the same speed on 60 Hz and 120 Hz displays.
- **Steady scale.** Laptop webcams are noisy, and a distance between two jittery points jitters even more. The hand size is therefore eased over time with `1 - e^(-speed·dt)`. This stays exact no matter how many constructs ask for the size in the same frame.
- **Light, not paint.** Constructs use additive blending and gradient textures drawn on a canvas, so they add light to the camera image instead of painting flat color over it. Every construct gets its own gradient: a radial glow for the orb, a bright rim for the shield and a cross-section falloff for the beam.
- **Shared textures.** Each texture is created once and cached for the whole app, so summoning a construct again doesn't allocate new GPU memory.
- **Particles without re-renders.** Particle positions and colors live in typed arrays that are updated in place each frame and then flagged for upload to the GPU, so 3,000 tornado grains cost one draw call.
- **Soft particles.** Each grain is a round, soft-edged dot rather than a hard square. Every grain also gets its own radius, shade of green and per-vertex alpha. That way the tornado's edges blur naturally, and grains fade in at the base and fade out at the top instead of popping in and out.
- **Bending with inertia.** A trailing point follows the hand with a delta-based lerp. Each grain is pulled toward it by height² (squared height), so the base stays on your palm while the top swings in a smooth curve.
- **No cropping.** The video container matches the camera's aspect ratio, so landmark coordinates map 1:1 onto the overlay at any screen size.
- **State vs. ref.** Hand position changes ~60 times a second and lives in a ref read inside `useFrame`. Only the gesture name and the ring finger are React state, so React re-renders a handful of times instead of every frame.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer) for hand landmarks and gesture recognition
- [Three.js](https://threejs.org) via [React Three Fiber](https://r3f.docs.pmnd.rs) for the constructs
- Tailwind CSS v4

## Getting started

Requires Node.js 20+ and a webcam.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and allow camera access. The model (~8 MB) downloads on first load and takes a second or two to initialize. A loading screen shows "Starting camera…" and then "Loading model…" until everything is ready.

## Project structure

```
src/app/
├─ page.tsx                     Entry page
├─ components/
│  ├─ CameraFeed.tsx            Opens the webcam and wires everything together
│  ├─ RingScene.tsx             Three.js overlay: ring marker + active construct
│  ├─ GestureGuide.tsx          On-screen list of gestures, highlights the active one
│  └─ constructs/
│     ├─ Shield.tsx
│     ├─ Beam.tsx
│     ├─ PowerOrb.tsx
│     ├─ SandTornado.tsx        Particle whirlwind on an upturned palm
│     ├─ RingFlash.tsx          Flash of light at the ring on every summon
│     └─ SparkleBurst.tsx       Twinkling sparks when a construct changes or vanishes
├─ hooks/
│  ├─ useHandTracking.ts        MediaPipe loop, smoothing, gesture debouncing
│  ├─ useRingDetection.ts       Finds which finger wears the green ring
│  └─ useSummon.ts              0 ↔ 1 summon/exit progress + easing
└─ lib/                         Pure functions, no React
   ├─ fingers.ts                Landmark indices and ring position per finger
   ├─ coords.ts                 MediaPipe (0–1) → scene pixel coordinates
   ├─ anchor.ts                 Where constructs attach to the hand
   ├─ color.ts                  "Is this pixel green?" and green ratio in an area
   ├─ palm.ts                   Palm-up detection from 3D landmarks
   ├─ scale.ts                  Smoothed construct size from hand distance
   ├─ glow.ts                   Cached glow, dot, beam and shield textures
   └─ constructs.ts             Gesture → construct mapping
```

## Roadmap

- [x] **Detect a real green ring.** Sample pixel colors around each finger's ring position so you can wear a physical ring on any finger. Constructs only appear when the ring is worn.
- [x] Fix landmark alignment when the video is cropped by `object-cover` on wide screens
- [x] **Sand tornado.** Turn your hand palm-up and a whirlwind of sand spins up from your palm
- [x] No-ring mode, so visitors can try the demo without a green ring
- [x] Sparkle burst when switching constructs
- [x] Scale constructs with hand distance from the camera
- [x] Better light: soft-edged beam, energy-bubble shield, layered orb
- [x] Loading screen and on-screen gesture guide
- [x] Constructs shrink back into the ring when you switch gestures
- [x] No flicker when tracking briefly loses the hand
- [x] Steady construct size on noisy laptop webcams
- [x] Detect the ring from more hand angles
- [ ] More constructs (hammer, wall, chain)
- [ ] Deploy a live demo

## Why this project

I built it to learn React properly: components, props, custom hooks, and when to use state versus refs. I also wanted to see how far real-time computer vision can go in the browser alone. It's also a little bit because Green Lantern is the best.
