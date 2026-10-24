# Elight

Game engine focused on local AI. Targets desktop, mobile and the browser.

## Conventions

- Everything in the project is written in English: code, docs, skills, commit messages.
- The user commits manually. Never commit unless asked.
- Project skills live in `.claude/skills/` (design and Three.js guidance).
- Notes live in `docs/`: `vision.md` (what Elight is), `ideas.md` (loose ideas, open questions), `decisions/` (one file per decision). Only record decisions the user has confirmed.

## Layout

- `project/`: Angular 20 app (editor / web front end).
- `docs/`: vision, ideas and decisions.
- `.claude/skills/`: project skills.

## Decided

- Platforms: desktop, mobile and web (`docs/decisions/0001-target-platforms.md`).
- Language: TypeScript only; Angular editor, Three.js rendering (`docs/decisions/0002-typescript-core.md`).
- AI: local in the browser, no back-end, small model (about 3B); AI behind an `InferenceBackend` interface (`docs/decisions/0003-local-ai-in-browser.md`).

- Storage: OPFS with `/projects` (user content, one folder per game) and `/engine` (models and internal files, not user-editable) (`docs/decisions/0004-opfs-storage-layout.md`).

Game type, 2D/3D, exact model and wrapper (Tauri/Electron/Capacitor) are still open; see `docs/ideas.md`.
