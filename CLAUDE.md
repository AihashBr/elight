# Elight

Game engine focused on local AI. Targets desktop, mobile and the browser.

## Conventions

- Everything in the project is written in English: code, docs, skills, commit messages.
- The user commits manually. Never commit unless asked.
- The user implements the app code (routes, pages, components). Claude documents plans in `docs/` and only writes app code when explicitly asked. Planned routes are in `docs/routes.md`; app folder conventions are in `docs/app-structure.md`.
- Project skills live in `.claude/skills/` (design and Three.js guidance).
- Notes live in `docs/`: `vision.md` (what Elight is), `ideas.md` (loose ideas, open questions), `decisions/` (one file per decision). Only record decisions the user has confirmed.

## Layout

- `project/`: Angular 20 app (editor / web front end).
- `docs/`: vision, ideas and decisions.
- `.claude/skills/`: project skills.

## Decided

- Platforms: desktop, mobile and web (`docs/decisions/0001-target-platforms.md`).
- Language: TypeScript only; Angular editor, Three.js rendering (`docs/decisions/0002-typescript-core.md`).
- AI: local in the browser, no back-end; AI behind an `InferenceBackend` interface (`docs/decisions/0003-local-ai-in-browser.md`). Model: Qwen about 2B with WebLLM, stored in `/engine/models/` with a `model.json` manifest (`docs/decisions/0012-local-models.md`).

- Storage: OPFS with `/projects` (user content, one folder per game) and `/engine` (models and internal files, not user-editable) (`docs/decisions/0004-opfs-storage-layout.md`).
- OPFS access: one layer with an OPFS manager service (behind an interface), a projects service and pure helpers; project folders are named by ID (`docs/decisions/0005-opfs-access-layer.md`).
- Game objects: one JS class per file in the project's `objects/` folder, following a base object class contract (`docs/decisions/0006-game-objects-as-classes.md`).
- Scenes: JSON files in the project's `scenes/` folder; a new project starts with a cube at 0 0 0 (`docs/decisions/0007-scenes-as-json.md`).
- Libraries: never used directly; each external library (Three.js for rendering, Ammo.js for physics) is wrapped by a service (`docs/decisions/0008-libraries-behind-services.md`).
- Project folder: `index.html`, `game.json` (metadata and start scene), `libs/`, `objects/`, `scenes/` (`docs/decisions/0009-project-folder-layout.md`).
- Running the game: a Service Worker serves the project's files from OPFS under `/play/<id>/` (`docs/decisions/0010-run-game-with-service-worker.md`).
- Attributes: behavior split into attribute classes in the project's `attributes/` folder, added to objects from the properties panel (`docs/decisions/0011-object-attributes.md`).
- File IDs: `files.json` at the project root maps file IDs to paths; the engine refers to files by ID (`docs/decisions/0013-file-ids.md`).
- AI chat: five-agent pipeline (prompt, planner, object developer, attribute developer, test with a 3-round limit), every step shown in the chat (`docs/decisions/0014-ai-agent-pipeline.md`).
- Editing: one command history for editor, terminal and AI (undo/redo), autosave, CodeMirror 6 as code editor (`docs/decisions/0015-editing-undo-save-code-editor.md`).
- 3D engine (`docs/decisions/0016-3d-engine.md`).
- Styles: centralized in `project/src/styles/` (tokens, breakpoints, base styles for buttons, inputs, cards); components keep only their own layout (`docs/decisions/0017-central-styles.md`).

Game type, initial audience and wrapper (Tauri/Electron/Capacitor) are still open; see `docs/ideas.md`.
