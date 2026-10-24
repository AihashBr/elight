# 0010: Run the game from OPFS with a Service Worker

- Status: accepted
- Date: 2026-10-24

## Decision

OPFS files have no URL, so a Service Worker serves them. It answers requests under a virtual path of the site and replies with files read from the project's folder in OPFS:

```
/play/<id>/index.html          ->  /projects/<id>/index.html
/play/<id>/game.json           ->  /projects/<id>/game.json
/play/<id>/libs/three/...      ->  /projects/<id>/libs/three/...
/play/<id>/scenes/main.json    ->  /projects/<id>/scenes/main.json
```

To run a game, the editor opens `/play/<id>/index.html` in an iframe. `index.html` loads its files with normal relative paths, exactly as it would on a real web server.

## Playing from the editor

- The top bar has a "Play" button.
- Before the game starts, the editor saves every open file, so the game runs the latest version.
- The game opens in a full-screen modal, with a "Close" button.
- While the game runs, the editor stops its own rendering. Closing the modal removes the iframe and the editor resumes.

## Rules

- Under `/play/<id>/`, the Service Worker only serves files inside `/projects/<id>/`. It never serves `/engine` or another project's folder there; paths with `..` are rejected.
- Separately, it serves AI model files from `/engine/models/` to the editor's WebLLM runtime (decision 0012).
- It reads OPFS through the same rules as the OPFS manager (decision 0005).
- On first visit it activates at once (`skipWaiting()` and `clients.claim()`), so the user does not need to reload.
- It also caches the editor's own files, so the editor works offline after the first visit (PWA). This fits decision 0003.
- The user installs nothing: the site registers the Service Worker itself. It needs HTTPS (or `localhost` in development).

## Why

- `index.html` works the same in the editor and on a real host: relative paths, plain `fetch`, no special loader.
- Libraries, scenes, objects and 3D models in the project folder are all reachable with no extra code.
- No back-end: everything runs in the browser (decision 0003).

## Known risks

This option was chosen over a sandboxed iframe, which would isolate the game's code but needs a custom file loader. The trade-off:

- The game runs on the same origin as the editor, so its code (object classes written by the user or the AI, or imported in a zip) can reach the whole OPFS, including other projects and `/engine`, and the editor's storage.
- A same-origin iframe usually shares the editor's main thread, so an infinite loop in game code can freeze the editor.
- The editor's viewport also runs object classes (`onRender`), with the same exposure.

## Mitigations

- **Importing a zip:** before importing, the `/projects` page warns that the project contains code that will run with access to the user's local data, and asks for confirmation. Import only from trusted sources.
- **AI-written code:** shown in the logs when the AI creates or changes an object class, so the user can see what changed.
- **Frozen game:** the game sends a heartbeat to the editor (`postMessage`) every second. If none arrives for 5 seconds, the editor offers to close the game. If the whole tab freezes, the browser offers to stop it; since files are saved before Play, nothing is lost on reload.
- **Saving before Play** also keeps work safe if the game breaks the tab.

