# 0012: Local AI models

- Status: accepted
- Date: 2026-10-24

## Decision

- The first model is **Qwen, about 2B parameters** (exact variant and quantization to be picked from what WebLLM supports). This replaces the "about 3B" target of decision 0003.
- The first runtime is **WebLLM** (WebGPU).
- The structure supports many models and runtimes later, through two contracts: the **model manifest** and the **`InferenceBackend`**.

## Storage

Models are downloaded once and stored in OPFS under `/engine/models/` (decision 0004), one folder per model, shared by every project:

```
/engine/
  models/
    <model-id>/
      model.json      manifest (contract below)
      ...             weights, tokenizer and config files
```

## Contract 1: model manifest (`model.json`)

```json
{
  "id": "qwen-2b-q4",
  "name": "Qwen 2B",
  "parameters": "2B",
  "quantization": "q4",
  "runtime": "webllm",
  "contextLength": 4096,
  "capabilities": ["chat", "code", "tools"],
  "requirements": { "webgpu": true, "memoryMB": 2500 },
  "files": [
    { "path": "params_shard_0.bin", "size": 33554432, "sha256": "...", "url": "https://..." }
  ]
}
```

| Field | Description |
|---|---|
| `id` | Unique ID; also the folder name. |
| `name` | Name shown to the user. |
| `parameters` / `quantization` | Size and quantization, shown to the user. |
| `runtime` | Which `InferenceBackend` runs it (`webllm` first). |
| `contextLength` | Maximum context, in tokens. |
| `capabilities` | What it is good for (`chat`, `code`, `tools`). |
| `requirements` | What the device needs (WebGPU, memory), to warn before download. |
| `files` | Every file with size, hash and source URL: total size before download, resume, and integrity check. |

## Contract 2: `InferenceBackend`

Every runtime implements the same interface (decision 0003), so the editor and the AI chat never depend on a specific runtime (decision 0008):

| Function | Purpose |
|---|---|
| `isSupported()` | Tell whether this device can run this runtime (for example WebGPU present). |
| `load(model)` | Load a model, given its manifest. |
| `unload()` | Free the model's memory. |
| `generate(messages, options)` | Generate a reply as a stream of tokens. |
| `cancel()` | Stop the current generation. |

The first implementation wraps WebLLM. A CPU fallback (for example wllama, llama.cpp in WebAssembly) can be added later as another implementation, with no change elsewhere.

## Models service

An app service (in `app/services/`) that:

- lists the models: the engine's built-in catalog of known models, and which of them are downloaded;
- downloads a model with progress and resume;
- deletes a downloaded model;
- chooses the active model and loads it through its `InferenceBackend`.

The catalog of known models is built into the engine (a list of manifests). Adding a model by URL is not supported in the first version.

## Download

- Files are downloaded in chunks (streaming), so the model never has to fit in memory, and progress can be shown.
- An interrupted download resumes with HTTP `Range` requests.
- Writing runs in a Web Worker, using `createSyncAccessHandle` (fast, and does not block the UI).
- Each file is checked against its `sha256` when it finishes.
- Before downloading, the service checks the quota (`navigator.storage.estimate()`), shows the total size, and requests persistent storage (`navigator.storage.persist()`).

## When the download happens

The download starts when the user creates a project and no model is downloaded yet (see `docs/routes/projects.md`). It runs inside the project creation, with the shared loading modal and a warning that this first creation takes longer. If it is cancelled or fails, the project is still created without AI, and the download can resume later.

## Loading into WebLLM

WebLLM loads model files by URL. The Service Worker (decision 0010) also serves `/engine/models/<model-id>/...` from OPFS, so WebLLM reads the files from our storage. The rule from decision 0010 still holds for games: `/play/<id>/` never serves `/engine`.

## Why

- WebLLM is usually the fastest in-browser option on WebGPU (model-specific compiled GPU kernels).
- The two contracts keep the model and the runtime replaceable.
- One copy of each model, shared by all projects, under the folder already reserved for it.

## Open questions

- Benchmark before locking in: same model on WebLLM and transformers.js, on two or three target devices including a phone; measure load time, tokens per second and memory.
- Confirm which Qwen ~2B build WebLLM provides, and its download size.
- WebLLM keeps its own cache (Cache API or IndexedDB) by default; avoid storing the model twice.
- Behavior without WebGPU until a CPU fallback exists (decision 0003 asks for a fallback).
