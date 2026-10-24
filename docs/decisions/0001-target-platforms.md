# 0001: Target platforms

- Status: accepted
- Date: 2026-10-23

## Decision

Elight targets three platform groups from the start:

- Desktop (Windows first, then macOS and Linux)
- Mobile (Android and iOS)
- Web (runs directly in the browser)

## Why

The engine is built around local AI, and users should be able to ship a game that runs on whatever device the player has, without a server.

## Consequences

- The core must be portable: no platform-specific code outside a thin platform layer.
- Rendering must work on WebGPU (with a WebGL2 fallback) and on native GPU APIs.
- Local AI must have more than one backend: native inference on desktop/mobile, and in-browser inference on the web. Model size limits differ a lot per platform (see `docs/ideas.md`).
- Input must cover mouse, keyboard, touch and gamepad from day one.

## Open

- How the core is shared across platforms (see `docs/ideas.md`, "Architecture options").
