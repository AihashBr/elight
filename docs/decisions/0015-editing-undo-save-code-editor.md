# 0015: Undo, saving and the code editor

- Status: accepted
- Date: 2026-10-24

## Undo and redo

- Every change in the editor is a **command** that knows how to undo itself: adding, removing, moving or reparenting objects, changing properties, adding or removing attributes, creating, editing, renaming or deleting files.
- The same applies to changes from the terminal and the AI: they run the same commands, so they can be undone the same way.
- One AI pipeline run (decision 0014) is a single undo step: undoing it removes every file and change it made.
- Shortcuts: `Ctrl+Z` to undo, `Ctrl+Shift+Z` or `Ctrl+Y` to redo (`Cmd` on macOS). The top bar also has undo and redo buttons, for touch devices.
- The history keeps the last 100 steps, in memory, for the open project. It is cleared when the project is closed.
- Undoing a file change restores the previous content (kept in memory with the command); undoing a file creation deletes the file, and `files.json` is updated (decision 0013).
- The script editor has its own text undo while typing; a saved file change is one step in the editor history.

## Saving

- **Autosave:** scenes, `game.json`, `files.json` and class files are saved automatically, one second after the last change.
- `Ctrl+S` saves at once.
- The top bar shows the state: "Saved", "Saving..." or "Not saved" (with the error, if saving failed).
- "Play" still saves everything first (decision 0010).

## Code editor

- The script editor tab uses **CodeMirror 6**, wrapped by a code editor service (decision 0008).
- CodeMirror is chosen over Monaco because it is much lighter and works on mobile, which is a target (decision 0001).
- Features in the first version: JavaScript highlighting, line numbers, search, and the validator's errors (decision 0014) shown inline on save.
- The tab can hold several open files, each in its own sub-tab.
- Files are opened from the properties panel (an "Edit script" button on the object section and on each attribute section) or from the terminal (`file open <path>`).

## Why

- One command model for the editor, the terminal and the AI gives one undo for all of them, which matters most for AI changes.
- Autosave fits a local app with fast storage; the history covers mistakes.
- A light, mobile-friendly code editor matches the platform targets.
