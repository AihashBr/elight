# Ideas and open questions

Loose notes. Anything decided moves to `docs/decisions/` and `docs/vision.md`.

## Architecture options

Constraint: desktop + mobile + browser (decision 0001).

- **A. All web:** Angular + Three.js (WebGPU), AI via in-browser runtimes (WebLLM, transformers.js, llama.cpp WASM). Mobile/desktop through PWA or a webview wrapper. Fastest to build; lowest ceiling for performance and model size.
- **B. Web editor + native runtime:** Angular editor (in Tauri/Electron, or hosted), game runtime in Rust with `llama.cpp`. The same Rust runtime also compiles to WASM for the browser. Two stacks, but each part uses the best tool.
- **C. All native:** Rust with its own UI. Coherent, but drops the Angular app.

Resolved: TypeScript only, in-browser local AI (decisions 0002 and 0003). Option A, with native wrappers for desktop and mobile.

## Model choice

Resolved: Qwen, about 2B parameters, with WebLLM (decision 0012). Notes below are kept for later models.

- Earlier candidate: Qwen at about 3B parameters, quantized (about 2 GB at 4-bit; heavy for mobile).
- Question: a Coder variant is tuned for code; for NPC dialogue an Instruct variant is likely better. Coder fits editor-side code/script generation. Possibly two models, or one Instruct model for both.
- Keep a smaller tier (about 0.5B-1.5B) for weak devices.

## Platform notes for local AI

- Browser: WebGPU is required for useful speed; models are limited by memory and download size (practically small, quantized models). Needs a clear "model not available" path.
- Mobile: tight RAM and thermal limits; expect small models and short sessions of inference.
- Desktop: the best case; can use larger quantized models with GPU offload.
- Consequence: the engine needs **capability detection** and **model tiers** (small / medium / large) chosen per device.

## Differentiators to explore

- AI inside the game loop: a scheduler that gives inference a CPU/GPU budget per frame.
- Persistent NPC memory saved with the game.
- AI in the editor: generate scenes, dialogue, behavior and scripts locally, with undo.
- Declarative NPC behavior: describe personality and goals in text.

## Open questions

- What kind of game should it run first? (RPG with talking NPCs, simulation, narrative, other)
- Who is the audience at the start?
- Minimum hardware to support?
- Is the first deliverable the editor, the runtime, or a demo game?
