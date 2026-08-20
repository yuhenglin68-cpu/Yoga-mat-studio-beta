# Yoga-mat-studio-beta
 A  tool of customize yoga mats for business staffs in trade company . Creating a visualization mockup for buyers who purchase yoga mats
[README.md](https://github.com/user-attachments/files/31246971/README.md)
# Yoga Mat Studio

A browser-based 2D and 3D yoga mat customization studio built with React, TypeScript, Vite, Three.js, and Zustand.

Designers and product teams can configure yoga mat materials, shapes, dimensions, colors, surface patterns, logos, grommets, annotations, and export media directly from the browser without installing a desktop application.

## Live Demo

[Open Yoga Mat Studio](https://yogamat-3d.site.accio.ai/)

## Features

### 2D and 3D Visualization

- Switch between an interactive 3D preview and a 2D unfolded layout.
- Orbit, pan, and zoom the 3D scene.
- Zoom and pan the 2D workspace with the mouse wheel and pointer controls.
- Rotate the 2D mat clockwise in 90-degree increments.
- Render rounded mat corners for supported mat shapes.

### Material and Shape Configuration

- Material presets:
  - TPE
  - PU Matte
  - PU Glossy
  - Cork
- Mat shapes:
  - Regular rectangle
  - Semi-circle
  - Oval
- Configurable length, width, and thickness.
- Quick presets for PU and TPE dimensions.
- Physically based rendering with roughness, clearcoat, sheen, bump maps, and layered materials.
- PU matte surface with a dense micro-stipple texture.
- TPE pattern options including default, leaf, shell, diamond, chain, and cloud patterns.

### Color and Surface Design

- Curated PU and TPE color libraries with product color codes.
- Custom color selection for the mat surface.
- Image-based color picking.
- Surface texture rendering using Three.js materials and procedural maps.

### Logo and Decal Editing

- Import image files as logos or decals.
- Select logos directly in the 3D preview.
- Drag logos across the mat surface.
- Resize selected logos from corner handles with proportional scaling.
- Rotate, recolor, adjust opacity, and remove decals.
- Display optional logo dimensions.
- Use center snapping for easier alignment.

### Background Removal

- Optional integration with the Remove.bg image background-removal API.
- Local Canvas-based white-background removal fallback when the API is unavailable or fails.
- API keys are entered at runtime and stored locally in the browser's `localStorage`.
- No API key is hard-coded in the source code.

### Hardware and Measurement Tools

- Add, select, move, resize, and remove metal grommets.
- Add measurement points to inspect distances on the mat.
- Toggle dimension annotations.
- Clear drawing and annotation overlays.

### Export and Recording

- Export PNG and JPEG snapshots.
- Record the WebGL viewport with the browser's `MediaRecorder` API.
- Use automatic 3D orbit during video recording.
- Download recordings as browser-compatible WebM files.

### Workspace and Account UI

- Undo and redo for major configuration changes.
- English, Simplified Chinese, and Traditional Chinese interface options.
- Login, registration, invitation-code, account, and password-management UI.
- Responsive glassmorphism workspace layout.
- Global interface visibility control for a cleaner presentation view.

## Technology Stack

- React 18
- TypeScript
- Vite 5
- Three.js
- Zustand
- React Router
- Lucide React
- PDF.js
- Web APIs including Canvas, File, Blob, `MediaRecorder`, and `localStorage`

## Getting Started

### Requirements

- Node.js 18 or newer
- npm
- A modern browser with WebGL support

### Installation

```bash
git clone <your-repository-url>
cd yogamat-site
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Structure

```text
.
├── public/
│   ├── assets/              # Static assets
│   └── patterns/            # TPE surface pattern images
├── src/
│   ├── components/          # React UI components and panels
│   ├── core/                # Materials, constants, and texture helpers
│   ├── engine/              # Three.js rendering and interaction engine
│   ├── hooks/               # Reusable React hooks
│   ├── services/            # Background removal, recording, export, and import services
│   ├── store/               # Zustand application state
│   ├── styles/              # Global styles
│   ├── utils/               # Shared utility functions
│   ├── App.tsx              # Application shell
│   └── main.tsx             # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Key and Privacy Notes

The optional background-removal integration uses a Remove.bg API key supplied by the user at runtime. The current client-side implementation stores the key in browser `localStorage` so it can be reused on the same device.

For production deployments, do not expose sensitive or high-value API credentials in a public frontend. Use a secure server-side proxy or edge function if the key must be protected from browser access.

Never commit real API keys, credentials, or private configuration files to GitHub.

## Browser Compatibility

The application requires a modern browser with support for:

- WebGL
- ES modules
- Canvas 2D APIs
- File and Blob APIs
- `MediaRecorder` for video recording
- `localStorage` for local preferences and API-key persistence

Video format support depends on the browser's available `MediaRecorder` codecs.

## Development Notes

- The Three.js engine is implemented in `src/engine/MatEngine.ts`.
- Global studio state is managed in `src/store/useStudioStore.ts`.
- The main viewport and logo interaction layer are implemented in `src/components/Viewport.tsx`.
- Material definitions and product presets are maintained in `src/core/constants.ts` and `src/core/materials.ts`.
- The production bundle may generate a large JavaScript chunk because Three.js and its geometry utilities are included in the client application.

## License

No open-source license has been declared for this project yet. Add a license file before distributing or reusing the source code publicly.
