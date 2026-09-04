# Iksha Inja 🎯

## Basic Details
### WIP: NoseArtists (replace as needed)

### Team Members
- Team Lead: [Prarthana R NAir] - [College of Engineering Kalloopara]
- Member 2: [Laya Simom] - [College of Engineering Kalloopara]


### Project Description
Iksha Inja is a playful web application that lets users "draw with their nose" using real-time face and hand tracking. The app tracks the nose tip to control a brush on an HTML5 canvas and uses hand gestures to start, pause, clear, and submit drawings.

### The Problem (that doesn't exist)
People already have excellent input devices — but sometimes you want an absurdly fun way to draw. This project exists to explore browser-based CV interactions and make a delightful, hands-free drawing experience.

### The Solution (that nobody asked for)
A single-page React + TypeScript app that uses MediaPipe Tasks (face and hand) to convert nose and hand movements into a drawing interface, with immediate visual feedback and simple gesture-based controls.

## Technical Details
### Technologies/Components Used
For Software:
- Languages used: TypeScript, JavaScript, HTML, CSS
- Frameworks used: React (Vite)
- Libraries used: @mediapipe/tasks-vision, Tailwind CSS, clsx
- Tools used: Vite, TypeScript, GitHub Actions (CI/CD), gh-pages (optional)

For Hardware:
- Webcam (internal or external)

### Implementation
For Software:

# Installation

```bash
npm ci
```

# Run

Development:
```bash
npm run dev
# open http://localhost:5173
```

Build:
```bash
npm run build
```

Preview build locally:
```bash
npm run preview
```

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](path/to/screenshot1.png)
*App showing nose cursor over the canvas*

![Screenshot2](path/to/screenshot2.png)
*Task intro screen with Malayalam characters (ക്ഷ, ഞ്ഞ) and Start button*

![Screenshot3](path/to/screenshot3.png)
*Success celebration overlay after successful recognition*

# Diagrams
![Workflow](path/to/workflow.png)
*High-level architecture: Webcam → MediaPipe → Nose cursor → Drawing canvas → Recognition*

## Project Demo
# Video
[Add demo video link here]
*Explain what the video demonstrates*

## Team Contributions
- [Prarthana R Nair]: App architecture, face/hand tracking, recognition logic
- [Laya Simon]: UI components, onboarding, styling


---
Made with ❤️ at TinkerHub Useless Projects

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26)

## Deployment notes
- The repo includes a GitHub Actions workflow `.github/workflows/deploy.yml` that builds the app and deploys the `dist` folder to GitHub Pages on pushes to `main`.
- `vite.config.ts` base is configured as `/useless_project_temp/` to match the Pages subpath.

### What to set in GitHub Settings → Pages
1. Under "Build and deployment" / "Source", select **GitHub Actions** so the workflow builds and publishes the site.
2. Ensure `Enforce HTTPS` is enabled after the first deployment completes.

If you want me to fill team names, add screenshots, or include a demo link, tell me the details and I will update the README.
