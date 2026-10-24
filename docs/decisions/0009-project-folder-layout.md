# 0009: Project folder layout

- Status: accepted
- Date: 2026-10-24

## Decision

Creating a project creates this folder, with everything the game needs to run:

```
/projects/
  <id>/
    index.html        entry point of the game; reads game.json
    game.json         project information and the start scene
    files.json        map of file IDs to paths (decision 0013)
    libs/             the libraries the game uses, copied in on create
      three/          rendering (Three.js)
      ammo/           physics (Ammo.js)
    objects/          object classes (decision 0006)
      primitives/
        lights/
        meshes/
        colliders/
        cameras/
    attributes/       attribute classes (decision 0011)
    scenes/           scene files (decision 0007)
      main.json
    assets/           files the game uses
      models/         3D models
      textures/       images and textures
      audio/          sounds and music
```

## `index.html`

The game's entry point. It reads `game.json` and `files.json`, loads the libraries from `libs/` and opens the start scene.

`index.html` holds its own game code (it does not depend on the editor):

- reads the scene JSON and creates each object from its class, calling `onRender(render, parent)` once to draw it;
- provides the render service (Three.js) and the physics service (Ammo.js) that object classes use;
- runs the game loop, calling `onStart()` and `onUpdate(delta)`.

## Editor vs. game

The editor and `index.html` each have their own code. They are not the same code, because the editor does less:

| | Editor (Angular) | Game (`index.html`) |
|---|---|---|
| Reads scenes and creates objects | yes | yes |
| Render service (Three.js) | yes | yes |
| Physics service (Ammo.js) | no | yes |
| `onRender(render, parent)`, once per object | yes | yes |
| `onStart()` / `onUpdate(delta)` | no | yes |
| Editing tools (selection, gizmos, properties) | yes | no |

Both render services must offer the same API to object classes (`onRender(render, parent)`, decision 0006), so an object looks the same in the editor and in the game. That API is defined once as a TypeScript interface (decision 0008).

The editor and the game never render at the same time: while the game runs, the editor stops its own rendering (decision 0010).

## `game.json`

Created with the project. It is the project's metadata file (decision 0005) and says which scene opens when `index.html` runs.

```json
{
  "name": "My game",
  "engineVersion": "0.1.0",
  "startScene": "s0p4z6",
  "createdAt": "2026-10-24T12:00:00Z",
  "updatedAt": "2026-10-24T12:00:00Z"
}
```

| Field | Description |
|---|---|
| `name` | Project name, shown on the `/projects` page and in the editor's top bar. Renaming a project changes only this field. |
| `engineVersion` | Engine version that created or last saved the project, so old projects can be migrated. |
| `startScene` | File ID of the scene opened by `index.html` (decision 0013). |
| `createdAt` / `updatedAt` | Dates shown on the `/projects` page. |

## Libraries

- Rendering uses Three.js and physics uses Ammo.js.
- Libraries are copied into the project's `libs/` folder when the project is created, so the project runs on its own and its zip export is complete.
- As with every library, they are only used through services (decision 0008): a render service for Three.js and a physics service for Ammo.js.
- Ammo.js is large (WebAssembly), so `index.html` only loads it when the scene has colliders.
- A project keeps the library versions it was created with. When the editor opens a project with an older `engineVersion`, it offers to update the libraries (with a confirmation); it never updates them on its own.

## Why

- A project folder is a complete, runnable game: export it and it works.
- `game.json` gives one known place for project metadata and the start scene.
- Libraries inside the project keep each game on the versions it was built with.

## Open questions

- Measure Ammo.js size and load time on mobile.
