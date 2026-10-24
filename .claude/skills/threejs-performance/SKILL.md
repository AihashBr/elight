---
name: threejs-performance
description: Performance optimization and measurement in Three.js (draw calls, instancing, merging, LOD, culling, textures, memory, frame budget). Use when a scene is slow, when planning large scenes or when defining quality levels.
---

# Three.js: performance

**Measure before optimizing.** Frame budget: 16.6 ms at 60 fps (less if local AI competes for the GPU).

## Measuring

- `renderer.info.render` -> `calls`, `triangles`; `renderer.info.memory` -> `geometries`, `textures`.
- `stats.js` or `stats-gl` for FPS/ms; Chrome DevTools Performance and the Spector.js extension to capture draw calls.
- Profile on the **weakest target machine**, not just yours.
- Separate CPU cost (JS, draw calls) from GPU cost (fill-rate, shaders): lower `setPixelRatio` — if FPS goes up, the bottleneck is the GPU.

## Draw calls (the most common bottleneck)

- Starting target: < 200 draw calls for typical scenes.
- **`InstancedMesh`** for many copies of the same object (1 draw call):

```js
const mesh = new THREE.InstancedMesh(geometry, material, count);
const m = new THREE.Matrix4();
for (let i = 0; i < count; i++) { m.setPosition(x, y, z); mesh.setMatrixAt(i, m); }
mesh.instanceMatrix.needsUpdate = true;
```

- `BatchedMesh` for many different geometries sharing one material.
- Merge static geometry (`mergeGeometries` from `BufferGeometryUtils`) and share materials across meshes; avoid creating one material per object.
- Texture atlases to reduce state changes.

## Geometry and visibility

- Frustum culling is on by default; for instances, update the bounds (`computeBoundingSphere`).
- **LOD:** `THREE.LOD` with 3 levels; or impostors for distant objects.
- Reduce triangles before anything else on heavy meshes (Meshopt/gltfpack, `simplify`).
- Static objects: `matrixAutoUpdate = false` and call `updateMatrix()` once.

## Lights and shadows

- Few shadow-casting lights; baked static shadows; `shadow.autoUpdate = false` when the scene does not change, setting `needsUpdate = true` only when needed.
- Avoid many `PointLight`s; replace with IBL + emissives + bloom.

## Textures and memory

- VRAM per uncompressed texture ≈ `width × height × 4 × 1.33` bytes. A 4096² uncompressed texture ≈ 85 MB.
- Use **KTX2 (Basis/UASTC)** and mipmaps; resize to the size actually used.
- Dispose what left the scene (`dispose`, see `threejs-scene-setup`); watch `renderer.info.memory`.
- In games with local AI, **VRAM is shared with the model**: reserve a fixed slice for graphics and expose it in the editor's AI panel.

## Loop and JS

- Zero allocations per frame: reuse temporary `Vector3`/`Matrix4`/`Quaternion`; avoid `new` and closures in the loop.
- Update only what changed (`needsUpdate` only when necessary).
- Heavy work (physics, pathfinding, parsing) in Web Workers; `OffscreenCanvas` to render off the main thread when the UI is heavy.
- On-demand rendering: in static viewers, render only when something changes (`invalidate()`), saving battery.

## Adjustable quality

Define presets (low/medium/high) controlling: pixel ratio, shadow resolution and type, bloom on/off, LOD distance, instance density. Offer dynamic resolution: if the average ms exceeds the budget, lower `pixelRatio` gradually.
