# 0005: OPFS access layer

- Status: accepted
- Date: 2026-10-24

## Decision

All OPFS access goes through one shared layer, built from three pieces:

| Piece | Kind | Role |
|---|---|---|
| OPFS manager | Angular service, behind an interface | Generic file and folder operations. Knows nothing about projects. |
| Projects service | Angular service | Project operations used by the `/projects` page. Uses the OPFS manager. |
| Helpers | Pure functions | Path, ID and name utilities. No state. |

Pages and components never call the OPFS API directly.

Project folders are named by a fixed, generated ID, not by the project name. The name lives in the project's metadata, `game.json` (decision 0009).

```
/projects/
  <id>/         one folder per project; the name is in the metadata
```

## OPFS manager

Generic access to the two areas from decision 0004. It holds the state that functions alone cannot: the root handle, availability and quota.

| Function | Purpose |
|---|---|
| `isAvailable()` | Tell whether OPFS exists in this browser. |
| `root(area)` | Return a root limited to `projects` or `engine`. |
| `list(path)` | List the contents of a folder. |
| `exists(path)` | Tell whether a file or folder exists. |
| `readFile(path)` | Read a file as text or binary. |
| `writeFile(path, data)` | Write a file, creating missing folders. |
| `createDir(path)` | Create a folder. |
| `remove(path)` | Delete a file or a whole folder. |
| `copy(from, to)` | Copy a file or a folder. |
| `estimate()` | Report used space and quota. |
| `persist()` | Request persistent storage. |

- There is no `move`: it is not reliable across browsers. When needed, use `copy` and then `remove`.
- The `/engine` rule from decision 0004 is enforced here: callers get a root limited to one area, never a raw path into the other.
- Because it sits behind an interface, tests can use an in-memory implementation without a browser.

## Projects service

| Function | Purpose |
|---|---|
| `list()` | List projects with their metadata (name, last modified, size). |
| `get(id)` | Read one project. |
| `create(name)` | Create the project folder with a new ID and the initial files. |
| `rename(id, name)` | Change the name in the metadata; the folder stays the same. |
| `delete(id)` | Delete the project. |
| `importZip(file)` | Create a project from a zip. |
| `exportZip(id)` | Build a zip of the project. |

Zip packing uses a zip service, since every external library sits behind a service (decision 0008).

## Helpers

| Function | Purpose |
|---|---|
| `newProjectId()` | Generate a unique project ID. |
| `joinPath()` / `normalizePath()` | Build and clean paths; reject `..`. |
| `validateName(name)` | Apply the project naming rules. |

## Why

- One place for OPFS quirks, availability checks and the `/engine` rule.
- Pages stay free of file-system code.
- The editor, game saves and model downloads can reuse the same manager.
- An interface allows an in-memory fake for tests, the same approach as `InferenceBackend` (decision 0003).
- ID-named folders make rename a metadata change, which avoids moving folders, and two projects can share a name without clashing on disk.

## Notes

- Large files (AI models) need `createSyncAccessHandle`, which only works in a Web Worker. Model downloads will likely run in a worker.
- Two tabs: the editor takes a lock on the project (Web Locks API) when it opens it. If another tab already has it, the editor shows an error (shared messages component) and returns to `/projects`.
- Safari has had partial support for some OPFS APIs (for example `createWritable`). Test there, since mobile is a target.
- Naming rules (`validateName`): 1 to 50 characters after trimming spaces; letters (accents allowed), digits, spaces, `-` and `_`. Two projects may share a name, since folders use IDs. The metadata file is `game.json` (decision 0009).
