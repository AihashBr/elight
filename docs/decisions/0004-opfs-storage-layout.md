# 0004: OPFS storage layout

- Status: accepted
- Date: 2026-10-23

## Decision

All persistent files live in the browser's OPFS (Origin Private File System), with two top-level folders:

```
/projects/    user content, one subfolder per game
  <game>/       3D models, textures, audio, scenes, scripts, game data
/engine/      engine-internal files, not editable by the user
  models/       AI models (downloaded once)
  ...           caches and other engine data, each kind in its own subfolder
```

## Rules

- The user only reads and writes inside `/projects`. The editor UI and the engine API never expose `/engine` for direct editing.
- AI models are downloaded once into `/engine/models` and shared by every project.
- Everything that belongs to a game (assets the user adds, scenes, saves) stays inside that game's folder, so a project can be exported or deleted as a unit.

## Notes

- OPFS is private to the site's origin, but it is not a security boundary against the user: browser dev tools can reach it. The `/engine` protection is a product rule, enforced by the app.
- Request persistent storage (`navigator.storage.persist()`) so the browser does not evict models or projects under storage pressure, and check quota with `navigator.storage.estimate()` before large downloads.
- Small structured data (for example NPC memory) may still use IndexedDB; to decide later.
- Import and export of a project as a zip is a required feature, since OPFS is tied to one browser profile. Export covers only the project's folder under `/projects`, never `/engine` (models are not bundled).
