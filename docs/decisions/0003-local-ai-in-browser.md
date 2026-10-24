# 0003: Local AI in the browser, no back-end

- Status: accepted
- Date: 2026-10-23

## Decision

AI runs on the player's device, including in the browser. There is no server or back-end. The first target is a small model: Qwen, about 2B parameters, run with WebLLM (updated by decision 0012).

## Why

No server cost, no account, works offline after the first download, and it is the core idea of Elight.

## Consequences

- Games are static files (any CDN or static host).
- The model is downloaded once and cached in the browser (Cache API or OPFS); the UI needs progress, resume and size warning.
- Saves and NPC memory live in IndexedDB/OPFS; no cross-device sync unless exported.
- WebGPU is needed for useful speed; there must be a fallback (smaller model or scripted dialogue).
- Memory is tight on mobile, so model tiers per device are needed.
