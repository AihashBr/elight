---
name: threejs-design-prototyping
description: How to build visual prototypes and showcase pages for Elight in Three.js (project structure, scene composition with the light identity, overlay UI, accessibility and fallback). Use when creating a landing page, demo, editor mockup or visual study in Three.js.
---

# Three.js: design prototypes

Three.js prototypes **test the visual language** (light, materials, motion) before implementing it in the Rust engine, and power Elight's public page. They are not the game engine.

## Minimal structure (Vite)

```
proto/
  index.html
  src/
    main.js          # bootstrap: renderer, loop, resize
    scene.js         # builds the scene
    theme.js         # reads CSS tokens -> THREE.Color
    ui.css           # overlay HTML UI (uses tokens)
  public/env/        # HDRI, KTX2 textures, GLB models
```

`npm create vite@latest proto -- --template vanilla` and `npm i three`.

## CSS tokens -> Three.js

One source of truth: read the CSS variables (see `elight-design-tokens`).

```js
const css = getComputedStyle(document.documentElement);
export const token = (name) => new THREE.Color(css.getPropertyValue(name).trim());
// scene.background = token('--bg'); keyLight.color = token('--accent');
```

React to theme changes by rereading the tokens and updating colors (without recreating the scene).

## Composition with the "light" identity

- `--bg` background, a light fog (`scene.fog`) in the same color for depth.
- **One** protagonist light source in the accent color, with a halo (additive sprite) and discreet bloom.
- Simple, clean geometry (spheres, grids, planes); matte materials; soft IBL reflections.
- Slow, continuous motion (mouse parallax, gentle floating). Nothing that distracts from the text.
- Layout: sharp foreground, blurred or darkened background so it does not compete with the UI.

## HTML UI over the canvas

- Canvas at `position: fixed; inset: 0; z-index: 0`; content in HTML layers above. Real HTML text (selectable, accessible, SEO), **not** textures.
- `pointer-events: none` on a decorative canvas; camera controls only when part of the interaction.
- Anchored 3D labels: project the 3D position to screen (`vector.project(camera)`) or use `CSS2DRenderer` from `three/addons`.

## Interaction and scroll

- Scroll -> camera: map progress (0-1) to camera position/target with smooth interpolation (`lerp`/damping), never jumps.
- Respect `prefers-reduced-motion`: no parallax or floating, a well-composed static scene.
- Hover and focus on interactive 3D objects with `Raycaster`, with a keyboard alternative (equivalent HTML button).

## Quality and fallback

- Detect WebGL (`WebGLRenderingContext`) and, on failure, show a static image of the scene.
- Pixel ratio <= 2; reduce bloom and shadows on mobile; pause the loop when the tab is hidden (`document.visibilityState`) or the canvas is offscreen (`IntersectionObserver`).
- Load budget: initial JS + assets < 2 MB when possible; lazy-load the rest with a progress indicator.

## Delivery checklist

- [ ] Tokens in one place, light/dark theme working
- [ ] 60 fps on a modest laptop; verified with `threejs-performance`
- [ ] Text in HTML, contrast OK over the scene
- [ ] `prefers-reduced-motion` respected
- [ ] Resources disposed on unmount (`threejs-scene-setup`)
- [ ] Fallback without WebGL
