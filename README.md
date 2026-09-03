# Iksha Inja App 👃

**Mookukond Iksha, injaa, gaagga varakum**

> *"Move your nose, draw, all the way to the end"*

A playful, fully-functional nose-powered drawing experiment built with React, TypeScript, and MediaPipe. No mouse. No keyboard. No touchscreen. Just your nose.

---

## The Problem That Doesn't Exist

Let's be honest: there is absolutely nothing wrong with a mouse, a trackpad, or a touchscreen. They are excellent inventions that billions of people use every day without incident.

But this project asks a different question:

> **What if you could draw with your nose anyway?**

Not because you need to. Not because it's more efficient. But because it's delightful, technically interesting, and — once you draw your first stroke by tilting your head — surprisingly satisfying.

Iksha Inja solves a problem nobody had, and that's exactly the point.

---

## What It Is

Iksha Inja is a browser-based computer vision application that turns your nose into a drawing cursor. It uses your webcam, MediaPipe face landmark detection, and HTML5 Canvas to:

- Track your nose tip in real time
- Draw smooth, continuous strokes as you move your head
- Respond to hand gestures for hands-free control
- Let you export your creation as a PNG

The name "Iksha Inja" is a Malayalam (Kerala, South India) phrase, and the tagline is a playful instruction: *move your nose, draw, keep going until done*.

---

## How It Works

### Computer Vision Pipeline

```
Webcam Feed
    ↓
Video Element (HTML)
    ↓
MediaPipe Face Landmarker (WASM, runs in browser)
    ↓
Face Landmarks (478 points)
    ↓
Nose Tip — Landmark Index #4
    ↓
Coordinate Normalization (0..1 range)
    ↓
Exponential Smoothing (factor = 0.6)
    ↓
Coordinate Mirroring (x = 1 - x, for selfie view)
    ↓
Canvas Pixel Coordinates
    ↓
Brush Cursor + Drawing Stroke
```

### Nose Tracking

MediaPipe's Face Landmarker returns 478 face landmarks. Landmark index **4** is the nose tip. Coordinates are normalized to 0..1 in both X and Y.

Since the webcam display is mirrored (like a mirror), the X coordinate is flipped so the brush appears exactly where you expect it:

```ts
canvasX = (1 - normalizedX) * canvasWidth
canvasY = normalizedY * canvasHeight
```

Raw nose coordinates jitter slightly. An exponential smoother reduces this:

```ts
smoothedX = previousX * 0.6 + currentX * 0.4
smoothedY = previousY * 0.6 + currentY * 0.4
```

The factor (0.6) balances responsiveness vs. stability.

### Hand Gesture Pipeline

```
Webcam Feed
    ↓
MediaPipe Hand Landmarker (WASM, runs in browser)
    ↓
21 Hand Landmarks
    ↓
Finger Extension Detection
    ↓
Gesture Classification
    ↓
Debouncing (7 frames for stability)
    ↓
Application State Change
```

### Gesture Reference

| Gesture | Action |
|---------|--------|
| ☝️ Index finger raised | Start drawing |
| 🖐️ Open palm (all fingers extended) | Pause drawing |
| ✊ Closed fist (held 3 seconds) | Clear canvas (with countdown confirmation) |

Gestures are debounced over 7 consecutive frames to prevent accidental triggers.

---

## Application States

| State | Description |
|-------|-------------|
| 🟢 READY | Camera active, nose tracked, not drawing |
| 🔴 DRAWING | Nose is the brush, strokes being drawn |
| 🟡 PAUSED | Tracking continues, drawing paused |
| ⚠️ NO FACE | Face not in camera view |

---

## Technologies

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| MediaPipe Tasks Vision | Face & hand landmark detection |
| HTML5 Canvas | Drawing surface |
| Tailwind CSS | Utility styling |
| CSS Animations | Cursors, transitions, countdown |

**All processing is 100% client-side.** No webcam footage is ever uploaded to a server.

---

## Installation & Running Locally

### Prerequisites

- Node.js 18+
- A webcam
- A modern browser (Chrome or Edge recommended for best MediaPipe GPU support)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/mathewjosephta/Iksha-Inja-App.git
cd Iksha-Inja-App

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Browser & Camera Requirements

