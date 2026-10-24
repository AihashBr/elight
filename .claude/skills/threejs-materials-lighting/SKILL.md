---
name: threejs-materials-lighting
description: PBR materials, lighting, shadows, HDRI/IBL and textures in Three.js, aiming for consistent looks at controlled cost. Use when defining object appearance, lights and environment of a scene.
---

# Three.js: materials and lighting

## Materials

- Default: `MeshStandardMaterial` (PBR metal/rough). Use `MeshPhysicalMaterial` only when you need `clearcoat`, `transmission`, `sheen` or `iridescence` (more expensive).
- `MeshBasicMaterial` for 3D UI, gizmos and elements that ignore light; `MeshToonMaterial` for cel-shaded styles.
- Maps: `map` (albedo, sRGB), `normalMap`, `roughnessMap` + `metalnessMap` (G and B channels of one combined ORM texture), `aoMap`, `emissiveMap` (sRGB). Combining into ORM textures saves samples and memory.
- Physically plausible values: dielectrics `metalness = 0`, metals `1`; avoid in-between values except for transitions (dirt, rust).
- Albedo colors are never pure (0 or 1): useful range is roughly 0.04 to 0.9 in linear.
- `emissive` + bloom gives the Elight "light" look (see `threejs-shaders-postprocessing`).

## Lighting

Rule: **ambient light from IBL, a directional light for direction and shadow, few dynamic lights**.

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

new RGBELoader().load('/env/studio.hdr', (tex) => {
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;          // lighting + reflections
  scene.background = tex;           // optional
  scene.environmentIntensity = 1.0;
});

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(5, 8, 4);
sun.castShadow = true;
scene.add(sun);
```

- Types: `DirectionalLight` (sun), `PointLight`/`SpotLight` (cost grows with each light and shadow), `HemisphereLight` (cheap ambient), `RectAreaLight` (no shadow, Standard/Physical only).
- Use `PMREMGenerator` for HDRI prefiltering (`scene.environment` with an equirect texture already does this internally).
- Static scenes: **bake** lighting (lightmaps / AO) instead of real-time lights.

## Shadows

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 30;
// Fit the orthographic frustum to the visible area only
Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
sun.shadow.bias = -0.0005;      // shadow acne
sun.shadow.normalBias = 0.02;   // peter-panning
```

- Smallest possible frustum = sharpest shadow. Use `CameraHelper(sun.shadow.camera)` to debug.
- Few lights with `castShadow`; each one re-renders the scene.
- Objects that do not cast or receive shadows: turn off `castShadow`/`receiveShadow`.

## Textures

- Power-of-two sizes are not required in WebGL2, but mipmaps and dimensions that are multiples of 4 help compression.
- `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()` for surfaces seen at an angle (cap at 8 on modest targets).
- Prefer KTX2/Basis to reduce VRAM; PNG/JPG only in prototypes.

## Elight style

Showcase scenes: `--bg` background, one warm key light (`--accent`), weak cool fill, emissives in the accent color. Reference tokens in `elight-design-tokens`.
