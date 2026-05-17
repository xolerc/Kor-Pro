# WebCode Pro — Online Code Editor

A **browser-based HTML/CSS/JS code editor** with live preview, line numbers, and fullscreen mode. Features a macOS-style splash screen, traffic-light window controls, and a split-panel editor/preview layout with real-time rendering.

## Features

- **Live Preview** — Automatic iframe rendering with 500ms debounce delay
- **Line Numbers** — Auto-generated line number gutter that syncs with editor scroll
- **Splash Screen** — Animated launch screen with the WebCode Pro logo
- **Traffic Light Controls** — Red (clear code), Yellow (copy code), Green (fullscreen)
- **Fullscreen Mode** — One-click fullscreen for distraction-free coding
- **Status Bar** — Shows code size in KB, encoding (UTF-8), and ready status
- **Dark Theme** — VS Code-inspired dark theme with neon green editor text
- **Responsive Layout** — Stacks panels vertically on mobile devices

## Tech Stack

- HTML5, CSS3 (custom properties, flexbox)
- Vanilla JavaScript (DOM manipulation, `Blob` size calculation, `execCommand` copy)
- Google Fonts (Inter, JetBrains Mono)

## How to Run

```bash
# Open directly:
open index.html

# Or serve locally:
python3 -m http.server 8080
# Open http://localhost:8080
```

Fully client-side, no build step required.