| Requirement | Details |
|-------------|---------|
| Browser | Chrome 90+, Edge 90+, Firefox 90+ (Chrome/Edge preferred) |
| Camera | Required — any standard webcam |
| HTTPS / Localhost | Camera access requires secure context |
| GPU | Recommended for MediaPipe hardware acceleration |

**Note:** MediaPipe loads WASM and model files from CDN on first use. Allow a few seconds on first load for initialization.

---

## Usage Guide

1. **Open the app** — Allow camera permission when prompted
2. **Let the app find your nose** — Status shows 🟢 READY when detected
3. **Raise your index finger** — Status changes to 🔴 DRAWING
4. **Move your head** — Strokes appear on the canvas, following your nose
5. **Open your palm** — Drawing pauses (🟡 PAUSED)
6. **Resume** — Raise index finger again or click "Resume"
7. **Clear** — Hold a fist for 3 seconds (countdown appears), or click "Clear"
8. **Save** — Click "Save" for drawing-only PNG, or "+Cam" for composite with camera background

---

## Controls (Manual)

The floating control panel at the bottom provides fallback mouse/touch controls:

- **🎨 Draw / Resume** — Start or resume drawing
- **⏸️ Pause** — Pause drawing
- **🗑️ Clear** — Clear the canvas
- **Color swatches** — Change brush color
- **Size buttons** — Change brush size
- **💾 Save** — Export drawing as PNG
- **📸 +Cam** — Export drawing + camera background as PNG
- **❓ Help** — Show instructions again

---

## Drawing Quality

Strokes are rendered using quadratic Bézier curve interpolation between nose position samples. This produces smooth, natural-looking lines instead of disconnected dots:

- `lineCap: 'round'` — rounded stroke ends
- `lineJoin: 'round'` — smooth joins between segments
- Midpoint Bézier — smooth curves through all captured points

---

## Project Structure

```
src/
├── components/
│   ├── CameraView.tsx        Mirrored webcam video element
│   ├── ControlPanel.tsx      Floating brush/action controls
│   ├── DrawingCanvas.tsx     HTML5 Canvas with imperative API
│   ├── GestureGuide.tsx      Gesture hints + fist countdown
│   ├── NoseCursor.tsx        Animated nose position indicator
│   ├── Onboarding.tsx        First-run instructions overlay
│   └── StatusIndicator.tsx   READY/DRAWING/PAUSED/NO FACE status
│
├── hooks/
│   ├── useCamera.ts          Webcam initialization & cleanup
│   ├── useFaceTracking.ts    Face landmark detection RAF loop
│   └── useHandTracking.ts    Hand landmark detection RAF loop
│
├── vision/
│   ├── coordinateMapping.ts  Normalize + mirror coordinates
│   ├── faceTracking.ts       MediaPipe FaceLandmarker wrapper
│   ├── gestureRecognition.ts Classify + debounce hand gestures
│   └── handTracking.ts       MediaPipe HandLandmarker wrapper
│
├── utils/
│   ├── drawing.ts            Canvas stroke drawing utilities
│   ├── export.ts             PNG export functions
│   └── smoothing.ts          Exponential coordinate smoother
│
├── App.tsx                   Main component & state machine
├── main.tsx                  React entry point
└── index.css                 Global styles, animations, theme
```

---

## Known Limitations

- **Lighting matters** — Poor lighting reduces face detection accuracy
- **Fast head movement** — Extremely fast movements may cause stroke gaps
- **GPU requirement** — MediaPipe runs slower without GPU acceleration
- **One face** — Currently tracks only one face (the primary detected face)
- **First load** — MediaPipe downloads WASM + model (~15MB) on first use

---

## Future Improvements

- [ ] Undo/Redo support
- [ ] Multiple brush types (spray, watercolor, pencil)
- [ ] Background themes / canvas backgrounds
- [ ] Drawing speed brush pressure simulation
- [ ] Gallery to save multiple drawings
- [ ] PWA / offline support (cache MediaPipe models)
- [ ] Blink-to-draw as an alternative gesture
- [ ] Voice commands (Malayalam language pack 🙂)
- [ ] Multi-user collaborative nose drawing

---

## License

MIT — draw freely, draw joyfully, draw with your nose.

---

*Built with ❤️ and a lot of head-tilting.*
