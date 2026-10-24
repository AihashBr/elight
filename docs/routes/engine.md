# Route: `/engine/:projectId`

- Status: planned
- Implemented by: the user (this file is documentation only)

## Purpose

The game editor. It opens one project, chosen on the `/projects` page, by its ID (decision 0005).

If no project has that ID, the page shows an error with the shared messages component (see `docs/app-structure.md`) and returns to the home page (`/`).

If the project is already open in another tab, the page shows an error and returns to `/projects` (decision 0005).

## Layout

```
+-------------------------------------------------------------+
| Top bar: project name  [scene v] [Add object] [Reload scene] [Play] [Windows] |
+--------------+-------------------------------+--------------+
| World items  | Content (tabs)                | Properties   |
| (side menu)  |   World editor | Script editor| (side menu)  |
+--------------+-------------------------------+--------------+
| Bottom panel (tabs)                                         |
|   AI chat | Logs | Terminal | Unit tests | Git              |
+-------------------------------------------------------------+
```

## Components

Every part of the page is a component. The page's components live in a `components/` folder inside the page folder. Tabs live inside their parent component, in a `tabs/` folder, and each tab is its own component.

```
project/src/app/pages/engine/
  engine.ts / engine.html / engine.scss
  components/
    top-bar/
    add-object/             modal: pick an object to add to the scene
    add-attribute/          modal: pick an attribute to add to the selected object
    play/                   modal: runs the game in full screen
    world-items/            side menu: items in the world
    properties/             side menu: properties of the selected item
    content/                center area, with tabs
      tabs/
        world-editor/
        script-editor/
    bottom-panel/           bottom area, with tabs
      tabs/
        ai-chat/
        logs/
        terminal/
        unit-tests/
        git/
  services/                 one file per service, for example world-editor.service.ts
```

| Component | Description |
|---|---|
| Top bar | Shows the project name, the save state, the scene selector and the "Undo", "Redo", "Add object", "Reload scene", "Play" and "Windows" buttons. |
| Add object (modal) | Lists the available objects, with a search bar, and adds the chosen one to the scene. |
| Add attribute (modal) | Same as the add object modal, for the project's `attributes/` folder; adds the chosen attribute to the selected object (decision 0011). |
| Play (modal) | Runs the game in full screen, with a "Close" button (decision 0010). |
| World items | Shows the items of the scene as a tree (hierarchy). |
| Properties | Shows and edits the properties of the selected item and its attributes, with an "Add attribute" button. |
| Content | Center area with tabs. |
| World editor (tab) | Edits the open scene (a JSON file, decision 0007). |
| Script editor (tab) | Edits scripts. |
| Bottom panel | Bottom area with tabs. |
| AI chat (tab) | Talks to the local AI through the agent pipeline (decision 0014) and shows every step. If no model is downloaded, it says so and offers to download it (decision 0012). |
| Logs (tab) | Shows engine and game logs. |
| Terminal (tab) | Runs commands exposed by the other services. |
| Unit tests (tab) | First version: only an "in development" notice. |
| Git (tab) | First version: only an "in development" notice. |

## Panels

The panels (world items, properties, content and bottom panel) can be:

- **Resized:** dragged by their edges.
- **Collapsed:** hidden to free space.
- **Full screen:** one panel takes the whole editor area, and can return to its normal size.

A collapsed panel is reopened from the top bar: the "Windows" button opens a list of the panels, and choosing one shows it again.

The panel layout (sizes, collapsed and full-screen panels) is saved for the whole editor, not per project, in `/engine/settings/editor.json`.

## Top bar

| Item | Action |
|---|---|
| Project name | From `game.json`. |
| Save state | "Saved", "Saving..." or "Not saved" (decision 0015). |
| Undo / Redo | Same as `Ctrl+Z` / `Ctrl+Shift+Z` (decision 0015). |
| Scene selector | Switch, create, rename and delete scenes (decision 0007). |
| Add object | Opens the add object modal. |
| Reload scene | Rebuilds the open scene, calling `onRender(render, parent)` again. Property changes of an object's own properties only show after this (decision 0006). |
| Play | Saves open files, stops the editor's rendering and opens the game in a full-screen modal (decision 0010). |
| Windows | Lists the panels, to reopen collapsed ones. |

## World items (hierarchy)

