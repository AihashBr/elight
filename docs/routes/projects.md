# Route: `/projects`

- Status: planned
- Implemented by: the user (this file is documentation only)

## Purpose

Page where the user manages their games: create, open, import, export, rename and delete projects. Everything is stored locally in the browser; there is no back-end (decisions 0001 to 0004).

## Storage

Projects live in OPFS under `/projects`, one folder per game (see `docs/decisions/0004-opfs-storage-layout.md`). The page never reads or writes `/engine` (AI models and internal files).

```
/projects/
  <game>/       one folder per project
```

## Features

| Feature | Description |
|---|---|
| List | Show every folder under `/projects` as a project. |
| Create | Make a new project folder with its initial files. |
| Open | Open the project in the editor. |
| Import | Create a project from a `.zip`. |
| Export | Save a project as a `.zip` (project folder only; never `/engine` or the AI models). |
| Rename | Change a project's name. |
| Delete | Remove a project folder, after a confirmation. |

## States

- **Empty:** no projects yet. Explain what the page is and offer the main action (create or import).
- **Loading:** reading OPFS.
- **Error:** OPFS unavailable (unsupported browser or blocked storage). Say what is wrong and what the user can do.

## Open questions

- What does each project card show? (name, last modified, size, thumbnail)
- Project metadata: where it is stored and its format (for example a config file inside the project folder), and which fields it has.
- Naming rules: allowed characters, max length, how name clashes are handled on create and import.
- Import: what happens on a name clash, and how an invalid or foreign zip is rejected.
- Delete: is it permanent, or is there an undo window?
- Storage: show used space and quota? Offer to request persistent storage here?
- Is the project opened by route (for example `/editor/:projectId`) or inside this page?
