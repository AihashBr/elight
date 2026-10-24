# 0008: External libraries behind services

- Status: accepted
- Date: 2026-10-24

## Decision

No external library is used directly by components, pages or game objects. Each library is wrapped by a service, and the rest of the code only talks to that service.

Three.js (rendering, decision 0002) and Ammo.js (physics) are the first cases: only the render service imports Three.js, and only the physics service imports Ammo.js.

```
component / game object  ->  render service  ->  Three.js
component / game object  ->  physics service ->  Ammo.js
component / service      ->  zip service     ->  zip library
...                      ->  <lib> service   ->  <lib>
```

## Rules

- Only the wrapping service imports the library.
- The service exposes what the engine needs, in the engine's own terms, not a copy of the library's API.
- Library services are used by the whole app, so they live in `app/services/` (see `docs/app-structure.md`).
- Game object classes (decision 0006) also use the render service, never Three.js directly.
- The Angular framework itself is not wrapped; this rule is about the libraries the app uses.

## Why

- A library can be replaced or upgraded by changing one service.
- The same approach already holds for AI (`InferenceBackend`, decision 0003) and storage (OPFS manager, decision 0005).
- Services can be replaced by fakes in tests.
- The AI and object classes written by users see a smaller, stable API instead of a whole library.

## Render service: first API

The first version exposes only what the primitives need. Object classes use it in `onRender(render, parent)`.

| Function | Purpose |
|---|---|
| `createMesh(shape, material)` | Create a mesh from a basic shape (box, sphere, plane, cylinder, cone, capsule, torus). |
| `createMaterial(options)` | Create a material (color, texture, roughness, metalness). |
| `createLight(kind, options)` | Create an ambient, hemisphere, directional, point or spot light. |
| `createCamera(kind, options)` | Create a perspective or orthographic camera. |
| `loadModel(path)` | Load a 3D model from the project's `assets/models/`. |
| `loadTexture(path)` | Load a texture from the project's `assets/textures/`. |

- Transforms are applied by the base class (decision 0006); cleanup is done by the service.
- Three.js objects are never handed to object classes. When an advanced object needs something the API lacks, the API grows; Three.js is not exposed directly.
- The editor and the game each implement this same API (decision 0009). The API is written once as a TypeScript interface, and both implementations follow it.
