# 0006: Game objects as classes in the project folder

- Status: accepted
- Date: 2026-10-24

## Decision

Every object that can be added to a scene is a JavaScript class in its own file. Every object class extends the base object class `GameObject`, provided by the engine, and follows its contract.

`GameObject` (and `GameAttribute`, decision 0011) are global classes: the editor and `index.html` each define them before loading object files, so object files use them without an `import`. Both definitions follow the same contract (decision 0009).

```js
export default class Cube extends GameObject {
  static label = 'Cube';
  static properties = [
    { name: 'color', label: 'Color', type: 'color', default: '#4f8cff' },
  ];

  onRender(render, parent) {
    const material = render.createMaterial({ color: this.properties.color });
    return render.createMesh('box', material);
  }
}
```

Object classes live in an `objects/` folder inside the project folder, grouped in subfolders. A new project starts with the engine's primitive objects, split by kind inside `objects/primitives/`:

```
/projects/
  <id>/
    objects/
      primitives/
        lights/         ambient, hemisphere, directional, point, spot
        meshes/         cube, sphere, plane, cylinder, cone, capsule, torus
        colliders/      box, sphere, capsule, cylinder, plane
                        (handled through the physics service, Ammo.js)
        cameras/        perspective, orthographic
      ...               more groups, created by the user or the AI
```

## Rules

- One class per file. Scenes refer to the class by its file ID (decision 0013); people, the terminal and the AI use its path inside `objects/`, without the extension (for example `primitives/meshes/cube`).
- The editor's "Add object" modal reads the structure of `objects/` to list the available objects; there is no separate list to keep in sync.
- Both the user and the AI can create new object classes.

## Base class contract

Fields every object has:

| Field | Description |
|---|---|
| `id` | Unique ID of this object in the scene. |
| `name` | Name shown in the world items menu. |
| `position` | `{ x, y, z }`. |
| `rotation` | `{ x, y, z }`, in degrees (converted to radians by the render service). |
| `scale` | `{ x, y, z }`. |
| `visible` | Whether the object is shown. |
| `parentId` | ID of the parent object, or none for a root object. Saved in the scene file. |
| `parent` | The parent object itself, or `null` at the root. Kept up to date by the engine, also when the object is moved to another parent. |

Static information each class declares:

| Item | Description |
|---|---|
| `label` | Name shown in the "Add object" modal. Required. |
| `attributes` | Default attributes added when the object is created (decision 0011). Optional. |
| `properties` | Definitions of the class's own editable properties (see "Properties" below). The properties panel builds its fields from it, and the AI reads it to know what it can change. |

Methods:

| Method | Description |
|---|---|
| `onRender(render, parent)` | Called once, by both the editor and the game, when the object is created. Draws what the object shows (for example a character or a simple cube) through the render service and returns that visual. `parent` is the parent object, or `null` at the root. Object classes never import Three.js (decision 0008). |
| `onStart()` | Runs when the game starts (game only; not called in the editor). |
| `onUpdate(delta)` | Runs every frame; `delta` is the time since the last frame (game only; not called in the editor). |
| `dispose()` | Frees resources (geometries, materials, textures) when the object is removed. |
| `getAttribute(type)` / `hasAttribute(type)` | Access the object's attributes (decision 0011). |
| `toJSON()` / `fromJSON(data)` | Save to and load from the scene file (decision 0007). |

Position, rotation, scale and visibility are applied by the base class, so a subclass only handles its own properties.

## Properties

There are two parts with the same name:

- `static properties` on the class: the **definitions** (which properties exist).
- `this.properties` on each object: the **values** of that object.

### Definitions

```js
static properties = [
  { name: 'color',      label: 'Color',       type: 'color',   default: '#4f8cff' },
  { name: 'intensity',  label: 'Intensity',   type: 'number',  default: 1, min: 0, max: 10, step: 0.1,
    info: 'Light strength. 0 turns it off.' },
  { name: 'castShadow', label: 'Cast shadow', type: 'boolean', default: true },
  { name: 'mode',       label: 'Mode',        type: 'select',  default: 'walk', options: ['walk', 'run'] },
  { name: 'model',      label: 'Model',       type: 'asset',   default: '', folder: 'models' },
];
```

