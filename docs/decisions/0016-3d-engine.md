# 0016: 3D engine

- Status: accepted
- Date: 2026-10-24

## Decision

Elight is a 3D engine. Games are 3D, rendered with Three.js (decision 0002) and simulated with Ammo.js (decision 0009).

## Why

- The editor, objects, primitives, cameras, gizmos and physics are already planned in 3D.
- Three.js and Ammo.js are 3D libraries.

## Notes

- 2D-style games (for example with an orthographic camera and flat sprites) remain possible inside the 3D engine, but there is no separate 2D mode.
