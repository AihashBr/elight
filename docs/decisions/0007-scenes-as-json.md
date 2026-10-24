# 0007: Scenes stored as JSON files

- Status: accepted
- Date: 2026-10-24

## Decision

Each scene is a JSON file inside the project folder. A project can have many scenes. The user creates new scene files from the editor or from the terminal.

```
/projects/
  <id>/
    scenes/
      main.json       created with the project
      ...             more scenes
```

The scene opened by the game is set in `startScene` in `game.json` (decision 0009).

A new project starts with one scene, `main`, that holds:

| Object | Type | Values |
|---|---|---|
| Cube | `primitives/meshes/cube` | position `0 0 0` |
| Ambient light | `primitives/lights/ambient` | low intensity, so shadows are not black |
| Directional light | `primitives/lights/directional` | position `5 10 5`, pointing at the origin |
| Camera | `primitives/cameras/perspective` | position `0 2 5`, looking at the origin |

Without a light, a lit material shows the cube black; without a camera, the game has nothing to show.

## File format

The scene file lists the objects in the scene. Each entry is the object's `toJSON()` output (decision 0006): its type, base fields and own properties.

```json
{
  "version": 1,
  "name": "main",
  "activeCamera": "c4d5e6",
  "objects": [
    {
      "id": "a1b2c3",
      "type": "f3k9x2",
      "name": "Cube",
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 },
      "scale": { "x": 1, "y": 1, "z": 1 },
      "visible": true,
      "parentId": null,
      "properties": {},
      "attributes": []
    }
  ]
}
```

(Only the cube is shown; the lights and the camera, including `c4d5e6`, follow the same shape.)

- `version` lets the engine migrate old files when the format changes.
- `type` is the file ID of the object's class (decision 0013); `files.json` gives its path, so the engine knows which class to load.
- `attributes` lists the object's attributes and their values (decision 0011).
- `activeCamera` is the ID of the camera the game uses. The editor uses its own editor camera, not this one.

## Terminal commands

The scene service registers commands in the terminal (see `docs/routes/engine.md`), for example:

- `scene new <name>`: create a new scene file.
- `scene open <name>`: open a scene in the world editor.
- `scene list`: list the project's scenes.
- `scene rename <name> <new name>`: rename a scene.
- `scene delete <name>`: delete a scene.
- `scene reload`: reload the open scene (see decision 0006, property changes).

## Rename and delete

- Scenes can be renamed and deleted from the editor (scene selector in the top bar) and from the terminal.
- `startScene` holds the scene's file ID (decision 0013), so renaming a scene does not change `game.json`.
- The start scene cannot be deleted; another scene must be made the start scene first. So a project always has at least one scene.
- Deleting the open scene opens the start scene.
- Deleting asks for confirmation (shared messages component).

## Why

- JSON is easy to read, to compare and to export with the project.
- The AI can read and write scenes in a simple, well-defined format.
- Scenes hold data only; behavior lives in the object classes (decision 0006).

## Open questions

None for now.