- Items are shown as a tree that follows `parentId` (decision 0006); each item with children can be expanded or collapsed.
- Dragging an item onto another makes it a child of that item; dragging it to the root removes its parent. This changes `parentId` in the scene, and the engine moves the visual and updates `this.parent`.
- Selecting an item selects it in the world editor and shows it in the properties panel (selection service).

## Properties panel

Shows the selected object, in sections:

```
+- Properties -------------------+
| Cube                  (name)   |
|                                |
| Transform                      |  base fields (decision 0006),
|  Position  x [0]  y [0]  z [0] |  same for every object;
|  Rotation  x [0]  y [0]  z [0] |  changes show at once
|  Scale     x [1]  y [1]  z [1] |
|  Visible   [x]                 |
|                                |
| Cube                           |  the class's static properties;
|  Color (i)  [#4f8cff]          |  changes show after "Reload scene"
|                                |
| Movement                 [x]   |  one section per attribute
|  Speed (i)  [5]                |  (decision 0011), with a button
|                                |  to remove it
| [Add attribute]                |
+--------------------------------+
```

- Fields are built from the `properties` definitions: each type has its own field (decision 0006).
- `(i)` is the info icon, shown when a property has `info`; its text appears on hover or tap.
- A value outside its limits is not accepted; the field shows the error.
- With no selection, the panel shows "Select an object".

## World editor

The world editor tab shows the open scene in 3D and edits it.

- **Editor camera:** its own camera, separate from the scene's cameras. Orbit with the left mouse button or one finger; pan with the right or middle button or two fingers; zoom with the wheel or a pinch. `F` (or double-clicking an item in the world items menu) frames the selected object.
- **Selection:** clicking an object selects it; clicking empty space clears the selection. Selection is shared with the world items menu and the properties panel (selection service).
- **Gizmos:** move, rotate and scale handles on the selected object. Shortcuts: `W` move, `E` rotate, `R` scale. Holding `Ctrl` snaps (0.5 units, 15 degrees, 0.1 scale). A toggle switches between world and local axes.
- **Other shortcuts:** `Delete` removes the selected object; `Ctrl+D` duplicates it. Both can be undone (decision 0015).
- **Helpers:** a ground grid and an axes indicator. They are editor-only and never appear in the game.
- Gizmos, grid and picking go through the render service, like everything else (decision 0008).
- Objects with a missing or broken class show as a wireframe box (decision 0006).

## Script editor

Edits object and attribute classes with CodeMirror 6 (decision 0015). Several files can be open at once, one sub-tab each. Validator errors show inline on save.

## Logs

- **Levels:** info, warning, error.
- **Sources:** engine, game (the running game's console, sent from the iframe with `postMessage`), AI, terminal.
- Filters by level and by source, and a "Clear" button.
- Keeps the last 1000 entries.
- The tab title shows a badge with the number of new errors.

## Add object modal

- Opened by the "Add object" button in the top bar.
- Reads the structure of the project's `objects/` folder (decision 0006) and shows it as a list grouped by folder, for example `primitives` > `meshes` > `cube`.
- Has a search bar, since the user and the AI can create new objects and the list grows.
- Picking an object adds it to the scene through the world editor service.

## Services

Every component has a service that holds its core logic. Services live in a `services/` folder inside the page folder. Components do not talk to each other directly; they talk through services.

Example: the world editor service belongs to the world editor tab, but the world items menu, the top bar and the AI chat also use it to add items to the world.

- Selection: when an item is selected (in the world editor or in the world items menu), the properties panel shows it. Selection state lives in a service so every component sees the same selection.
- Storage: project files are read and written through the projects service and the OPFS manager (decision 0005), never through the OPFS API directly.

## Terminal

The terminal has no actions of its own. It runs commands that the other services register.

- **Registry:** the terminal service keeps a command registry. Each service registers its commands when it starts.
- **Command:** each command has a name, a short description, its arguments and a function to run.
- **Syntax:** `<group> <action> [arguments]`, where the group is the service that owns the command. For example:
  - `world add primitives/meshes/cube`
  - `world remove <itemId>`
  - `objects list`
  - `object set <id> <name> <value>` (property values: decision 0006)
  - `attribute add <objectId> <type>` (attributes: decision 0011)
  - `scene new <name>` (scene commands: decision 0007)
- **Built-in commands:** `help` lists every command (or `help <group>` for one group), and `clear` clears the terminal.
- **Output:** results and errors are printed in the terminal; errors also go to the logs service.
- The AI chat can use the same registry, so the AI and the user act on the project through the same commands.

## Open questions

None for now.
