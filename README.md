# Shamama's Portfolio

A pocket-sized portfolio that opens like a book. Built as a tiny desk scene with a flip-through book on a spring, draggable/swappable stickers, and hand-drawn marker underlines that draw themselves on hover.

**Live demo:** https://shamamasportfolio.netlify.app/

## Highlights

- **The book** opens and turns pages on a spring. Drag a corner, tap a side, or use the arrow keys.
- **Desk stickers** are draggable, resizable, and swappable via a long-press radial menu.
- **Self-drawing scribble underlines**: each project name gets a real marker scribble that a "pen" traces along its own path on hover (the centerline is derived from the filled SVG shape, then drawn via `stroke-dashoffset` inside a mask).
- **Editable text**: the about/journal copy is editable in place.
- **Downloadable CV**: one click from the about page.

## Tech

- React 19 + [motion.dev](https://motion.dev)
- Vite + TypeScript
- `web-haptics` for tactile feedback

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
