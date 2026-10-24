# Route: `/projects`

- Status: planned
- Implemented by: the user (this file is documentation only)

## Purpose

Page where the user manages their games: create, open, import, export, rename and delete projects. Everything is stored locally in the browser; there is no back-end (decisions 0001 to 0004).

Reached from the home page (`/`) through the "Start" button and the "Projects" link in the navigation.

## Storage

Projects live in OPFS under `/projects`, one folder per game (see `docs/decisions/0004-opfs-storage-layout.md`). The page never reads or writes `/engine` (AI models and internal files).

Each folder is named by a fixed project ID; the project name lives in `game.json` (decisions 0005 and 0009).

```
/projects/
  <id>/         one folder per project
```

The page does not touch OPFS directly. It uses the projects service, which uses the OPFS manager (see `docs/decisions/0005-opfs-access-layer.md`).

## Features

| Feature | Description |
|---|---|
| List | Show every folder under `/projects` as a project. |
| Create | Make a new project folder with its initial files (decision 0009): `index.html`, `game.json`, `files.json`, the libraries in `libs/`, the primitive objects (decision 0006) and a `main` scene with a cube at `0 0 0` (decision 0007). |
| Open | Open the project in the editor, at `/engine/:projectId`. |
| Import | Create a project from a `.zip`. |
| Export | Save a project as a `.zip` (project folder only; never `/engine` or the AI models). |
| Rename | Change a project's name (metadata only; the folder keeps its ID). |
| Delete | Remove a project folder, after a confirmation. |

## States

- **Empty:** no projects yet. Explain what the page is and offer the main action (create or import).
- **Loading:** reading OPFS.
- **Error:** OPFS unavailable (unsupported browser or blocked storage). Say what is wrong and what the user can do.

## First project and the AI model

The AI model (decision 0012) is downloaded when a project is created and no model is downloaded yet. In practice this is the first project; later projects are created quickly.

1. The user creates a project.
2. If no AI model is downloaded, the loading modal (see `docs/app-structure.md`) shows a warning: creating this project takes longer because the AI model is being downloaded, and next time it will be faster. It also shows the download size and progress.
3. If a model is already downloaded, the warning does not appear and the project is created at once.

Cases:

- **Download cancelled or failed** (for example, the connection dropped): the project is still created and opens normally, without AI. A message says so. The download resumes from where it stopped the next time a project is created, or from the AI chat tab.
- **Device cannot run the model** (no WebGPU, or not enough memory, from `requirements` in the manifest): no download starts. An alert says the AI is not available on this device, and the project is created without AI.
- **Not enough storage**: no download starts; an alert shows how much space is needed.

## Details

- **Card:** each project shows its name, last modified date and size. No thumbnail in the first version.
- **Names:** 1 to 50 characters; letters (accents allowed), digits, spaces, `-` and `_`. Two projects may share a name (folders use IDs, decision 0005).
- **Import:** always gets a new ID, so it never clashes with an existing project. A zip without `index.html` and `game.json` at its root is rejected with an error. Before importing, a warning says the project contains code that runs with access to local data (decision 0010).
- **Delete:** permanent, after a confirmation that suggests exporting first.
- **Storage:** the page shows used space and quota. Persistent storage is requested when the first project is created.

## Open questions

None for now.
