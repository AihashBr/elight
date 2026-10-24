# 0002: TypeScript core

- Status: accepted
- Date: 2026-10-23

## Decision

The engine and editor are written in TypeScript only. The editor uses Angular; rendering uses Three.js (WebGPU, with WebGL2 fallback).

## Why

- One language and one codebase for desktop, mobile and web (decision 0001).
- The in-browser AI runtimes (WebLLM, transformers.js, wllama) are JavaScript/WASM, so Rust would not help on the AI side.
- Faster iteration, and the Angular app and Three.js skills already exist.

## Consequences

- Desktop and mobile ship the same web build inside a wrapper (Tauri, Electron or Capacitor). The wrapper choice is still open.
- AI sits behind a single interface (`InferenceBackend`) so other backends, including native ones, can be added later without touching game code.
- Rust stays possible later for parts that need raw speed.