| Key | Required | Description |
|---|---|---|
| `name` | yes | Key of the value in `this.properties` and in the scene file. |
| `label` | yes | Text shown in the properties panel. |
| `info` | no | Short help text. The properties panel shows an info icon next to the label, with this text on hover or tap. The AI also reads it. |
| `type` | yes | One of the types below. |
| `default` | yes | Value used when the object is created or when the scene has no value. |
| `min` / `max` / `step` | no | Limits for `number`. |
| `options` | for `select` | Allowed values. |
| `folder` | for `asset` | Subfolder of `assets/` to pick from (`models`, `textures` or `audio`). |

A definition missing a required key is an error: the class is treated as broken (see "Missing or broken classes") and the error goes to the logs.

### Types

| Type | Value | Field in the properties panel |
|---|---|---|
| `number` | number | Number input, with optional `min`, `max` and `step`. |
| `string` | text | Text input. |
| `boolean` | `true` / `false` | Toggle. |
| `color` | `#rrggbb` | Color picker. |
| `vector3` | `{ x, y, z }` | Three number inputs. |
| `select` | one of `options` | Drop-down list. |
| `asset` | path inside `assets/` | File picker for that folder. |
| `object` | ID of another object | Picker of objects in the scene (for example a target to follow). |

### Values

- When an object is created, each value starts at its `default`.
- The properties panel reads `static properties` and builds its fields; no object needs its own UI.
- Editing a field changes `this.properties` and saves the scene. The visual updates on "Reload scene" (see "Property changes").
- The scene file stores only the values, under `"properties"` (decision 0007), for example `"properties": { "color": "#ff0000" }`.
- When a scene is loaded, missing values get their `default`, and values for properties the class no longer has are ignored. Adding a property to a class does not break old scenes.
- `onRender` and `onUpdate` read the values, for example `this.properties.color`.

### Changes from the AI and the terminal

- The AI reads `static properties` to know which properties exist and their limits.
- Values are changed with a terminal command: `object set <id> <name> <value>`, for example `object set a1b2c3 color #ff0000`.
- The engine checks the type and the limits (`min`, `max`, `options`) before it accepts a value, and reports an error otherwise.

## Hierarchy

- Objects form a tree through `parentId`. The editor and `index.html` create objects in tree order, parents before children, so `parent` is already drawn when a child's `onRender` runs.
- The engine attaches a child's visual to its parent's visual, so moving, rotating or scaling a parent carries its children. The object class does not do this itself.
- `parent` in `onRender` is the parent at creation time. When the object is moved to another parent later (for example in the world items menu), the engine moves the visual and updates `this.parent` and `parentId`; `onRender` is not called again. Code that runs later (for example `onUpdate`) uses `this.parent`.

## Property changes

- Changes to the base fields (position, rotation, scale, visibility) show at once in the editor; the base class applies them.
- Changes to a class's own properties are saved, but the visual is not updated automatically. The editor has a "Reload scene" action that rebuilds the scene and calls `onRender(render)` again (see `docs/routes/engine.md`).

## Missing or broken classes

If a scene uses an object type whose class file is missing or fails to load:

- The scene entry is kept as it is, so no data is lost.
- The editor shows a placeholder (a wireframe box) in its place, marked with an error in the world items menu.
- The error goes to the logs. The game skips the object and logs the error.

## Why

- Objects are plain files in the project, so they are exported, imported and deleted with the project (decision 0004).
- New objects need no change to the engine: adding a file is enough.
- A single base contract lets the editor, the properties panel and the AI handle any object the same way.
- `dispose()` is part of the contract because Three.js does not free GPU memory on its own; the render service does the actual cleanup.

## Notes

- Object classes are code written by the user or the AI and are not isolated (decision 0010). The mitigations are listed there.
