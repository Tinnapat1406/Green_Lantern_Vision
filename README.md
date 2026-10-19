# Green Lantern Vision 

> *"In brightest day, in blackest night, no evil shall escape my sight..."*

A browser-based Green Lantern power ring. Hold your hand up to the webcam, make a gesture, and a glowing green construct is summoned from your ring finger — all running in real time, entirely in the browser.

No backend, no Python, no install: the hand-tracking model runs client-side with MediaPipe, and the constructs are rendered with Three.js on top of the live camera feed.

## Gestures

| Gesture | Construct | Effect |
|---|---|---|
| ✋ Open palm | **Shield** | A translucent round shield that grows out of the ring |
| ☝️ Pointing up | **Beam** | An energy beam that shoots out along the direction of your index finger |
| ✊ Closed fist | **Power Orb** | A pulsing orb of light with an additive glow |

## How it works

```
Webcam ──► <video> ──► MediaPipe GestureRecognizer (WASM + GPU, ~30 fps)
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
     21 hand landmarks                 gesture name
     (useRef, every frame)       (useState, only when it changes)
               │                             │
               ▼                             ▼
     React Three Fiber scene ◄──── which construct to render
     useFrame() moves meshes
     without re-rendering React
```

A few details that make it feel smooth:

- **Landmark smoothing.** Raw landmarks jitter a little every frame, so each point is eased toward its new position (a simple lerp) before anything reads it.
- **Gesture debouncing.** A new gesture must be held for 150 ms with more than 60% confidence before it counts. This stops constructs from flickering when the model briefly misreads a frame.
- **Summon animation.** Every construct scales in from the ring with an ease-out curve. The animation is driven by frame `delta`, so it runs at the same speed on 60 Hz and 120 Hz displays.
- **State vs. ref.** Hand position changes ~60 times a second and lives in a ref read inside `useFrame`. Only the gesture name is React state, so React re-renders a handful of times instead of every frame.

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

Open [http://localhost:3000](http://localhost:3000) and allow camera access. The model (~8 MB) downloads on first load and takes a second or two to initialize.

## Project structure

```
src/app/
├─ page.tsx                     Entry page
├─ components/
│  ├─ CameraFeed.tsx            Opens the webcam and wires everything together
│  ├─ RingScene.tsx             Three.js overlay: ring markers + active construct
│  └─ constructs/
│     ├─ Shield.tsx
│     ├─ Beam.tsx
│     └─ PowerOrb.tsx
├─ hooks/
│  ├─ useHandTracking.ts        MediaPipe loop, smoothing, gesture debouncing
│  └─ useSummon.ts              0 → 1 summon progress + easing
└─ lib/                         Pure functions, no React
   ├─ fingers.ts                Landmark indices and ring position per finger
   ├─ coords.ts                 MediaPipe (0–1) → scene pixel coordinates
   ├─ anchor.ts                 Where constructs attach to the hand
   └─ constructs.ts             Gesture → construct mapping
```

## Roadmap

- [ ] **Detect a real green ring.** Sample pixel colors around each finger's ring position so you can wear a physical ring on any finger. Constructs only appear when the ring is worn.
- [ ] Fix landmark alignment when the video is cropped by `object-cover` on wide screens
- [ ] Scale constructs with hand distance from the camera
- [ ] More constructs (hammer, wall, chain)
- [ ] Deploy a live demo

## Why this project

I built it to learn React properly: components, props, custom hooks, and when to use state versus refs. I also wanted to see how far real-time computer vision can go in the browser alone. It's also a little bit because Green Lantern is the best.
