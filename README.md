# ArchSim

> A drag-and-drop canvas for sketching cloud architecture diagrams, with live cost estimates and traffic simulation.

**[Live demo](https://su-archsim.vercel.app)**

ArchSim is a visual editor for cloud architecture diagrams. Drag services from a palette of 40+ components onto an infinite pan-and-zoom canvas, wire them together, and switch the whole diagram between AWS, Google Cloud, and Azure equivalents. Beyond drawing, it estimates monthly cost as you build, runs a lint pass for architectural smells, and simulates request traffic to surface throughput and bottlenecks.

## Features

- Drag-and-drop canvas with 40+ cloud service components and node-to-node connections
- Provider switching across AWS, GCP, and Azure
- Eight prebuilt templates (three-tier, serverless API, microservices, data pipeline, ML platform, event-driven, and more)
- Live monthly cost estimation per node and for the whole diagram
- Traffic simulation with RPS/throughput analysis and a lint panel for architecture warnings
- Undo/redo, minimap, keyboard shortcuts, JSON import/export, and SVG image export
- Infinite pan/zoom canvas with mobile touch support

## Stack

- React 19, built with Vite
- SVG-based custom canvas rendering (no diagramming library)
- `localStorage` for persisting the selected cloud provider
- Frontend-only — no backend or external API

## Running locally

```bash
npm install
npm run dev
```

No environment variables are required.

---

Part of a series of 91 small web apps. [Browse them all](https://su-slopmachine.vercel.app).
